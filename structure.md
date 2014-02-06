# [mordblog](# "version: 0.1.0 | jostylr")

This is a literate program that will compile into Mord Blog and perhaps a few other things. 

colors: crimson

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
* [toc.htm](#table-of-contents "save: *boilerplate ") the table of contents template that assembler creates

## Modules of interest

* [slug](https://npmjs.org/package/slug) makes slug out of strings (titles)
* [rss](https://npmjs.org/package/rss) rss feed maker
* [marked](


## Readme

This is the project behind the awesome Mord, servant of Kord. 

## Common variables

These are the variables that one might want tweaked.

    /*global require, console*/

    var list = "./list.txt";
    var entries = "./entries/";
    var drafts = "./drafts/";
    var ghpages = "./ghpages/";
    var now = new Date();

We define read and write functions so that we can easily swap in other ones (say for test runs).

    var fs = require("fs");    
    var read = fs.readFileSync;
    var write = fs.writeFileSync;
    var ls = fs.readdirSync;
    var mv = fs.renameSync;
    var append = fs.appendFileSync;
    var stat = fs.statSync;
    var render = _"render";

## Queuer

We use the directory queue to queue up an article. 

    _"common variables"

    var slug = require("slug");

    var mdyt = _"month-day-year-time";

    var files;
    _"read directory for md"

    _"date line if done"


### Read directory for md

We read the directory and put the filenames (stripped of .md) as

    files = ls("./drafts");
    files = files.filter(function (el) {
        return (el.slice(-3) === ".md");
    });

### date line if done

If a draft is done, then there should be a date line (which can be relative). The line after the title is the date line. A space as first character will fail the match. So one could write " Jan 28, 2014" while in draft and then shift it.
 
We match on `/^[^\n]+\n(\S[^\n]*)\n/`

    files.forEach(function(el) {
        var file = read("./drafts/"+el, {encoding:"utf8"});
        var m = file.match(/^[^\n]+\n(\S[^\n]*)\n/);
        _"slug"
        if (m) {
            mv(drafts+el, entries+selfslug);            
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

Assuming the selfslug is non-empty and different than el.

    if ( (selfslug) && (selfslug !== el.slice(0,-3)) ) {
         mv(drafts+el, drafts+selfslug);
    }



#### register

We need to add a line at the end of the list with the date to publish and after the date a "new". 

To parse the date, we see if it is an actual date; if so we use it. We also have some recognized keywords: now, tomorrow, or an integer which gives the number of days before release. Actually anything unrecognized leads to the next day. 

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

If the correct date of publishing is not in the second line, then we correct it. 

    if (releaseDate !== txtDate) {
        file = file.replace(/^([^\n]+\n)(\S[^\n]*)\n/, "$1"+releaseDate+"\n");
        write(entries+selfslug, file, "utf8");
    }
    append(list, selfslug + " " + mdyt(releaseDate) + " new");

!!! We may want to add a bit more queue placement manipulations. But perhaps a separate script. 

## Assembler

Grab the list.txt file, read the directoy, use it to assemble the links and table of contents, build new list if needed, then go through the pieces, transforming them into the html template

The creating a list comes first since it gets the title into the mix of the entries if it is not already there. 


    _"common variables"

    var marked = require('marked');
    var RSS = require('rss');

    _"rss feeds"

    var template = read("template.htm", "utf8");
    var toPublish = [];

    var nav = _"footer nav";

    var mdyt = _"month-day-year-time";

    
    var sections, oldlist, newlist;
    
    _"read list txt"

    var files = {};

    _"prep entries"

    toPublish.forEach(_"publish");

    _"create a new list if differences"
   
    _"creating the table of contents"


### Read list txt

The list has the following format. 

* `# Title ; description` This is a part with a title and a short description.
* `## Title ; description` This is a chapter with a title and a short description.
* `name-stuff.md date date title` is an actual entry. The first date is the last updated date, the second is the published date. Then we have the actual title. If an entry does not have a `date date title` then it gets generated. It should never have a title without the two dates. 


We need to grab the list file, then split it into lines. 

    oldlist = read(list, {encoding:"utf8"});
    sections = oldlist.split("\n");

Next we go through each one and split into a filename and time (if any)
    
    sections.forEach(function (el, index, arr) {
        var num, ar, modtime, date;

Is it a part?

        if ( (el.slice(0,2) === "# ") ) {
            arr[index] = ["#", el.slice(2)];

Is it a chapter?

        } else if ( (el.slice(0,3) === "## ") ) {
            //chapter
            arr[index] = ["##", el.slice(3)];

Should be a file. We get the time of last update and compare to latest mod time; if mod time is greater, then we compile. If no time, then it automatically should get compiled. 

        } else {
            ar = el.split(/\s+/);

The format for signalling a new entry is  `filename time new`. We check to see that the time has passed and then we publish (compile, rss feed generate). We also modify the list.txt (regenerate it each time). 

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

These should be files without a new. If no time, then they get published. If time, they get updated if mtime is greater than given time.

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

This is if the entry is in there with no time or anything. 

            } else {
                toPublish.push(index);
                ar[1] = mdyt(now);         
            }

            arr[index] = ar;
        }
    });

### Prep Entries

Make the entries all have dates, etc.

    sections.forEach(function (el) {
        var md;
        if ( (el[0] !== "#") && (el[0] !== "##")  ) {
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

### Publish

This does the interesting work of compiling the markdown and prepping the rss feed. 

We are given a filename and possibly a time?

The procedure is: load the markdown file, transform to html, save in the html page place, and then record the item on the feeds (updates always, news if not time).

First line is the title, second line is date, then blank line, and then the body.

    function (index) {
        var el = sections[index];
        var fname = el[0];
        var md = read(entries + fname, "utf8");
        md = md.split("\n");
        var title = md[0];
        var date = md[1];
        var body = md.slice(3).join("\n");
        var htm = marked(body);

Add title

        htm = "<h3>"+title+"</h3>"+htm;
        
Create the page

        var html = template.replace('_"*:body"', htm);
        html = html.replace('_"*:title"', title);
        html = html.replace('<!--footer-->', nav(sections, index));
        write(ghpages+fname.replace(".md", ".html"), html, "utf8");
        updates.unshift([fname, md, el[1]] );
        if (el.fresh) {
            news.unshift([fname, md, el[1]]);
        }

    }

### Footer Nav

We want to put the back and forward links.

    function (arr, index) {
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

    }    

### Month-day-year-time

A short little function that takes in a Date object and outputs a mm-dd-yyyy-hh:mm which can be both human read and js parsed. 

    function (date) {
        if (typeof date === "number") {
            date = new Date(date);
        }
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
 


### Create a new list if differences

To make the newlist, our sections array consists of subarrays to be joined by spaces, and then each of those should be joined by newlines into the text. We then compare to the old one and save if different.

We check to see if the title is already known. If not, then we get it. Note we are modifying sections while doing this. This is important for the publish function. 

    newlist = sections.map(function (el) {
        return el.join(" ");
    }).join("\n");

    if (newlist !== oldlist) {
        //mv("list.txt", "list_old.txt");
        //write("list.txt", newlist, "utf8");
    }

### Creating the table of contents

We want to create a table of contents and the most recent ones (the last five entries in toc, not necessarily last created)

Each part creates a new object in the structure array. Each chapter creates a new object in the current part's section. Each entry gets tacked on to the current chapter's array.

Once all of that is completed, then we loop over and create corresponding html. 

    var latest = [],
        parts = [],
        part, chapter, entry;

    sections.forEach( function (el) {
        var nd; 
        if (el[0] === "#") {
            _":part"
        } else if (el[0] === "##") {
            _":chapter"
        } else {
            _":entry"
            latest.unshift(entry);
            if (latest.length > 5) {
                latest.pop();
            }
        }
    });

    var journalOut = parts.reduce(_":part reduce", "");

    var latestOut = latest.reduce(_":entry render", 
        "<h2>The Latest</h2><ol class='latest'>") +
        "</ol>";

    var tochtm = read("toc.htm", "utf8");

    var tocOut = tochtm.replace('_"table of contents:body"',
        latestOut + journalOut);

    write(ghpages+"toc.html", tocOut, "utf8");


[part]() 

Here we figure out what to do when we encounter a part. Basically, get the name, description, and a place for chapters.
    
    nd = el[1].split(";");
    part = {name : nd[0], description : nd[1], chapters : []};
    parts.push(part);
    chapter = null;

[chapter]() 

And now we add in chapters, adding in an umbrella part if need be.

    _":no part"
    nd = el[1].split(";");
    chapter = {name: nd[0], description: nd[1], entries : []};
    part.chapters.push(chapter);

[entry]() 
   
Similarly with entry, adding a chapter if needed.

    _":no chapter"
    entry = {
        name : el.slice(3).join(""),
        fname : el[0].slice(0,-2)+"html",
        mod : el[1], 
        pub : el[2] 
    };
    chapter.entries.push(entry);



[no part]() 

    if (!part) {
        part = {name: "", description : "", chapters :[]};
        parts.push(part);
    }

[no chapter]() 


    _":no part"
    if (!chapter) {
        chapter = {name:"", description :"", entries:[]};
        part.chapters.push(chapter);
    }

[part reduce]()

Now we want to reduce the parts, creating some html that gets placed in the journal. 

    function (ret, el) {
        var heading = "<h2>"+el.name+"</h2>";
        var description = "<div class='description'>"+el.description+ "</div>";
        var chapters = el.chapters.reduce(_":chapter reduce", "");
        return ret+"<div class='part'>"+heading+description+chapters+"</div>";
    }

[chapter reduce]()

Similar story for chapters.

    function (ret, el) {
        var heading = "<h3>"+el.name+"</h3>";
        var description = "<div class='description'>"+el.description+ "</div>";
        var entries = el.entries.reduce(_":entry render", "");
        return ret+"<div class='chapter'>"+heading+description+"<ol>"+entries+"</ol></div>";
    }


[entry render]()

Just an item link

    function (ret, el) {
        var tmpl = 
            "<li data-mod='!MOD' data-pub='!PUB'>" +
                "<a href='!FNAME'>!NAME</a>" + 
            "</li>";
        return ret + render(tmpl, el);
    } 



### render

This is a simple templating function that replaces the caps version of the keys in the object with the values. Very simple. 

    function (str, obj) {
        var key;
        for (key in obj) {
            str = str.replace("!"+key.toUpperCase(), obj[key]);
        }
        return str;
    }

### Save feeds

Let's make the rss feeds. We have them already stored in updates and news. We only want the first 10. 



## intro

This is the intro 

[title]()

    Mord Blog

[body](# "|marked")

    Welcome fans of Mord!

    I, the wizard of techdom, have arranged for a direct line to the ancient great Mord.

    I know, I know. We all know about what Mord did and the lessons he taught all of us. But why not get the truth from the horse’s mouth, or, rather, the half-orc’s mouth.

    New to Mord blog? Start at the beginning when [Mord first starts talking to us.](me-mord.html)

    Returning? Get the [latest stories of Mord](toc.html) and his party of brave adventurers. Live it as they live it, with that fear and excitement of not knowing what will happen next.

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
            <link href='http://fonts.googleapis.com/css?family=Leckerli+One' rel='stylesheet' type='text/css'>
            <title>_"*:title"</title>
            <style>
                _"css"
            </style> 

        </head>
        <body>
        <div role="header">_"header"</div>
        <div role="main">_"*:body"</div>
        <div role="navigation"><!--footer--></div>
        </body>
    </html>

### header 

This is the html for the header on all the mord pages.

    <div id="site-title">
        <h1>
            <a href="http://mord.jostylr.com" title="Mord Blog" rel="home">Mord Blog</a>
        </h1>
        <p id="site-description">I am Mord. I serve my lord Kord with my greatsword.</p>
    </div>

### css

Here is the css of the page. We want one column (div width = 980px, or less). 

    body {
        background-color: black; 
        color : #999; 
        font-size: 26px;
    }
    h1, h2, h3, h4, h5, h6, a {
        font-family: 'Leckerli One', cursive; 
        color: crimson;
    }
    #site-title h1 {
        margin-bottom : 0;
    }
    #site-description { 
        margin : 0 auto;
        font-size : 20px;
    }
    div[role~=header] {
        border-bottom: thick solid #3C3C3C;
    }
    div[role~=main] {
background-color: #3C3C3C; 
    }
    div[role~=main] p:last-child {
        text-align:right; 
        font-variant: small-caps;
    }
    div[role~=main], div[role~=main] a,  #site-description {
        font-family : Times New Roman, sans-serif;
    }
    @media (min-width: 980px) {
        div[role] {
            width:980px; 
            padding : 10px;
            margin: 1em auto;
        }
    }
    @media (min-width: 500px) and (max-width: 979px) {
        div[role] {
            margin: 1em;
        }
    }

    @media (max-width: 499px) {
        div[role] {
            margin: 0.5em;
        }
    }

    div[role~=navigation] {
        position:relative
    }
    #before {
        float:left
    }
    #after {
        float:right
    }


## TODO

Generate feeds. 

Swipe up / down, left/right  to go through the site. Thinking about hammer.js for touch devices, left/right for desktop.  

Think about font selections.

Deal with pages. 

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





