// Type definitions for Blackprint, still not perfect yet
// Project: https://github.com/Blackprint/Blackprint
// Definitions by: StefansArya <https://github.com/stefansarya>

/**
 * Change global Blackprint settings
 * @param which setting name
 * @param value or data 
 */
export function settings(which: String, value: any): void;

/**
 * Wait and get module's shared context that being created on different .js file
 * @param name desc
 */
export function getContext(name: String): Promise<object>;

/**
 * Create shared context for a module
 * @param name desc
 */
export function createContext(name: String): object;

/**
 * Create an object that extend Blackprint object with additional options.
 * @param options desc
 */
export function loadScope(options: {url: String, css?: Boolean}): any;

/**
 * Block module loading that are not from the list
 * @param list [...URL], '*' allow all, 'false' disable this feature
 */
export function allowModuleOrigin(list: Array<String> | '*' | false): void;

/** Set this to false if you don't want to load .sf.js and .sf.css when loading module */
export let loadBrowserInterface: Boolean;

/**
 * Load nodes module from URL
 * @param url URL to the .mjs file
 * @param options 'loadBrowserInterface' Set this to false if you don't want to load .sf.js and .sf.css when loading module
 */
export function loadModuleFromURL(url: String | Array<String>, options?: {
	loadBrowserInterface: Boolean,
}): Promise<any>;

/**
 * Dynamically delete all nodes that was registered from an URL that pointing to .mjs file
 * @param url URL to the .mjs file
 */
export function deleteModuleFromURL(url: String): void;

export namespace Port {
	/**
	 * This port can contain multiple cable as input and the input port will return an array
 	 * it's only one type, not union
 	 * for union port, please split it to different port to handle it
	 * @param type Type Data that allowed for the Port 
	 */
	export function ArrayOf(type: Array<any>): any;

	/**
	 * This port can have default value if no cable was connected
	 * @param type Type Data that allowed for the Port 
	 * @param value default value when no cable was connected
	 */
	export function Default(type: any, value: any): any;

	/** Only can be passed to Output port as type */
	export let Route: object;

	/**
	 * This port will be used as a trigger or callable input port
	 * @param func callback when the port was being called as a function 
	 */
	export function Trigger(func: any): any;

	/**
	 * This port can allow multiple different types
	 * like an 'any' port, but can only contain one value
	 * @param types Allowed data types
	 */
	export function Union(types: Array<any>): any;
}

/**
 * This function need to be replaced if you want to use this to solve conflicting nodes
 * - if throw error it will stop the import process
 * @param map Conflicting module map
 * @returns [ToDo] you may need to return String or the modified map
 */
export function onModuleConflict(map: Map<string, string>): Promise<any>;

/**
 * Register nodes to Blackprint (For browser and non-browser).
 * @param namespace Node namespace
 * @param clazz Class that extends Blackprint.Node
 */
export function registerNode(namespace: String, clazz: Function): void;

/**
 * Register interface to Blackprint (For browser and non-browser).
 * If you're creating Sketch UI, you will need to register with Blackprint.Sketch.registerInterface too.
 * @param icNamespace Interface component's namespace
 * @param clazz Class that extends Blackprint.Interface
 */
export function registerInterface(icNamespace: String, clazz: Function): void;

export namespace Environment {
	/**
	 * Blackprint's environment variables
	 * You can use this object to obtain value
	 * To set value, you must use .set() function
	 */
	export let map: {[key: string]: string};

	/** 
	 * Change this to false if you want to load module from node_modules
	 * This will default to true if running on Browser/Deno
	 * and false if running on Node.js
	 */
	export let loadFromURL: Boolean;

	/** This will be true if current environment is Browser */
	export let isBrowser: Boolean;

	/** This will be true if current environment is Node.js */
	export let isNode: Boolean;

	/** This will be true if current environment is Deno */
	export let isDeno: Boolean;

	/**
	 * Assign object value to Blackprint environment variables
	 * @param obj List of environment variables in key-value object
	 */
	function _import(obj: {[key: string]: string}): void;
	export { _import as import };

	/**
	 * Set Blackprint environment variable
	 * @param key variable name
	 * @param value variable value in string
	 */
	export function set(key: string, value: string): void;

	/**
	 * Delete Blackprint environment variable
	 * @param key variable name
	 */
	function _delete(key: string): void;
	export { _delete as delete };
}

export namespace utils {
	/**
	 * Use this to rename a class name.
	 * This can help you fix your class name if it's being minified by compiler.
	 * @param obj List of class that will be renamed, with format {"name": class}
	 */
	export function renameTypeName(obj: {[name: string]: Function}): void;

	/**
	 * Use this to determine if the version is newer or older.
	 * Can only work if the URL contains semantic versioning like '/nodes@1.0.0/file.mjs'
	 * @param old CDN URL to the .mjs file
	 * @param now CDN URL to the .mjs file
	 */
	export function packageIsNewer(old: string, now: string): Boolean;

