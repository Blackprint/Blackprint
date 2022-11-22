// This can be used with bundler that accept ES6 module

// In Browser you can also load with <script type="module">
// In Node.js `import Blackprint from "@blackprint/sketch/mjs";`
// In Node.js `let Blackprint = require("@blackprint/sketch/cjs");`

import "./_entry.deps.mjs";
import "./blackprint.min.js";
import "./blackprint.sf.js";

const {
	settings,
	createContext,
	getContext,
	loadScope,
	allowModuleOrigin,
	Sketch,
	Port,
	loadModuleFromURL,
	nodes,
	Node,
	registerNode,
	registerInterface,
	Interface,
	Engine,
	Environment,
	space,
	modulesURL,
	template,
	availableNode,
} = globalThis.Blackprint;

export default globalThis.Blackprint;
export {
	settings,
	createContext,
	getContext,
	loadScope,
	allowModuleOrigin,
	Sketch,
	Port,
	loadModuleFromURL,
	nodes,
	Node,
	registerNode,
	registerInterface,
	Interface,
	Engine,
	Environment,
	space,
	modulesURL,
	template,
	availableNode,
};