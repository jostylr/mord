#! /bin/bash
echo "starting literate-programming"
./node_modules/.bin/literate-programming structure.md
echo "assembling"
node assemble.js
echo "done"