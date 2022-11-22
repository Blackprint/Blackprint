// This can be used with bundler that accept ES6 module

// In Node.js `import Blackprint from "@blackprint/sketch/mjs";`
// In Node.js `let Blackprint = require("@blackprint/sketch/cjs");`

if(globalThis.HTMLVideoElement == null){
	throw new Error("Blackprint Sketch is designed for Browser only, and shouldn't to be used for Node.js or Deno. This module can still be loaded on Node.js for testing purpose only with Jest.");
}

// Make sure to load the framework first
globalThis.sf = require("scarletsframe/dist/scarletsframe.modern.js");

// And then the engine
require('@blackprint/engine');

// Then the sketch library
require('./blackprint.min.js');
require('./blackprint.sf.js');

// The sketch .css is optional and need to be required manually if needed