# Save Mord!

The first step in finishing the tales of Mord is to got off the wordpress. So we need to grab all the content. 

This literate program will do that. 

* [crawled/spider.js](#specs "save: |jshint")


## Specs

So we need to webscrape mordblog. We load up the page, grab the content of interest, get links for the next one, through the content into a html to markdown script, compile a list of the entries in a document, in order. 

The first libraries I will attempt to use is [jsdom](https://npmjs.org/package/jsdom) for both web scraping and grabbing the content. 

The other library will be [html-md](https://npmjs.org/package/html-md) which I hope works well. It uses jsdom to use the living document to translate it. 


    var jsdom = require('jsdom');
    var md = require('html-md');

    var url = "http://www.jostylr.com/mordblog/a-maze/";
    var data = {order : []};

    var go = _"scraper";

    var done = function () {
        console.log(data);
    };

    go(url, data, done);


## Scraper

This runs jsdom to scrape, grabs al the goodies and then either quits or gets another, depending.

    function (url, data, done) {
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

    }
