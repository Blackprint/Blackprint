// ToDo: Export as module instead to window
if(window.Blackprint === void 0)
	throw "Blackprint Engine must be loaded before Blackprint Sketch";

var NOOP = function(){};
let { $ } = sf; // sQuery shortcut
var Blackprint = window.Blackprint;

// Will  be used for `Blackprint.registerNode`
Blackprint.modulesURL = {};
Blackprint._modulesURL = [];

Blackprint.Sketch = class Sketch extends Blackprint.Engine.CustomEvent {
	static _iface = {'BP/default': NOOP};

	// Create new blackprint container
	constructor(){
		super();

		this.iface = {}; // { id => object }
		this.ifaceList = [];

		this.index = Blackprint.index++;
		this.scope = Blackprint.space.getScope(this.index);
		this.scope.sketch = this;

		this.getNode = Blackprint.Engine.prototype.getNode;
		this.getNodes = Blackprint.Engine.prototype.getNodes;

		this._event = {$_fallback: BlackprintEventFallback};
	}

	static registerInterface(templatePath, options, func){
		if(templatePath.slice(0, 5) !== 'BPIC/')
			throw new Error("The first parameter of 'registerInterface' must be started with BPIC to avoid name conflict. Please name the interface similar with 'templatePrefix' for your module that you have set on 'blackprint.config.js'.");

		if(options.constructor === Function){
			func = options;
			options = {};
		}

		options.keepTemplate = true;

		if(options.html === void 0){
			if(options.template === void 0)
				options.template = templatePath;

			if(!/\.(html|sf)$/.test(options.template)){
				if(window.templates[`${options.template}.html`] !== void 0)
					options.template += '.html';
				else options.template += '.sf';
			}
		}

		if(options.extend !== void 0 && !(options.extend.prototype instanceof Blackprint.Sketch.Interface)){
			throw new Error(options.extend.constructor.name+" must be instance of Blackprint.Sketch.Interface");
		}
		else if(isClass(func))
			Blackprint.Sketch._iface[templatePath] = func;
		else{
			Blackprint.Sketch._iface[templatePath] = {func, options};
			options.extend = Blackprint.Sketch.Interface;
		}

		var nodeName = templatePath.replace(/[\\/]/g, '-').toLowerCase();
		nodeName = nodeName.replace(/\.\w+$/, '');

		// Just like how we do it on ScarletsFrame component with namespace feature
		Blackprint.space.component(nodeName, options, func || NOOP);
	}

	settings(which, val){
		Blackprint.settings[which] = val;
	}

	// Clone current container index
	cloneContainer(minimap){
		return Blackprint.space.createHTML(this.index + (minimap ? '+mini' : ''));
	}

	// Import node positions and cable connection from JSON
	async importJSON(json){
		if(window.sf && window.sf.loader)
			await window.sf.loader.task;

		if(json.constructor === String)
			json = JSON.parse(json);

		var metadata = json._;
		delete json._;

		if(metadata !== void 0){
			if(metadata.env !== void 0){
				let temp = Blackprint.Environment;
				Object.assign(temp.map, metadata.env);

				// Because the array is a ReactiveArray
				// We need to use splice & push to avoid using different object reference
				// *For Browser Sketch only
				temp.list.splice(0);
				temp.list.push(...Object.entries(temp.map).map(([k, v]) => ({
					key: k,
					value: v
				})));
			}

			if(metadata.moduleJS !== void 0){
				// wait for .min.mjs
				await Blackprint.loadModuleFromURL(metadata.moduleJS, {
					loadBrowserInterface: true
				});

				// wait for .sf.mjs and .sf.css if being loaded from code above
				if(window.sf && window.sf.loader){
					await sf.loader.task;
					await Promise.resolve();
				}
			}
		}

		var inserted = this.ifaceList;
		var handlers = [];

		// Prepare all nodes depend on the namespace
		// before we create cables for them
		for(var namespace in json){
			var nodes = json[namespace];

			// Every nodes that using this namespace name
			for (var a = 0; a < nodes.length; a++){
				let temp = nodes[a];
				this.createNode(namespace, {
					x: temp.x,
					y: temp.y,
					id: temp.id, // Named ID (if exist)
					i: temp.i, // List Index
					data: temp.data, // if exist
				}, handlers);
			}
		}

		let cableConnects = [];

		// Create cable only from output and property
		// > Important to be separated from above, so the cable can reference to loaded nodes
		for(var namespace in json){
			var nodes = json[namespace];

			// Every nodes that using this namespace name
			for (var a = 0; a < nodes.length; a++){
				var node = inserted[nodes[a].i];

				// If have output connection
				if(nodes[a].output !== void 0){
					var out = nodes[a].output;

					// Every output port that have connection
					for(var portName in out){
						var linkPortA = node.output[portName];
						if(linkPortA === void 0){
							this._trigger('error', {
								type: 'node_port_not_found',
								data: {node, portName}
							});
							continue;
						}

						var port = out[portName];

						// Current output's available targets
						for (var k = 0; k < port.length; k++) {
							var target = port[k];
							var targetNode = inserted[target.i];

							// Output can only meet input port
							var linkPortB = targetNode.input[target.name];
							if(linkPortB === void 0){
								this._trigger('error', {
									type: 'node_port_not_found',
									data: {
										node: targetNode,
										portName: target.name
									}
								});
								continue;
							}

							cableConnects.push({
								output: node.output,
								input: targetNode.input,
								target,
								portName,
								linkPortA,
								linkPortB
							});
						}
					}
				}
			}
		}

		await $.afterRepaint();
		for (var i = 0; i < cableConnects.length; i++) {
			let {output, portName, linkPortA, input, target, linkPortB} = cableConnects[i];

			// Create cable from NodeA
			var rectA = getPortRect(output, portName);
			var cable = linkPortA.createCable(rectA);

			// Positioning the cable head2 into target port position from NodeB
			var rectB = getPortRect(input, target.name);
			var center = rectB.width/2;
			cable.head2 = [rectB.x+center, rectB.y+center];

			// Connect cables.currentCable to target port on NodeB
			linkPortB.connectCable(cable);
		}

		// Call handler init after creation processes was finished
		for (var i = 0; i < handlers.length; i++)
			handlers[i].init && handlers[i].init();

		return inserted;
	}

	exportJSON(options){
		var nodes = this.scope('nodes').list;
		var json = {};
		var exclude = [];
		options ??= {};
		let metadata = json._ = {};

		if(options.exclude)
			exclude = options.exclude;

		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if(exclude.includes(node.namespace))
				continue;

			if(json[node.namespace] === void 0)
				json[node.namespace] = [];

			var data = { i };

			if(options.position !== false){
				data.x = Math.round(node.x);
				data.y = Math.round(node.y);
			}

			if(node.data !== void 0){
				data.data = {};

				deepCopy(data.data, node.data);
			}

			if(node.output !== void 0){
				var output = data.output = {};
				var output_ = node.output;

				var haveValue = false;
				for(var name in output_){
					if(output[name] === void 0)
						output[name] = [];

					var port = output_[name];
					var cables = port.cables;

					for (var a = 0; a < cables.length; a++) {
						var target = cables[a].owner === port ? cables[a].target : cables[a].owner;
						if(target === void 0)
							continue;

						var _i = nodes.indexOf(target.iface);
						if(exclude.includes(nodes[_i].namespace))
							continue;

						let temp = {
							i: _i,
							name:target.name
						};

						if(target.id)
							temp.id = target.id;

						haveValue = true;
						output[name].push(temp);
					}
				}

				if(haveValue === false)
					delete data.output;
			}

			json[node.namespace].push(data);
		}

		let space = options.space;
		if(space !== void 0){
			options.space = 3;

			if(space.constructor === Number)
				space = ' '.repeat(space);
		}

		// Inject environment data if exist to JSON
		if(Blackprint.Environment.list.length !== 0)
			metadata.env = Blackprint.Environment.map;

		// Find modules
		let modules = new Set();
		let _modulesURL = Blackprint._modulesURL;
		for(let key in json){
			if(key === '_') continue;

			for (var i = 0; i < _modulesURL.length; i++) {
				if(key in _modulesURL[i]){
					modules.add(_modulesURL[i]._url);
					break;
				}
			}
		}

		// Inject modules URL if exist to JSON
		if(modules.size !== 0)
			metadata.moduleJS = [...modules];

		json = JSON.stringify(json, options.replacer, options.space);

		if(options.toJS)
			json = json.replace(/,"([\w]+)":/g, (_, v) => ', '+v+':')
				.replace(/"([\w]+)":/g, (_, v) => v+':')
				.replace(/\[\n +{/g, '[{')
				.replace(/}\n +\]/g, '}]')
				.replace(/},\n +\{/g, '}, {')
				.replace(/,\n +(i|x|y|name):/g, (_, v) => ', '+v+':');

		if(space !== void 0)
			json = json.replace(/\n {6}/g, '\n   ')
			.replace(/ {3}/g, space)
			.replace(/\t{4}/g, '\t'.repeat(3));

		// For metadata, just add one more tab
		if(options.toJS)
			json = json.replace(/_:.*?$.*?\t[\]}](?=\n\t})/gms, v => {
				return v.replace(/\t+/g, tab => {
					return tab + '\t';
				})
			});

		return json;
	}

	clearNodes(){
		this.scope('nodes').list.splice(0);
		this.scope('cables').list.splice(0);
	}

	// Create new node that will be inserted to the container
	// @return node scope
	createNode(namespace, options, handlers){
		if(Blackprint.Engine === void 0)
			throw new Error("Blackprint.Engine was not found, please load it first before creating new node");

		var func = deepProperty(Blackprint.nodes, namespace.split('/'));
		if(func === void 0){
			return this._trigger('error', {
				type: 'node_not_found',
				data: {namespace}
			});
		}

		let time = Date.now();

		// Call the registered func (from this.registerNode)
		var node;
		if(isClass(func))
			node = new func(this);
		else func(node = new Blackprint.Node(this));

		// Obtain iface from the node
		let iface = node.iface;
		if(iface === void 0)
			throw new Error(namespace+"> 'node.iface' was not found, do you forget to call 'node.setInterface()'?");

		iface.namespace = namespace;

		// Create the linker between the node and the iface
		Blackprint.Interface.prepare(node, iface);

		iface.input ??= {};
		iface.output ??= {};
		iface.property ??= {};

		// Replace port prototype (intepreter port -> visual port)
		let _ports = Blackprint.Sketch.Interface._ports;
		for (var i = 0; i < _ports.length; i++) {
			var localPorts = iface[_ports[i]];
			for(var portName in localPorts)
				Object.setPrototypeOf(localPorts[portName], Port.prototype);
		}

		var savedData = options.data;
		delete options.data;

		// Assign the iface options (x, y, id, ...)
		Object.assign(iface, options);

		// Node is become the component scope
		// equal to calling registerInterface's registered function
		this.scope('nodes').list.push(iface);
		iface.importing = false;

		iface.imported && iface.imported(savedData);

		if(iface.id !== void 0)
			this.iface[iface.id] = iface;

		if(iface.i !== void 0)
			this.ifaceList[iface.i] = iface;
		else this.ifaceList.push(iface);

		node.imported && node.imported(savedData);

		if(handlers !== void 0)
			handlers.push(node);
		else if(node.init !== void 0)
			node.init();

		time = Date.now() - time;
		if(time > 500){
			this._trigger('slow_node_creation', {
				namespace, time
			});
		}

		return iface;
	}
}

