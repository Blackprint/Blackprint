let fs = require('fs');
fs.mkdirSync('./code-generation/dist');

// Copy file to dist folder
var temp = fs.readFileSync('./engine-js/dist/code-generation.mjs', 'utf8');
fs.writeFileSync('./code-generation/dist/code-generation.mjs', temp);

var temp = fs.readFileSync('./engine-js/dist/code-generation.min.js', 'utf8');
fs.writeFileSync('./code-generation/dist/code-generation.min.js', temp);

var temp = fs.readFileSync('./engine-js/dist/code-generation.min.js.map', 'utf8');
fs.writeFileSync('./code-generation/dist/code-generation.min.js.map', temp);