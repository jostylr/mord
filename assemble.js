var marked = require('marked');
var fs = require('fs');

var publish = _"publish";

var mdyt = _"month-day-year-time";

var list = "./list.txt";
var entries = "./entries/";
var drafts = "./drafts/";
var now = new Date().getTime();

var sections;
sections = fs.readFileSync(list, {encoding:"utf8"}).split("\n");


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
                modtime = fs.statSync(ar[0]).mtime.getTime();
                if (ar[1] < modtime) {
                    publish(ar[0], ar[1]);
                    ar[2] = ar[1]; 
                    ar[1] = modtime;
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

//

//

//