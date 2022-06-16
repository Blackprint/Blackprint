// Type definitions for Blackprint Sketch, still not perfect yet
// Project: https://github.com/Blackprint/Blackprint
// Definitions by: StefansArya <https://github.com/stefansarya>

import { sQuery } from "scarletsframe";
import {
	settings,
	getContext,
	createContext,
	loadScope,
	allowModuleOrigin,
	loadBrowserInterface,
	loadModuleFromURL,
	deleteModuleFromURL,
	Port,
	IFacePort,
	onModuleConflict,
	registerNode,
	registerInterface,
	Environment,
	utils,
	Engine,
	Interface as EngineInterface,
	Node,
	OutputPort,
	InputPort,
	RemoteControl,
	RemoteEngine,
} from "@blackprint/engine-js";
// } from "../engine-js/src";

export {
	settings,
	getContext,
	createContext,
	loadScope,
	allowModuleOrigin,
	loadBrowserInterface,
	loadModuleFromURL,
	deleteModuleFromURL,
	Port,
	IFacePort,
	onModuleConflict,
	registerNode,
	registerInterface,
	Environment,
	utils,
	Engine,
	Node,
	OutputPort,
	InputPort,
	RemoteControl,
	RemoteEngine,
} from "@blackprint/engine-js";
// } from "../engine-js/src";

type Docs = {
	tags: {summary: string},
	description: string,
	input:{[key: string]: {description: string}},
	output:{[key: string]: {description: string}},
};

type DocsPath = {[key: string]: DocsPath | Docs};

export namespace Sketch {
	/**
	 * Register interface to Blackprint (For browser only)
	 * @param icNamespace Interface component's namespace
	 * @param options You may need to specify either html or template for the Sketch UI
	 * @param clazz Class that extends Blackprint.Interface
	 */
	export function registerInterface(icNamespace: String, options: {
		keepTemplate?: Boolean,
		html?: String,
		template?: String,
	}, clazz: Function): void;

	/**
	 * Register interface to Blackprint (For browser only)
	 * @param icNamespace Interface component's namespace
	 * @param options You may need to specify either html or template for the Sketch UI
	 * @param clazz Class that extends Blackprint.Interface
	 */
	export function registerDocs(docs: DocsPath): void;

	/**
	 * Get nodes suggestion that can be connected with the specified data type
	 * @param source Port source
	 * @param clazz Data type
	 * @param fromList Node tree like 'Blackprint.nodes'
	 */
	export function suggestNode(source: 'input' | 'output', clazz: Function, fromList?: object): object;

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

	$el: sQuery & ((selector:string) => sQuery);

	/** Node's ID */
	get id(): any;
	set id(val: any);

	/**
	 * For internal library use only, may be changed in the future
	 * @param event
	 */
	moveNode(event: object): void;

	/**
	 * For internal library use only, may be changed in the future
	 * @param event
	 */
	nodeMenu(event: object): void;

	/**
	 * For internal library use only, may be changed in the future
	 * @param event
	 */
	swapZIndex(event: object, disableSwap: Boolean): void;

	/**
	 * For internal library use only, may be changed in the future
	 * @param event
	 */
	nodeHovered(event: object): void;

	/**
	 * For internal library use only, may be changed in the future
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