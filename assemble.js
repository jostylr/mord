/*global require, console*/

var list = "./list.txt";
var entries = "./entries/";
var drafts = "./drafts/";
var ghpages = "./ghpages/";
var now = new Date();

var fs = require("fs");    
var read = fs.readFileSync;
var write = fs.writeFileSync;
var ls = fs.readdirSync;
var mv = fs.renameSync;
var append = fs.appendFileSync;
var stat = fs.statSync;
var render = function (str, obj) {
        var key;
        for (key in obj) {
            str = str.replace("!"+key.toUpperCase(), obj[key]);
        }
        return str;
    };

var marked = require('marked');
var RSS = require('rss');

var feedNew = new RSS({
    title: "Mord",
    description : "I am Mord. I serve my lord Kord with my greatsword.",
    feed_url : "http://mord.jostylr.com/rss.xml",
    site_url : "http://mord.jostylr.com",
    author : "Mord Drom of Drok",
    managingEditor : "Janord Drom",
    webMaster : "James Taylor",
    language : "en",
    categories : ["fantasy"],
    pubDate : now.toString(),
    ttl: '1440',
    copyright : now.getFullYear() + " James Taylor"
});

var rssUpdate = new RSS({
    title: "Mord Update",
    description : "I am Mord. I serve my lord Kord with my greatsword. Misspeak I do.",
    feed_url : "http://mord.jostylr.com/rssupdate.xml",
    site_url : "http://mord.jostylr.com",
    author : "Mord Drom of Drok",
    managingEditor : "Janord Drom",
    webMaster : "James Taylor",
    language : "en",
    categories : ["fantasy"],
    pubDate : now.toString(),
    ttl: '1440',
    copyright : now.getFullYear() + " James Taylor"
});

var news, updates;
try {
     news = read("rssnew.txt", "utf8") ;
} catch (e) {
    news = [];
}
try {
    updates = read("rssupdates.txt", "utf8") ;
} catch (e) {
    updates = [];
}


var template = read("template.htm", "utf8");
var publish = function (fname, time) {
    
        var md = read(entries + fname, "utf8");
    
        var htm = marked(md);
        var html = template.replace('_"*:body"', htm);
        write(ghpages+fname.replace(".md", ".html"), html, "utf8");
        updates.unshift([fname, md, time] );
        if (!time) {
            news.unshift([fname, md, time]);
        }
    
    };

var mdyt = function (date) {
        if (typeof date === "number") {
            date = new Date(date);
        }
        var sep = "-";
        return date.getMonth()+sep+date.getDate()+sep+date.getFullYear()+
            sep+date.getHours()+":"+date.getMinutes();
    };


var sections, oldlist, newlist;
oldlist = read(list, {encoding:"utf8"});
sections = oldlist.split("\n");


sections.forEach(function (el, index, arr) {
    var num, ar, modtime;

    if ( (el.slice(0,2) === "# ") ) {
        arr[index] = ["#", el.slice(2)];

    } else if ( (el.slice(0,3) === "## ") ) {
        //chapter
        arr[index] = ["##", el.slice(3)];

    } else {
        ar = el.split(/\s+/);

        if (ar[2] === "new") {
            num = parseInt(ar[1], 10);
            if (num) {
                if (num <= now.getTime()) {
                    publish(ar[0]);
                    ar[1] = mdyt(now);
                    ar[2] = mdyt(num);
                }
            } else {
                publish(ar[0]);
                ar[2] = ar[1] = mdyt(now);
            }

        } else if (ar[1]) {
            num = parseInt(ar[1], 10);
            if (num) {
                ar[1] = num;
                modtime = stat(entries+ar[0]).mtime.getTime();
                if (ar[1] < modtime) {
                    publish(ar[0], ar[1]);
                    if (!ar[2]) {
                        ar[2] = mdyt(ar[1]); 
                    }
                    ar[1] = mdyt(modtime);
                }
            } else {
                publish(ar[0]);
                ar[2] = ar[1] = mdyt(now);         
            }

        } else {
            publish(ar[0]);
            ar[2] = ar[1] = mdyt(now);         
        }

        arr[index] = ar;
    }
});

console.log(sections);

var files = {};

newlist = sections.map(function (el) {
    var md;
    console.log(el);
    if ( (el.length < 4) && (el[0] !== "#") && (el[0] !== "##") ) {
        if ( ! files[el[0]] ) {
            files[el[0]] = read(entries+el[0], "utf8");
        }
        md = files[el[0]];
        md = md.split("\n");
        el[3] = md[0];
        if (md[1]) {
            el[2] = mdyt(new Date(md[1]));
        }
    } 
    return el.join(" ");
}).
join("\n");
if (newlist !== oldlist) {
    //mv("list.txt", "list_old.txt");
    console.log("would save list to: ", newlist);
    //write("list.txt", newlist, "utf8");
}

var latest = [],
    parts = [],
    part, chapter, entry;

sections.forEach( function (el) {
    var nd; 
    if (el[0] === "#") {
        nd = el[1].split(";");
        part = {name : nd[0], description : nd[1], chapters : []};
        parts.push(part);
        chapter = null;
    } else if (el[0] === "##") {
        if (!part) {
            part = {name: "", description : "", chapters :[]};
            parts.push(part);
        }
        nd = el[1].split(";");
        chapter = {name: nd[0], description: nd[1], entries : []};
        part.chapters.push(chapter);
    } else {
        if (!part) {
            part = {name: "", description : "", chapters :[]};
            parts.push(part);
        }
        if (!chapter) {
            chapter = {name:"", description :"", entries:[]};
            part.chapters.push(chapter);
        }
        entry = {
            name : el.slice(3).join(""),
            fname : el[0],
            mod : el[1], 
            pub : el[2] 
        };
        chapter.entries.push(entry);
        latest.unshift(entry);
        if (latest.length > 5) {
            latest.pop();
        }
    }
});

var journalOut = parts.reduce(function (ret, el) {
        var heading = "<h2>"+el.name+"</h2>";
        var description = "<div class='description'>"+el.description+ "</div>";
        var chapters = el.chapters.reduce(function (ret, el) {
                var heading = "<h3>"+el.name+"</h3>";
                var description = "<div class='description'>"+el.description+ "</div>";
                var entries = el.entries.reduce(function (ret, el) {
                        var tmpl = 
                            "<li data-mod='!MOD' data-pub='!PUB'>" +
                                "<a href='!FNAME'>!NAME</a>" + 
                            "</li>";
                        return ret + render(tmpl, el);
                    } , "");
                return ret+"<div class='chapter'>"+heading+description+"<ol>"+entries+"</ol></div>";
            }, "");
        return ret+"<div class='part'>"+heading+description+chapters+"</div>";
    }, "");

var latestOut = latest.reduce(function (ret, el) {
        var tmpl = 
            "<li data-mod='!MOD' data-pub='!PUB'>" +
                "<a href='!FNAME'>!NAME</a>" + 
            "</li>";
        return ret + render(tmpl, el);
    } , 
    "<h2>The Latest</h2><ol class='latest'>") +
    "</ol>";

var tochtm = read("toc.htm", "utf8");

var tocOut = tochtm.replace('_"table of contents:body"',
    latestOut + journalOut);

write(ghpages+"toc.html", tocOut, "utf8");