# [mordblog](# "version: 0.1.0 | jostylr")

This is a literate program that will compile into Mord Blog and perhaps a few other things. 

## Files

* [todo.md](#todo "save: |clean raw")
* [README.md](#readme "save:| clean raw") The standard README.
* [package.json](#npm-package "save: json  | jshint") The requisite package file for a npm project. 
* [TODO.md](#todo "save: | clean raw") A list of growing and shrinking items todo.
* [.gitignore](#gitignore "Save:") A .gitignore file


## Readme

This is the project behind the awesome Mord, servant of Kord. 

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
        "html-md" : "=3.0.2"
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





