# [mordblog](# "version: 0.1.0 | jostylr")

This is a literate program that will compile into Mord Blog and perhaps a few other things. 

## Files

* [todo.md](#todo "save: |clean raw")
* [README.md](#readme "save:| clean raw") The standard README.
* [package.json](#npm-package "save: json  | jshint") The requisite package file for a npm project. 
* [TODO.md](#todo "save: | clean raw") A list of growing and shrinking items todo.
* [.gitignore](#gitignore "Save:") A .gitignore file
* [assemble.js](#assembler "save: | jshint") assembling the blog
* [queue.js](#queuer "save: | jshint")
* [template.htm](#boilerplate "save:") the html template to insert the content in. 
* [ghpages/index.html](#intro "save: *boilerplate ") the intro to Mord
* [toc.htm](#table-of-contents "save: ") the table of contents template that assembler creates

## Modules of interest

* [slug](https://npmjs.org/package/slug) makes slug out of strings (titles)
* [rss](https://npmjs.org/package/rss) rss feed maker
* [marked](


## Readme

This is the project behind the awesome Mord, servant of Kord. 

## Common variables

These are the variables that one might want tweaked.

    var list = "./list.txt";
    var entries = "./entries/";
    var drafts = "./drafts/";
    var pages = "./ghpages/";
    var now = new Date();

## Queuer

We use the directory queue to queue up an article. 

    var slug = require("slug");
    var fs = require("fs");
    _"common variables"

    var mdyt = _"month-day-year-time";

    var files;
    _"read directory for md"

    _"date line if done"


### Read directory for md

We read the directory and put the filenames (stripped of .md) as

    files = fs.readdirSync("./drafts");
    console.log(files);
    files = files.filter(function (el) {
        return (el.slice(-3) === ".md");
    });

### date line if done

If a draft is done, then there should be a date line (which can be relative). The line after the title is the date line. A space as first character will fail the match. So one could write " Jan 28, 2014" while in draft and then shift it.
 
We match on `/^[^\n]+\n(\S[^\n]*)\n/`

    files.forEach(function(el) {
        var file = fs.readFileSync("./drafts/"+el, {encoding:"utf8"});
        var m = file.match(/^[^\n]+\n(\S[^\n]*)\n/);
        _"slug"
        if (m) {
            fs.renameSync(drafts+el, entries+selfslug);
            _"register"
        } else {
            _"slug:change"
        }
    });


#### slug

We also check the filename vs. slug and fix that up. You can skip the auto slug by having the title match [title name](slug). Note that we slug the slug to make sure it is compatible. So one could simply use the slug as a short version of the title but still have slug power it into an acceptable url form. 

Most likely the title is complicated and one does not want to repeat typing it in some slug form at first creation. 

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

[change]()

Assuming the selfslug is non-empty and different than el, we rename the draft file and we let toMove know about it if it cares. 

    if ( (selfslug) && (selfslug !== el.slice(0,-3)) ) {
         fs.rename(drafts+el, drafts+selfslug);
     }



#### register

We need to add a line at the end of the list with the date to publish and after the date a "new". 

To parse the date, we see if it is an actual date; if so we use it. We also have some recognized keywords: now, tomorrow, last, and first. The first two are the obvious, but the last two refer to ordering in a queue. The last will simply find the latest date and add a day to it for its own time. The first will search the new ones for the earliest date and then use it. It then shifts all the others by a day. If there are no new ones, then it queues for tomorrow. 

    var txtDate, releaseDate, ms;
    txtDate = m[1].toLowerCase();
    releaseDate = new Date(txtDate);
    if (isNaN(releaseDate.getTime()) ) {
        if (txtDate === "now") {
            releaseDate = now;
        } else if (txtDate === "tomorrow") {
            releaseDate = (new Date(now.getTime() + 86400000));
        } else if (txtDate === "last") {
            _"last on queue"
        } else if (txtDate === "first") {
            _"first on queue"
        } else {
            ms = (new Date()).getTime() + 86400000;        
        }
    } 
    fs.appendFileSync(list, selfslug + " " + mdyt(releaseDate) + " new");

#### First on queue

!!! Search all items in list, noting the new ones and finding the earliest time. this is the time for this new post, add a day to all the rest. 

    //

#### Last on queue

!!!  search all items in list, noting the new ones, and adding one day onto the most recent. 

    //

## Assembler

Grab the list.txt file, read the directoy, use it to assemble the links and table of contents, build new list if needed, then go through the pieces, transforming them into the html template

    var marked = require('marked');
    var fs = require('fs');
    var RSS = require('rss');
    _"common variables"

    _"rss feeds"

    var template = fs.readFileSync("template.htm", "utf8");
    var publish = _"publish";

    var mdyt = _"month-day-year-time";

    
    var sections;
    _"read list txt"

The sections are an array as the order is important. The files is a hash since this is how we will check new vs. not new. Each section is either a filename and modification date (or none if not parsed before) or it is a chapter/part heading. Each file has key as file name and then an array [true/false if needs parsing, date modified].


    var toCompile = {};
    _"check for differences"

    _"create a new list if differences"

    _"create table of contents if a new entry has been posted"

    _"loop through new entries creating"

### Read list txt

We need to grab the list file, then split it into lines. 

    oldlist = fs.readFileSync(list, {encoding:"utf8"});
    sections = oldlist.split("\n");

Next we go through each one and split into a filename and time (if any)
    
    sections.forEach(function (el, index, arr) {
        var num;

Is it a part?

        if ( (el.slice(0,1) === "# ") ) {
            arr[index] = ["#", el.slice(2)];

Is it a chapter?

        } else if ( (el.slice(0,2) === "## ") ) {
            //chapter
            arr[index] = ["##", el.slice(3)];

Should be a file. We get the time of last update and compare to latest mod time; if mod time is greater, then we compile. If no time, then it automatically should get compiled. 

        } else {
            var ar = el.split(/\s+/);

The format for signalling a new entry is  `filename time new`. We check to see that the time has passed and then we publish (compile, rss feed generate). We also modify the list.txt (regenerate it each time). 

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

These should be files without a new. If no time, then they get published. If time, they get updated if mtime is greater than given time.

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

### Publish

This does the interesting work of compiling the markdown and generating the rss feed. 

We are given a filename and possibly a time?

The procedure is: load the markdown file, transform to html, save in the html page place, and then record the item on the feeds (updates always, news if not time).

First line is the title, second line is date, then blank line, and then the body.

    function (fname, time) {

        var md = fs.readFileSync(entries + fname, "utf8");

        var htm = marked(md);
        var html = template.replace('_"*:body"', htm);
        fs.writeFileSync(ghpages+fname.replace(".md", ".html"), "utf8");
        updates.unshift([fname, md, );
        if (!time) {
            news.unshift(fname);
        }

    }


### Month-day-year-time

A short little function that takes in a Date object and outputs a mm-dd-yyyy-hh:mm which can be both human read and js parsed. 

    function (date) {
        var sep = "-";
        return date.getMonth()+sep+date.getDate()+sep+date.getFullYear()+
            sep+date.getHours()+":"+date.getMinutes();
    }

### rss feeds

This is for setting up the rss feeds. So we create two need feeds, one for new items and one that includes updates. 

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
         news = fs.readFileSync("rssnew.txt", "utf8") ;
    } catch (e) {
        news = [];
    }
    try {
        updates = fs.readFileSync("rssupdates.txt", "utf8") ;
    } catch (e) {
        updates = [];
    }

[common]()

The common fields for the feeds

    site_url : "http://mord.jostylr.com",
    author : "Mord Drom of Drok",
    managingEditor : "Janord Drom",
    webMaster : "James Taylor",
    language : "en",
    categories : ["fantasy"],
    pubDate : now.toString(),
    ttl: '1440',
    copyright : now.getFullYear() + " James Taylor"
    


### Create a new list if differences

To make the newlist, our sections array consists of subarrays to be joined by spaces, and then each of those should be joined by newlines into the text. We then compare to the old one and save if different.

    newlist = sections.map(function (el) {
        return el.join(" ");
        }).
        join("\n");

    if (newlist !== oldlist) {
        fs.renameSync("list.txt", "list_old.txt");
        fs.writeFileSync("list.txt", newlist, "utf8");
    }

### Table of contents

So we have a table of contents, a latest entries, and an rss feed to update as need be. 

    //

### Make feeds



## intro

This is the intro 

[title]()

    Mord Blog

[body](# "|marked")

    Welcome fans of Mord!

    I, the wizard of techdom, have arranged for a direct line to the ancient great Mord.

    I know, I know. We all know about what Mord did and the lessons he taught all of us. But why not get the truth from the horse’s mouth, or, rather, the half-orc’s mouth.

    New to Mord blog? Start at the beginning when [Mord first starts talking to us.](me-mord)

    Returning? Get the [latest stories of Mord](journal) and his party of brave adventurers. Live it as they live it, with that fear and excitement of not knowing what will happen next.

    Mords of Wisdom: Read Mord

## table of contents

This is where the table of contents template is.    

[title]()

    Journal

The body gets replaced with a short list (5) of the most recent.  Then it should become a set of divs with various headers.     

## boilerplate


    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>_"*:title"</title>
            <link rel="stylesheet" href="bootstrap.css">
            <style>
                #site-title h2  a {font-family: cursive; color: maroon}
                #site-title {border-bottom: medium solid #3C3C3C}
                #body {background-color: #3C3C3C}
                #body p:last-child {text-align:right; font-variant: small-caps;}
                .row {margin-bottom: 1em}
            </style> 
        </head>
        <body>
        <div class="container">
        <div class="row">
        <div class="column col-sm-2"></div>
        <div class="column col-sm-8">
        _"header"
        </div>
        <div class="column col-sm-2"></div>
        </div>
        <div class="row">
        <div class="column col-sm-2"></div>
        <div class="column col-sm-8" id="body">
        _"*:body"
        </div>
        <div class="column col-sm-2"></div>

        </div>
        </div>
        </body>
    </html>

### header 

This is the html for the header on all the mord pages.

    <div id="site-title">
        <h2>
            <a href="http://mord.jostylr.com" title="Mord Blog" rel="home">Mord Blog</a>
        </h2>
        <div id="site-description">I am Mord. I serve my lord Kord with my greatsword.</div>
    </div>


## TODO

Everything. 


## NPM package

The requisite npm package file. Use `npm run-script compile` to compile the literate program.

[](# "json") 

    {
      "name": "DOCNAME",
      "description": "I am Mord. I serve my lord Kord",
      "version": "DOCVERSION",
      "homepage": "https://github.com/GHUSER/DOCNAME",
      "author": {
        "name": "James Taylor",
        "email": "GHUSER@gmail.com"
      },
      "repository": {
        "type": "git",
        "url": "git://github.com/GHUSER/DOCNAME.git"
      },
      "bugs": {
        "url": "https://github.com/GHUSER/DOCNAME/issues"
      },
      "licenses": [
        {
          "type": "MIT",
          "url": "https://github.com/GHUSER/DOCNAME/blob/master/LICENSE-MIT"
        }
      ],
      "main": "index.js",
      "engines": {
        "node": ">.10.0"
      },
      "devDependencies" : {
        "literate-programming" : "~0.7.5"
      },
      "dependencies":{
        "jsdom" : "=0.8.8",
        "html-md" : "=3.0.2",
        "literate-programming": "~0.7.5",
        "marked": "~0.3.0",
        "slug": "~0.4.0",
        "rss": "~0.3.2"
      },
      "private":true,
      "scripts" : { 
        "compile" : "node ./node_modules/literate-programming/bin/literate-programming.js structure.md"
      }
    }

## gitignore

We should ignore node_modules (particularly the dev ones) and ghpages which is just a directory where I have the gh-pages branch repo. 

    node_modules
    ghpages





