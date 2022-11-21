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