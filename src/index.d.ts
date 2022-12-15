// Type definitions for Blackprint Sketch
// Project: https://github.com/Blackprint/Blackprint
// Module: @blackprint/sketch

import { sQuery } from "scarletsframe";
import {
	IFacePort,
	Engine,
	Interface as EngineInterface,
	Node,
	RemoteControl,
} from "@blackprint/engine";

export type { Cable, Decoration, RoutePort } from "@blackprint/engine";

export {
	Types,
	settings,
	createContext,
	getContext,
	loadScope,
	allowModuleOrigin,
	loadBrowserInterface,
	loadModuleFromURL,
	deleteModuleFromURL,
	Port,
	onModuleConflict,
	registerNode,
	registerInterface,
	Environment,
	utils,
	Engine,
	IFacePort,
	Node,
	OutputPort,
	InputPort,
	RemoteControl,
	RemoteEngine,
} from "@blackprint/engine";
export { Skeleton } from "@blackprint/engine/skeleton";

type Docs = {
	/** Description for the node */
	description?: string,
	/** Description for the input ports */
	input?:{[key: string]: {description: string}},
	/** Description for the output ports */
	output?:{[key: string]: {description: string}},
	/** Additional docs tags */
	tags?: {summary?: string},
};

type DocsPath = {[key: string]: DocsPath | Docs};

export namespace Sketch {
	/**
	 * Register interface to Blackprint (For browser only)
	 * @param icNamespace Interface component's namespace, must be started with "BPIC/"
	 * @param options You may need to specify either html or template for the Sketch UI
	 * @param class_ Class that extends Blackprint.Interface, leave this parameter empty if you want to use decorator
	 */
	export function registerInterface(icNamespace: String, options: {
		/** Keep the template cache */
		keepTemplate?: Boolean,
		/** Define ScarletsFrame's HTML template here */
		html?: String,
		/** Template path that was saved on window.templates[path] */
		template?: String,
	}, class_?: Function): void;

	/**
	 * Register node documentation to Blackprint (For browser only)
	 * @param docs documentation object
	 */
	export function registerDocs(docs: DocsPath): void;

	/**
	 * Get nodes suggestion that can be connected with the specified data type
	 * @param source Port source
	 * @param class_ Data type
	 * @param fromList Node tree like 'Blackprint.nodes'
	 */
	export function suggestNode(source: 'input' | 'output', class_: Function, fromList?: object): object;

	/**
	 * Get nodes suggestion that can be connected with specified port
	 * @param port Interface's Port object
	 */
	export function suggestNodeForPort(port: IFacePort): object;
}

/** Blackprint Sketch Instance (for browser only) */
export class Sketch extends Engine {
	/**
	 * Clone container for current instance
	 * @param minimap Set this to true if this was a minimap
	 */
	cloneContainer(minimap?: Boolean): HTMLElement;

	/**
	 * Export current instance's nodes structure and connections to JSON
	 * @param options additional options
	 */
	exportJSON(options?: {
		/** Export selected nodes only */
		selectedOnly?: Boolean,
		/** Exclude node namespace */
		exclude?: string[],
		/** JSON's whitespace/tabsize length */
		space?: Number,
		/** Set this to true if you want to also export Blackprint enviroment variables */
		environment?: Boolean,
		/** Set this to false if you don't want to include .js module URL in the export */
		module?: any,
		/** Set this to false if you don't want to export node's (x,y) position */
		position?: any,
		/** Set this to false if you don't want to export custom function */
		exportFunctions?: any,
		/** Set this to false if you don't want to export custom variable */
		exportVariables?: any,
		/** Set this to true if you don't want to serialize the object to JSON */
		toRawObject?: any,
		/** JSON.stringify's replacer */
		replacer?: any,
		/** Simplify the exported JSON for use in JavaScript */
		toJS?: any,
	}): String | object;

	/** Refresh nodes positions */
	recalculatePosition(): void;
}

/** Interface/IFace that can be used to control nodes */
export class Interface extends EngineInterface {
	/**
	 * You mustn't use this class to manually construct nodes
	 * But please use 'instance.createNode()' instead
	 * @param node
	 */
	constructor(node: Node);

	/** Node's X position */
	x: number;
	/** Node's Y position */
	y: number;

	/** Shortcut for querying HTML elements */
	$el: sQuery & ((selector:string) => sQuery);

	/** Node's description or summary (below the header's title) */
	description: string;

	/** Node's comment (above the header's title) */
	comment: string;

	/**
	 * For internal library use only, may be changed in the future
	 * 
	 * If you want to do something when user moved the node
	 * Please listen to `node.move` event on Sketch instance or on this node
	 * @param event
	 */
	moveNode(event: object): void;

	/**
	 * For internal library use only, may be changed in the future
	 * 
	 * If you want to do something when user open the node's menu
	 * Please listen to `node.menu` event on Sketch instance or on this node
	 * @param event
	 */
	nodeMenu(event: object): void;

	/**
	 * For internal library use only, may be changed in the future
	 * 
	 * If you want to do something when user clicked the node's header
	 * Please listen to `node.click` event on Sketch instance instead
	 * @param event
	 */
	swapZIndex(event: object, disableSwap: Boolean): void;

	/**
	 * For internal library use only, may be changed in the future
	 * 
	 * If you want to do something when user hovering the node
	 * Please listen to `node.hover` event on Sketch instance instead
	 * @param event
	 */
	nodeHovered(event: object): void;

	/**
	 * For internal library use only, may be changed in the future
	 * If you want to do something when user's pointer leaving the node
	 * Please listen to `node.unhover` event on Sketch instance instead
	 * @param event
	 */
	nodeUnhovered(event: object): void;
}

/**
 * [Experimental] [ToDo]
 * 
 * module @blackprint/remote-control is required
 */
export class RemoteSketch extends RemoteControl {
	/**
	 * ToDo
	 * @param instance desc
	 */
	constructor(instance: any);

	/**
	 * ToDo
	 * @param data desc
	 */
	onSyncIn(data: any): Promise<any>;
}