/*global require, console*/

var list = "./list.txt";
var entries = "./entries/";
var drafts = "./drafts/";
var ghpages = "./ghpages/";
var now = new Date();

var fs = require("fs");    
var read = function (a,b) {
    console.log(a, b);
    return fs.readFileSync(a,b);
}
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
var toPublish = [];

var nav = function (arr, index) {
        var prior = index-1, 
            posterior = index+1, 
            n = arr.length,
            before = '<a href="/">&#8613; Intro</a>',
            after = '<a href="/">Restart &#8615;</a>',
            el, fname;
    
        while (prior >= 0) {
            el = arr[prior];
            fname = el[0].slice(0,-2)+"html";
            if ( (el[0] === "#") || (el[0] === "##") ) {
                prior -= 1;            
            } else {
                before = '<a href="' + 
                    fname +
                    '">&#8612; ' + 
                    el[3] + 
                    '</a>';
                break;
            }
        } 
    
        while (posterior < n) {
            el = arr[posterior];
            fname = el[0].slice(0,-2)+"html";
            if ( (el[0] === "#") || (el[0] === "##") ) {
                posterior += 1;            
            } else {
                after = '<a href="' + 
                    fname +
                    '">' + 
                    el[3] + 
                    ' &#8614;</a>';
                break;
            }
        } 
    
        return '<div id="before">'+before+'</div>' +
            '<div id="after">'+after+'</div>';
    
    }    ;

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
    var num, ar, modtime, date;

    if ( (el.slice(0,2) === "# ") ) {
        arr[index] = ["#", el.slice(2)];

    } else if ( (el.slice(0,3) === "## ") ) {
        //chapter
        arr[index] = ["##", el.slice(3)];

    } else {
        ar = el.split(/\s+/);

        if (ar[2] === "new") {
            date = new Date(ar[1]);
            num = date.getTime();
            if ( ! isNaN(num) ) {
                if (num <= now.getTime()) {
                    toPublish.push(index);
                    ar[1] = mdyt(now);
                    ar[2] = mdyt(date);
                }
            } else {
                toPublish.push(index);
                ar[1] = mdyt(now);
            }
            ar.fresh = true;

        } else if (ar[1]) {
            num = parseInt(ar[1], 10);
            if (num) {
                ar[1] = num;
                modtime = stat(entries+ar[0]).mtime.getTime();
                if (ar[1] < modtime) {
                    toPublish.push(index);
                    ar[1] = mdyt(modtime);
                }
            } else {
                toPublish.push(index);
                ar[1] = mdyt(now);         
            }

        } else {
            toPublish.push(index);
            ar[1] = mdyt(now);         
        }

        arr[index] = ar;
    }
});

var files = {};

sections.forEach(function (el) {
    var md;
    if ( (el[0] !== "#") && (el[0] !== "##") ) {
        if (el.length < 4) {
            if ( ! files[el[0]] ) {
                files[el[0]] = read(entries+el[0], "utf8");
            }
            md = files[el[0]];
            md = md.split("\n");
            el[3] = md[0];
            if (md[1]) {
                el[2] = mdyt(new Date(md[1]));
            }
        } else {
            el[3] = el.slice(3).join(" ");
            el.length = 4;
        }
    } 
});

toPublish.forEach(function (index) {
        var el = sections[index];
        var fname = el[0];
        var md = read(entries + fname, "utf8");
        md = md.split("\n");
        var title = md[0];
        var date = md[1];
        var body = md.slice(3).join("\n");
        var htm = marked(body);
    
        htm = "<h3>"+title+"</h3>"+htm;
        
    
        var html = template.replace('_"*:body"', htm);
        html = html.replace('_"*:title"', title);
        html = html.replace('<!--footer-->', nav(sections, index));
        write(ghpages+fname.replace(".md", ".html"), html, "utf8");
        updates.unshift([fname, md, el[1]] );
        if (el.fresh) {
            news.unshift([fname, md, el[1]]);
        }
    
    });

newlist = sections.map(function (el) {
    return el.join(" ");
}).join("\n");

if (newlist !== oldlist) {
    //mv("list.txt", "list_old.txt");
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
            fname : el[0].slice(0,-2)+"html",
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