	/**
	 * Use this to make a class prototype enumerable.
	 * For example you're creating a class with getter/setter that was not enumerable by default.
	 * @param clazz class declaration that want to be modified
	 * @param props property that want to be modified
	 */
	export function setEnumerablePrototype(clazz: Function, props: {[key: string]: Boolean}): void;
}

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

type EventOptions = {
	/** Give unique ID for the listener */
	slot?: string,
};

/** Simplified event emitter */
declare class CustomEvent {
	/**
	 * Listen to an event
	 * @param eventName event name
	 * @param callback function that will be triggered each time an event is emitted
	 * @param options additional registration options
	 */
	on(eventName: string, callback: (data?: object) => void, options?: EventOptions): void;

	/**
	 * Listen to an event and remove after being triggered once
	 * @param eventName event name
	 * @param callback function that will be triggered each time an event is emitted
	 * @param options additional registration options 
	 */
	once(eventName: string, callback: (data?: object) => void, options?: EventOptions): any;

	/**
	 * Unlisten to an event
	 * @param eventName event name
	 * @param callback function that will be triggered each time an event is emitted
	 * @param options additional registration options 
	 */
	off(eventName: string, callback: (data?: object) => void, options?: EventOptions): any;

	/**
	 * Emit an event
	 * @param eventName event name
	 * @param obj single data object that will be passed to event listener
	 */
	emit(eventName: string, obj?: object): any;
}

/** Blackprint Engine Instance (for browser or non-browser) */
export class Engine extends CustomEvent {
	ifaceList: Array<Interface>;
	iface: {[id: string]: Interface};
	functions: {[id: string]: any}; // ToDo
	variables: {[id: string]: any}; // ToDo

	/**
	 * Delete one of current instance's node
	 * @param iface interface object
	 */
	deleteNode(iface: Interface): void;

	/** Clear current instance's nodes */
	clearNodes(): void;

	/**
	 * Import nodes structure and connection from JSON
	 * @param json JSON data
	 * @param options additional options for importing JSON data
	 */
	importJSON(json: string | object, options?: {
		/** Set this to false if you want to clear current instance before importing */
		appendMode?: Boolean,
		/** Skip importing environment data if exist on the JSON */
		noEnv?: Boolean,
		/** Skip importing module URL (in case if you already imported the nodes from somewhere) */
		noModuleJS?: Boolean,
	}): Promise<Array<Interface>>;

	/**
	 * Get single node interface that has the specified ID
	 * @param id Node ID
	 */
	getNode(id: string): Node;

	/**
	 * Get list of nodes that created from specific namespace
	 * @param namespace Node namespace
	 */
	getNodes(namespace: string): Node;

	/**
	 * Create a node from a namespace
	 * @param namespace Node namespace
	 * @param options additional options
	 */
	createNode(namespace: string, options?: {
		data?: object,
		x?: number,
		y?: number,
		id?: number,
	}): Interface;

	/**
	 * Create variable node
	 * @param id variable id/name
	 * @param options additional options
	 */
	createVariable(id: string, options?: object): void; // ToDo

	/**
	 * Create function node
	 * @param id function id/name
	 * @param options additional options
	 */
	createFunction(id: string, options?: object): void; // ToDo

	/** Clean instance and mark as destroyed */
	destroy(): void;
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

/** Cable that connect to node's input and output port */
declare class Cable {
	/**
	 * Currently used for internal library only, don't construct your own Cable with this constructor
	 * @param owner port owner
	 * @param target port target
	 */
	constructor(owner: IFacePort, target: IFacePort);

	/** This will be defined after connected to input and output */
	input: IFacePort;

	/** This will be defined after connected to input and output */
	output: IFacePort;

	/** Play flow animation [Timeplate animation library is needed] */
	visualizeFlow(): void;

	/** Get value from connected output port */
	get value(): any;

	/**
	 * Activate or disable this cable
	 * @param enable undefined (mark as async), false (disconnect), true (enabled)
	 */
	activation(enable: undefined | Boolean): void;

	/**
	 * Disconnect and destroy a cable
	 */
	disconnect(): void;
}

/** Interface Port that contains connection data */
declare class IFacePort {
	/**
	 * You mustn't use this class to manually construct interface port
	 * But please use 'iface.node.createPort()' instead
	 * @param node
	 */
	constructor();

	/**
	 * Disconnect all cables that was connected to this port
	 */
	disconnectAll(): void;

	/**
	 * Disable current cable from being connected or data transfer
	 * @param enable
	 */
	disableCables(enable: Boolean): void;

	/**
	 * Connect this port with a cable
	 * @param cable desc
	 */
	connectCable(cable: Cable): Boolean;

	/**
	 * Connect this port to other port
	 * @param port other port
	 */
	connectPort(port: IFacePort): Boolean;
}

/** Interface/IFace that can be used to control nodes */
export class Interface extends CustomEvent {
	/**
	 * You mustn't use this class to manually construct nodes
	 * But please use 'instance.createNode()' instead
	 * @param node
	 */
	constructor(node: Node);

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

/** Can be used to show information for nodes in Sketch */
declare class Decoration {
	/**
	 * Display toast above the node
	 * @param type toast type
	 * @param msg toast message
	 */
	headInfo(type: any, msg: any): any;

