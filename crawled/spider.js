var jsdom = require('jsdom');
var md = require('html-md');
var fs = require('fs');

var url = "http://www.jostylr.com/mordblog/me-mord/";
var entries = [];

var go = function (url, entries, done) {
        jsdom.env(url,function (errors, window) {
            var doc = window.document, 
                temp;
            console.log(url);
            var obj = {
                url : url,
                title : doc.getElementsByClassName("entry-title")[0].textContent,
                content : md(doc.getElementsByClassName("entry-content")[0].innerHTML),
                date :  (doc.querySelector(".entry-date") || {}).innerHTML || ""
            };
            temp  = obj.url.split('/');
            obj.fname = temp[temp.length -2]+".md";
            entries.push(obj);
    
            var next = doc.querySelector(".nav-next a"); 
            if (next) {
                go(next.href, entries, done);
            } else {
                done();
            }
        });
    
    };

var writecb = function (err) {
            if (err) {
                throw err;
            }
        };

var done = function () {
    var list = [];
    entries.forEach(function (el) {
        list.push(el.fname);
        var out = [el.title, "\n", el.date, 
            "\n\n",
            el.content.trim()
        ];
        fs.writeFile(el.fname, out.join(''), writecb);
    });
    fs.writeFile("list.txt", list.join("\n"), writecb);

};

go(url, entries, done);