import "./_entry.deps.mjs";
import "./blackprint.min.js";
import "./blackprint.sf.js";
import "./blackprint.sf.css";

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
} = window.Blackprint;

export default window.Blackprint;
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