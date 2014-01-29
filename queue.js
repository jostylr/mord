var slug = require("slug");
var fs = require("fs");
var list = "./list.txt";
var entries = "./entries/";
var drafts = "./drafts/";
var now = new Date().getTime();

var files;
files = fs.readdirSync("./drafts");
console.log(files);
files = files.filter(function (el) {
    return (el.slice(-3) === ".md");
});

files.forEach(function(el) {
    var file = fs.readFileSync("./drafts/"+el, {encoding:"utf8"});
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
        fs.renameSync(drafts+el, entries+selfslug);
        var txtDate, releaseDate, ms;
        txtDate = m[1].toLowerCase();
        releaseDate = new Date(txtDate);
        if (releaseDate && releaseDate.hasOwnProperty("getTime") ) {
            ms = releaseDate.getTime();
        }
        if (!ms || isNaN(ms) ) {
            if (txtDate === "now") {
                ms = now;
            } else if (txtDate === "tomorrow") {
                ms = (new Date()).getTime() + 86400000;
            } else if (txtDate === "last") {
                //
            } else if (txtDate === "first") {
                //
            } else {
                ms = (new Date()).getTime() + 86400000;        
            }
        }
        fs.appendFileSync(list, selfslug + " " + ms + "new");
    } else {
        if ( (selfslug) && (selfslug !== el.slice(0,-3)) ) {
             fs.rename(drafts+el, drafts+selfslug);
         }
    }
});