// Replace function from Blackprint Engine
Blackprint.registerNode = function(namespace, func){
	if(this._scopeURL !== void 0){
		let temp = Blackprint.modulesURL[this._scopeURL];

		if(temp === void 0){
			Blackprint.modulesURL[this._scopeURL] = {};
			temp = Blackprint.modulesURL[this._scopeURL];
			temp._nodeLength = 0;
			temp._url = this._scopeURL;
			Blackprint._modulesURL.push(temp);
		}

		temp[namespace] = true;
	}

	namespace = namespace.split('/');

	// Add with sf.Obj to trigger ScarletsFrame object binding update
	if(!(namespace[0] in Blackprint.nodes))
		sf.Obj.set(Blackprint.nodes, namespace[0], {});

	let isExist = deepProperty(Blackprint.nodes, namespace);
	if(isExist){
		if(this._scopeURL && isExist._scopeURL !== this._scopeURL){
			throw `Conflicting nodes with similar name was found\nNamespace: ${namespace.join('/')}\nFirst register from: ${isExist._scopeURL}\nTrying to register again from: ${this._scopeURL}`;
		}

		if(isExist._hidden)
			func._hidden = true;

		if(isExist._disabled)
			func._disabled = true;
	}
	else if(this._scopeURL !== void 0){
		let ref = Blackprint.modulesURL[this._scopeURL];
		if(ref._nodeLength === void 0)
			ref._nodeLength = 0;
		ref._nodeLength++;

		ref = Blackprint.nodes[namespace[0]];
		if(ref._length === void 0){
			Object.defineProperty(ref, '_length', {writable: true, value: 0});
			Object.defineProperty(ref, '_visibleNode', {writable: true, value: 0});
		}

		ref._length++;
		ref._visibleNode++;
	}

	func._scopeURL = this._scopeURL;
	deepProperty(Blackprint.nodes, namespace, func, function(obj){
		if(obj._length !== void 0)
			obj._length++;
		else{
			Object.defineProperty(obj, '_length', {writable: true, value: 1});
			Object.defineProperty(obj, '_visibleNode', {writable: true, value: 1});
		}
	});
}

