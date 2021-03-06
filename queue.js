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

var slug = require("slug");

var mdyt = function (date) {
        if (typeof date === "number") {
            date = new Date(date);
        }
        var sep = "-";
        return date.getMonth()+sep+date.getDate()+sep+date.getFullYear()+
            sep+date.getHours()+":"+date.getMinutes();
    };

var files;
files = ls("./drafts");
files = files.filter(function (el) {
    return (el.slice(-3) === ".md");
});

files.forEach(function(el) {
    var file = read("./drafts/"+el, {encoding:"utf8"});
    var m = file.match(/^[^\n]+\n(\S[^\n]*)\n/);
        var title = file.match(/^([^\n]+)\n/);
        var selfslug = el.slice(0,-3);
        if (title) {
            selfslug = title.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (selfslug) {
                selfslug = slug(selfslug[2]);
            } else {
                selfslug = slug(title);
            }
        }
    if (m) {
        mv(drafts+el, entries+selfslug);            
        var txtDate, releaseDate, releaseDay;
        txtDate = m[1].toLowerCase();
        releaseDay = parseInt(txtDate, 10);
        releaseDate = new Date(txtDate);
        if (releaseDay.toStr() === releaseDay) {
            releaseDate = (new Date(now.getTime() + 86400000*releaseDay));
        } else if (isNaN(releaseDate.getTime()) ) {
            if (txtDate === "now") {
                releaseDate = now;
            } else {
                releaseDate = (new Date(now.getTime() + 86400000));
            }
        } 
        
        if (releaseDate !== txtDate) {
            file = file.replace(/^([^\n]+\n)(\S[^\n]*)\n/, "$1"+releaseDate+"\n");
            write(entries+selfslug, file, "utf8");
        }
        append(list, selfslug + " " + mdyt(releaseDate) + " new");
    } else {
        if ( (selfslug) && (selfslug !== el.slice(0,-3)) ) {
             mv(drafts+el, drafts+selfslug);
        }
    }
});