var marked = require('marked');
var fs = require('fs');
var list = "./list.txt";
var entries = "./entries/";

var sections;
sections = fs.readFileSync(list, {encoding:"utf8"}).split("\n");


sections.forEach(function (el, index, arr) {
    var num;
    var ar = el.split(/\s+/);
    if (ar[1]) {
        num = parseInt(ar[1], 10);
        if (num) {
            ar[1] = num;
        }
    }
    arr[index] = ar;
});

console.log(sections);

var toCompile = {};
//

//

//

//