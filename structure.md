# [mordblog](# "version: 0.1.0 | jostylr")

This is a literate program that will compile into Mord Blog and perhaps a few other things. 

## Files

* [todo.md](#todo "save: |clean raw")
* [README.md](#readme "save:| clean raw") The standard README.
* [package.json](#npm-package "save: json  | jshint") The requisite package file for a npm project. 
* [TODO.md](#todo "save: | clean raw") A list of growing and shrinking items todo.
* [.gitignore](#gitignore "Save:") A .gitignore file
* [assembler.js](#assembler "save: | jshint") assembling the blog
* [template.htm](#boilerplate "save:") the html template to insert the content in. 
* [ghpages/index.html](#intro "save: *boilerplate ") the intro to Mord
* [toc.htm](#table-of-contents "save: | jshint") the table of contents template that assembler creates

## Modules of interest

* [slug](https://npmjs.org/package/slug) makes slug out of strings (titles)
* [


## Readme

This is the project behind the awesome Mord, servant of Kord. 

## Common variables

These are the variables that one might want tweaked.

    var list = "./list.txt";
    var entries = "./entries/";
    var drafts = "./drafts/";

## Queuer

We use the directory queue to queue up an article. 

    var slug = require("slug");

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

        var title = file.match(/^([^\n]+)\n);
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

    if ( (selfslug) && (selfslug !== el.slice(0,-3) ) {
         fs.rename(drafts+el, drafts+selfslug);
     }



#### register

We need to add a line at the end of the list with the date to publish and after the date a "new"

    time = m[1];
    if 
    fs.appendFileSync(list, selfslug + " " + 

## Assembler

Grab the list.txt file, read the directoy, use it to assemble the links and table of contents, build new list if needed, then go through the pieces, transforming them into the html template

    var marked = require('marked');
    var fs = require('fs');
    _"common variables"

    var sections;
    _"read list txt"

The sections are an array as the order is important. The files is a hash since this is how we will check new vs. not new. Each section is a title and modification date (or none if not parsed before). Each file has key as file name and then an array [true/false if needs parsing, date modified].


    var toCompile = {};
    _"check for differences"

    _"create a new list if differences"

    _"create table of contents if a new entry has been posted"

    _"loop through new entries creating"

### Read list txt

We need to grab the list file, then split it into lines. 

    sections = fs.readFileSync(list, {encoding:"utf8"}).split("\n");

Next we go through each one and split into a filename and time (if any)
    
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



### Check for differences

Delete filenames if they are not to be recompiled.

    //

### Create a new list if differences

    //

### Create table of contents if a new entry has been posted

So we have a table of contents, a latest entries, and an rss feed to update as need be. 

    //

### Loop through new entries creating

    //



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
                article {background-color: #3C3C3C}
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
        <div class="column col-sm-8">
        _"*:body"
        </div>
        <div class="column col-sm-2"></div>

        </div>
        </div>
        </body>
    </html>

### header 

This is the html for the header on all the mord pages

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
        "slug" : "~0.4.0"
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





