var jsdom = require('jsdom');
var md = require('html-md');

var url = "http://www.jostylr.com/mordblog/a-maze/";
var data = {order : []};

var go = function (url, data, done) {
        jsdom.env(url,function (errors, window) {
            var doc = window.document;
            console.log(url);
            var obj = {
                title : doc.getElementsByClassName("entry-title")[0].textContent,
                content : md(doc.getElementsByClassName("entry-content")[0].innerHTML),
                date :  (doc.querySelector(".entry-date") || {}).innerHTML || ""
            };
            data.order.push(url, obj.title);
            data[url] = obj;
    
            var next = doc.querySelector(".nav-next a"); 
            if (next) {
                go(next.href, data, done);
            } else {
                done();
            }
        });
    
    };

var done = function () {
    console.log(data);
};

go(url, data, done);