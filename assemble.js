var marked = require('marked');
var RSS = require('rss');
var list = "./list.txt";
var entries = "./entries/";
var drafts = "./drafts/";
var pages = "./ghpages/";
var now = new Date();

var fs = require("fs");    
var read = fs.readFileSync;
var write = fs.writeFileSync;
var ls = fs.readdirSync;
var mv = fs.renameSync;
var append = fs.appendFileSync;
var stat = fs.statSync;

var feedNew = new RSS({
    title: "Mord",
    description : "I am Mord. I serve my lord Kord with my greatsword.",
    feed_url : "http://mord.jostylr.com/rss.xml",
    _":common"
});

var rssUpdate = new RSS({
    title: "Mord Update",
    description : "I am Mord. I serve my lord Kord with my greatsword. Misspeak I do.",
    feed_url : "http://mord.jostylr.com/rssupdate.xml",
});

var news, udates;
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
        var sep = "-";
        return date.getMonth()+sep+date.getDate()+sep+date.getFullYear()+
            sep+date.getHours()+":"+date.getMinutes();
    };


var sections;
oldlist = read(list, {encoding:"utf8"});
sections = oldlist.split("\n");


sections.forEach(function (el, index, arr) {
    var num;

    if ( (el.slice(0,1) === "# ") ) {
        arr[index] = ["#", el.slice(2)];

    } else if ( (el.slice(0,2) === "## ") ) {
        //chapter
        arr[index] = ["##", el.slice(3)];

    } else {
        var ar = el.split(/\s+/);

        if (ar[2] === "new") {
            num = parseInt(ar[1], 10);
            if (num) {
                if (num <= now) {
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
                modtime = stat(ar[0]).mtime.getTime();
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
        }
        arr[index] = ar;
    }
});

console.log(sections);

var toCompile = {};
_"check for differences"

newlist = sections.map(function (el) {
    var md;
    if ( (el.length < 3) ) {
        if (! files[el[0]] ) {
            files[el[0]] = read(entries+el[0], "utf8");
        }
        md = files[el[0]];
        el[3] = md.split("\n")[0];
    } 
    return el.join(" ");
    }).
    join("\n");

if (newlist !== oldlist) {
    mv("list.txt", "list_old.txt");
    write("list.txt", newlist, "utf8");
}

_"create table of contents if a new entry has been posted"

_"loop through new entries creating"