Blackprint.loadModuleFromURL.browser = function(url, options){
	// ToDo: Migrate some code to Blackprint Sketch
	if(options == null) options = {};

	if(options.loadBrowserInterface === false)
		Blackprint.loadBrowserInterface = false;
	if(options.loadBrowserInterface === true)
		Blackprint.loadBrowserInterface = true;

	if(window.sf === void 0 && Blackprint.loadBrowserInterface){
		console.log("[Blackprint] ScarletsFrame was not found, node interface for Blackprint Editor will not being loaded. Please put `{loadBrowserInterface: false}` on second parameter of `Blackprint.loadModuleFromURL`. You can also set `Blackprint.loadBrowserInterface` to false if you don't want to use node interface for Blackprint Editor.");
		return;
	}

	return sf.loader.mjs(url);
}

// Replace function from Blackprint Engine
Blackprint.LoadScope = function(options){
	let cleanURL = options.url.replace(/[?#].*?$/gm, '');

	let temp = Object.create(Blackprint);
	let isInterfaceModule = /\.sf\.mjs$/m.test(cleanURL);

	temp._scopeURL = cleanURL.replace(/\.sf\.mjs$/m, '.min.mjs');

	if(Blackprint.loadBrowserInterface && !isInterfaceModule){
		if(window.sf === void 0)
			return console.log("[Blackprint] ScarletsFrame was not found, node interface for Blackprint Editor will not being loaded. You can also set `Blackprint.loadBrowserInterface` to false if you don't want to use node interface for Blackprint Editor.");

		let noStyle = Blackprint.loadBrowserInterface === 'without-css';
		if(options != null && options.css === false)
			noStyle = false;

		let url = temp._scopeURL.replace(/(|\.min|\.es6)\.(js|mjs|ts)$/m, '');

		if(!noStyle)
			sf.loader.css([url+'.sf.css']);

		sf.loader.mjs([url+'.sf.mjs']);
	}

	return temp;
}

Blackprint.availableNode = Blackprint.nodes; // To display for available dropdown nodes
Blackprint.index = 0;
Blackprint.template = {
	outputPort:'Blackprint/nodes/template/output-port.sf'
};

// Let's define `Space` that handle model and component as global variable on our private scope
var Space = Blackprint.space = new sf.Space('blackprint', {
	templatePath:'Blackprint/page.sf'
});