	/**
	 * Display info toast above the node
	 * @param msg toast message
	 */
	info(msg: any): any;

	/**
	 * Display warning toast above the node
	 * @param msg toast message
	 */
	warn(msg: any): any;

	/**
	 * Display error toast above the node
	 * @param msg toast message
	 */
	error(msg: any): any;

	/**
	 * Display success toast above the node
	 * @param msg toast message
	 * @param timeout default to 5000 (5sec)
	 */
	success(msg: any, timeout?: any): any;
}

/** Blackprint Node */
export class Node {
	/**
	 * You mustn't use this class to manually construct Blackprint Node
	 * But please use 'instance.createNode()' instead
	 * @param instance current instance where this node was created
	 */
	constructor(instance: Engine | Sketch);

	/**
	 * This must be called once to attach interface to this node
	 * @param icNamespace interface component's namespace that was declared with instance.registerInterface()
	 */
	setInterface(icNamespace?: string): Interface;

	/**
	 * Dynamically create port to this node
	 * @param which port source
	 * @param name unique port name
	 * @param type data type (class)
	 */
	createPort(which: 'input' | 'output', name: string, type: Function): IFacePort;

	/**
	 * Dynamically rename port to this node
	 * @param which port source
	 * @param name port name
	 * @param to unique port name
	 * @returns true if successfully renamed
	 */
	renamePort(which: 'input' | 'output', name: string, to: string): Boolean;

	/**
	 * Dynamically delete port to this node
	 * @param which port source
	 * @param name port name
	 */
	deletePort(which: 'input' | 'output', name: string): void;

	/**
	 * Send data to remote nodes [Experimental] [ToDo]
	 * @param id your defined id
	 * @param data data to be send
	 */
	syncOut(id: string, data: any): void;

	/**
	 * You must replace this with your own custom function in order to receive data
	 * Receive data from remote nodes [Experimental] [ToDo]
	 * @param id your defined id
	 * @param data received data
	 */
	syncIn(id: string, data: any): void;
}

/** Fictional simple port that can be connected with other port */
declare class PortGhost {
	/** Remove data and mark this port as destroyed */
	destroy(): void;
}

/** Create fictional simple output port that can be connected to other input port */
export class OutputPort extends PortGhost {
	/**
	 * Create fictional simple output port that can be connected to other input port
	 * @param type port's data type
	 */
	constructor(type: Function);
}

/** Create fictional simple input port that can be connected to other output port */
export class InputPort extends PortGhost {
	/**
	 * Create fictional simple input port that can be connected to other output port
	 * @param type port's data type
	 */
	constructor(type: Function);
}

declare class RoutePort_1 {
	/** [Experimental] [ToDo] */
	pause(): any;

	/** [Experimental] [ToDo] */
	unpause(): any;

	/**
	 * Create cable from this port
	 * @param event [ToDo]
	 */
	createCable(event: any): any;

	/**
	 * Connect route cable to this port
	 * @param cable a cable that was created form route port
	 */
	connectCable(cable: Cable): Boolean;

	/** This will be called when this node '.update' has turn to be executed */
	routeIn(): Promise<any>;

	/** This will be called after '.update' has been executed */
	routeOut(): Promise<any>;
}

/** Can be used to control data flow between nodes */
declare class RoutePort extends RoutePort_1 {
	/**
	 * @param iface
	 */
	constructor(iface: Interface);
}

/** [Experimental] [ToDo] */
declare class RemoteBase {
	/**
	 * ToDo
	 * @param instance desc
	 */
	constructor(instance: any);

	/**
	 * ToDo
	 * @param json desc
	 */
	onImport(json: any): Promise<any>;

	/**
	 * ToDo
	 * @param urls desc
	 */
	onModule(urls: any): Promise<any>;

	/**
	 * ToDo
	 * @param data desc
	 */
	onSyncOut(data: any): any;

	/** ToDo */
	importRemoteJSON(): Promise<any>;

	/** ToDo */
	syncModuleList(): any;

	/** ToDo */
	destroy(): any;

	/** ToDo */
	disable(): any;

	/** ToDo */
	clearNodes(): any;
}

/** [Experimental] [ToDo] */
export class RemoteControl extends RemoteBase {
	/**
	 * ToDo
	 * @param instance desc
	 */
	constructor(instance: any);

	/** ToDo */
	sendSketchToRemote(): Promise<any>;

	/**
	 * ToDo
	 * @param instant desc
	 */
	saveSketchToRemote(instant: any): Promise<any>;

	/**
	 * ToDo
	 * @param data desc
	 * @param options desc
	 * @param noSync desc
	 * @param force desc
	 */
	importJSON(data: any, options: any, noSync: any, force: any): Promise<any>;

	/**
	 * ToDo
	 * @param data desc
	 */
	onSyncIn(data: any): Promise<any>;
}

/** [Experimental] [ToDo] */
export class RemoteEngine {
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

/** [Experimental] [ToDo] */
export class RemoteSketch {
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