// ToDo: Export as module instead to window
if(window.Blackprint === void 0)
	throw "Blackprint Engine must be loaded before Blackprint Sketch";

var NOOP = function(){};
let { $ } = sf; // sQuery shortcut
var Blackprint = window.Blackprint;

Blackprint.Sketch = class Sketch extends Blackprint.Engine {
	static _iface = {'BP/default': NOOP};

	// Create new blackprint container
	constructor(){
		super();

		// Properties from the engine
		// this.iface = {}; // { id => IFace }
		// this.ref = {}; // { id => Port references }
		// this.variables = {};
		// this.functions = {};
		// this.ifaceList = [];

		this.index = Blackprint.index++;
		this.scope = Blackprint.space.getScope(this.index);
		this.scope.sketch = this;

		// Default event
		this._event = {$_fallback: BlackprintEventFallback};
	}

	static registerInterface(templatePath, options, func){
		if(templatePath.slice(0, 5) !== 'BPIC/')
			throw new Error("The first parameter of 'registerInterface' must be started with BPIC to avoid name conflict. Please name the interface similar with 'templatePrefix' for your module that you have set on 'blackprint.config.js'.");

		if(options && options.constructor === Function){
			func = options;
			options = {};
		}

		// Return for Decorator
		if(func === void 0){
			return function(claz){
				Blackprint.Sketch.registerInterface(templatePath, options, claz);
			}
		}

		options.keepTemplate = true;

		if(options.html === void 0){
			if(options.template === null)
				options.template = 'Blackprint/nodes/default.sf';

			if(options.template === void 0)
				options.template = templatePath;

			if(!/\.(html|sf)$/.test(options.template)){
				if(window.templates[`${options.template}.html`] !== void 0)
					options.template += '.html';
				else options.template += '.sf';
			}
		}

		let isExist = Blackprint.Sketch._iface[templatePath];

		if(options.extend !== void 0 && !(options.extend.prototype instanceof Blackprint.Interface))
			throw new Error(options.extend.constructor.name+" must be instance of Blackprint.Interface");
		else if(isClass(func)){
			Blackprint.Sketch._iface[templatePath] = func;

			if(isExist !== void 0)
				window.sf$hotReload?.replaceClass(isExist, func);
		}
		else{
			Blackprint.Sketch._iface[templatePath] = {func, options};

			if(options.extend === void 0)
				options.extend = Blackprint.Interface;
			else if(isExist !== void 0 && isExist.extend !== void 0)
				window.sf$hotReload?.replaceClass(isExist.extend, options.extend);
		}

		var nodeName = templatePath.replace(/[\/.,<>:\[\]{}+_=`~!@#$%^*(\\|)]/g, '-').toLowerCase();
		nodeName = nodeName.replace(/\.\w+$/, '');

		// Just like how we do it on ScarletsFrame component with namespace feature
		Blackprint.space.component(nodeName, options, func || NOOP);
	}

	// Clone current container index
	cloneContainer(minimap){
		return Blackprint.space.createHTML(this.index + (minimap ? '+mini' : ''));
	}

	// Import node positions and cable connection from JSON
	async importJSON(json, options){
		if(window.sf && window.sf.loader)
			await window.sf.loader.task;

		if(json.constructor === String)
			json = JSON.parse(json);

		let containerModel = this.scope('container');
		containerModel._isImporting = true;

		let oldIfaces = this.iface;

		if(options === void 0) options = {};
		if(!options.appendMode) this.clearNodes();

		var metadata = json._;
		delete json._;

		if(metadata !== void 0){
			if(metadata.env !== void 0 && !options.noEnv){
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

			if(metadata.moduleJS !== void 0 && !options.noModuleJS){
				try{
					// wait for .min.mjs
					await Blackprint.loadModuleFromURL(metadata.moduleJS, {
						loadBrowserInterface: true
					});

					// wait for .sf.mjs and .sf.css if being loaded from code above
					if(window.sf && window.sf.loader){
						await sf.loader.task;
						await new Promise(resolve=> setTimeout(resolve, 100));
						await sf.loader.task;
					}

					await Promise.resolve();
				} catch(e) {
					containerModel._isImporting = false;
					throw e;
				}
			}
		}

		var inserted = this.ifaceList;
		var handlers = []; // nodes

		// Prepare all nodes depend on the namespace
		// before we create cables for them
		try {
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
						comment: temp.comment,
						data: temp.data, // if exist
						oldIface: oldIfaces[temp.id],
					}, handlers);
				}
			}
		} catch(e) {
			containerModel._isImporting = false;
			throw e;
		}

		let cableConnects = [];
		let branchPrepare = new Map();

		// Create cable only from output and property
		// > Important to be separated from above, so the cable can reference to loaded nodes
		for(var namespace in json){
			var nodes = json[namespace];

			// Every nodes that using this namespace name
			for (var a = 0; a < nodes.length; a++){
				let node = nodes[a];
				var iface = inserted[node.i];

				// If have output connection
				if(node.output !== void 0){
					var out = node.output;
					var _cableMeta = node._cable;

					// Every output port that have connection
					for(var portName in out){
						var linkPortA = iface.output[portName];
						if(linkPortA === void 0){
							this.emit('error', {
								type: 'node_port_not_found',
								data: {iface, portName}
							});
							continue;
						}

						var port = out[portName];

						if(_cableMeta)
							branchPrepare.set(linkPortA, _cableMeta[portName])

						// Current output's available targets
						for (var k = 0; k < port.length; k++) {
							var target = port[k];
							var targetNode = inserted[target.i];

							// Output can only meet input port
							var linkPortB = targetNode.input[target.name];
							if(linkPortB === void 0){
								this.emit('error', {
									type: 'node_port_not_found',
									data: {
										iface: targetNode,
										portName: target.name
									}
								});
								continue;
							}

							cableConnects.push({
								output: iface.output,
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

		let branchMap = new Map();

		function deepCreate(temp, cable, linkPortA) {
			if(temp.branch !== void 0){
				cable.head2[0] = temp.x;
				cable.head2[1] = temp.y;

				let list = temp.branch;
				for (let z = 0; z < list.length; z++)
					deepCreate(list[z], cable.createBranch(), linkPortA);

				return;
			}

			if(!branchMap.has(linkPortA))
				branchMap.set(linkPortA, []);

			branchMap.get(linkPortA)[temp.id] = cable;
		}

		await $.afterRepaint();
		for (var i = 0; i < cableConnects.length; i++) {
			let {output, portName, linkPortA, input, target, linkPortB} = cableConnects[i];

			let cable;
			let _cable = branchPrepare.get(linkPortA);
			if(_cable !== void 0){
				if(_cable !== true){
					branchPrepare.set(linkPortA, true);

					// Create cable from NodeA
					let rectA = getPortRect(output, portName);

					// Create branches
					for (let z = 0; z < _cable.length; z++)
						deepCreate(_cable[z], linkPortA.createCable(rectA), linkPortA);
				}

				cable = branchMap.get(linkPortA)[target.parentId];
			}

			// Create cable from NodeA
			if(cable === void 0)
				cable = linkPortA.createCable(getPortRect(output, portName));

			// Positioning the cable head2 into target port position from NodeB
			var rectB = getPortRect(input, target.name);
			var center = rectB.width / 2;
			cable.head2 = [rectB.x + center, rectB.y + center];

			// Connect cables.currentCable to target port on NodeB
			linkPortB.connectCable(cable);
		}

		// Call node init after creation processes was finished
		for (var i = 0; i < handlers.length; i++)
			handlers[i].init && handlers[i].init();

		containerModel._isImporting = false;
		return inserted;
	}

	exportJSON(options){
		var ifaces = this.scope('nodes').list;
		var json = {};
		var exclude = [];
		options ??= {};
		let metadata = json._ = {};

		if(options.exclude)
			exclude = options.exclude;

		for (var i = 0; i < ifaces.length; i++) {
			var iface = ifaces[i];
			if(exclude.includes(iface.namespace))
				continue;

			if(json[iface.namespace] === void 0)
				json[iface.namespace] = [];

			var data = { i };

			if(options.position !== false){
				data.x = Math.round(iface.x);
				data.y = Math.round(iface.y);
			}

			if(iface.id !== void 0)
				data.id = iface.id;

			if(iface.comment != false) // is not empty string or undefined
				data.comment = iface.comment;

			if(iface.data !== void 0){
				data.data = {};

				deepCopy(data.data, iface.data);
			}

			let cableMetadata = {};
			let hasCableMetadata = false;

			if(iface.output !== void 0){
				var output = data.output = {};
				var _list = iface.output._list;

				var haveValue = false;
				for (var g = 0; g < _list.length; g++) {
					var port = _list[g];
					var name = port.name;
					var cables = port.cables;

					if(cables.length === 0)
						continue;

					if(output[name] === void 0)
						output[name] = [];

					let pendingBranch = [];
					let parentMap = new Map();

					for (var a = 0; a < cables.length; a++) {
						let cable = cables[a];
						var target = cable.owner === port ? cable.target : cable.owner;

						if(cable.branch !== void 0 && cable.branch.length !== 0){
							// Skip cable that doesn't end up to connect to any input port
							if(cable._inputCable.length !== 0)
								pendingBranch.push(cable);

							continue; // This is just branch, let's just continue
						}

						if(target === void 0)
							continue; // Not connected to any port, let's continue

						var _i = ifaces.indexOf(target.iface);
						if(exclude.includes(ifaces[_i].namespace))
							continue; // Being excluded from export

						let temp = {
							i: _i,
							name: target.name
						};

						// Save this child/cable on the map
						// so we can attach it to the parent later.
						if(cable.parentCable !== void 0)
							parentMap.set(cable, temp);

						if(target.id)
							temp.id = target.id;

						haveValue = true;
						output[name].push(temp);
					}

					if(pendingBranch.length !== 0){
						let parentCable = 0;

						let meta = cableMetadata[name] = [];
						hasCableMetadata = true;

						function deepBranch(cable, save){
							if(cable.branch){
								let branch = cable.branch;

								save.x = cable.head2[0];
								save.y = cable.head2[1];
								save.branch = [];

								for (let z = 0; z < branch.length; z++){
									let temp = {};
									save.branch.push(temp);
									deepBranch(branch[z], temp);
								}

								return;
							}

							// Skip if not connected to anything
							if(cable.connected === false) return;

							let temp = parentMap.get(cable);
							save.id = temp.parentId = parentCable++;
						}

						for (var z = 0; z < pendingBranch.length; z++) {
							let temp = {};
							meta.push(temp);

							deepBranch(pendingBranch[z], temp);
						}
					}
				}

				if(haveValue === false)
					delete data.output;
			}

			if(hasCableMetadata)
				data._cable = cableMetadata;

			json[iface.namespace].push(data);
		}

		let space = options.space;
		if(space !== void 0){
			options.space = 3;

			if(space.constructor === Number)
				space = ' '.repeat(space);
		}

		// Inject environment data if exist to JSON
		if(options.environment !== false && Blackprint.Environment.list.length !== 0)
			metadata.env = Blackprint.Environment.map;

		// Find modules
		if(options.module !== false){
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
		}

		// Remove metadata if empty
		if(options.module === false && options.environment === false)
			delete json._;

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

	deleteNode(iface){
		let scope = this.scope;

		var list = scope('nodes').list;
		var i = list.indexOf(iface);

		if(i === -1)
			return scope.sketch.emit('error', {
				type: 'node_delete_not_found',
				data: {iface}
			});

		iface.node.destroy && iface.node.destroy();
		list.splice(i, 1); // iface.destroy will be called by SF

		let ifaceList = this.ifaceList;
		i = ifaceList.indexOf(iface);

		if(i !== -1)
			ifaceList.splice(i, 1);

		var check = Blackprint.Interface._ports;
		for (var i = 0; i < check.length; i++) {
			var portList = iface[check[i]];

			for(var port in portList){
				if(port.slice(0, 1) === '_') continue;
				portList[port].disconnectAll();
			}
		}

		// Delete reference
		delete this.iface[iface.id];
		delete this.ref[iface.id];

		this.emit('node.created', { iface });
	}

	clearNodes(){
		let list = this.scope('nodes').list;
		for (var i = 0; i < list.length; i++) {
			let temp = list[i].node;
			temp.destroy && temp.destroy();
		}

		list.splice(0);
		this.scope('cables').list.splice(0);
	}

	// Create new node that will be inserted to the container
	// @return node scope
	createNode(namespace, options, handlers){
		var func = deepProperty(Blackprint.nodes, namespace.split('/'));
		if(func === void 0){
			return this.emit('error', {
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
		options ??= {};

		if(options.oldIface !== void 0 && options.oldIface.namespace === iface.namespace){
			Blackprint.Interface._reuse(iface, options.oldIface);

			iface.input ??= {_list: []};
			iface.output ??= {_list: []};
			iface.property ??= {_list: []};
		}

		// Create the linker between the node and the iface
		else{
			Blackprint.Interface._prepare(node, iface);

			iface.input ??= {_list: []};
			iface.output ??= {_list: []};
			iface.property ??= {_list: []};

			// Replace port prototype (intepreter port -> visual port)
			let _ports = Blackprint.Interface._ports;
			for (var i = 0; i < _ports.length; i++) {
				var localPorts = iface[_ports[i]]._list;

				if(localPorts === void 0) continue;
				for (var z = 0; z < localPorts.length; z++)
					Object.setPrototypeOf(localPorts[z], Port.prototype);
			}
		}

		var savedData = options.data;
		delete options.data;

		// Assign the iface options (x, y, id, ...)
		Object.assign(iface, options);

		// Node is become the component scope
		// equal to calling registerInterface's registered function
		this.scope('nodes').list.push(iface);

		if(iface.id !== void 0)
			this.iface[iface.id] = iface;

		if(iface.i !== void 0)
			this.ifaceList[iface.i] = iface;
		else this.ifaceList.push(iface);

		iface.importing = false;
		iface.comment = options.comment || '';

		iface.imported && iface.imported(savedData);
		node.imported && node.imported(savedData);

		if(handlers !== void 0)
			handlers.push(node);
		else if(node.init !== void 0)
			node.init();

		time = Date.now() - time;
		if(time > 500){
			this.emit('node.slow_creation', {
				namespace, time
			});
		}

		this.emit('node.created', { iface });
		return iface;
	}

	destroy(){
		this.iface = {};
		this.ifaceList.splice(0);
		this.clearNodes();
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
			Blackprint.emit('moduleAdded', {url: this._scopeURL});
			Blackprint._modulesURL.push(temp);
		}

		temp[namespace] = true;
	}

	// Return for Decorator
	if(func === void 0){
		return function(claz){
			Blackprint.registerNode(namespace, claz);
			return claz;
		}
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

	if(isClass(func)){
		let isExist = deepProperty(Blackprint.nodes, namespace);

		if(isExist !== void 0)
			window.sf$hotReload?.replaceClass(isExist, func);
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

// Override just for supporting hot reload
let _registerInterface = Blackprint.registerInterface;
Blackprint.registerInterface = function(templatePath, options, func){
	if(templatePath.slice(0, 5) !== 'BPIC/')
		throw new Error("The first parameter of 'registerInterface' must be started with BPIC to avoid name conflict. Please name the interface similar with 'templatePrefix' for your module that you have set on 'blackprint.config.js'.");

	if(/\/[a-z]/.test(templatePath))
		throw new Error(templatePath+": Please capitalize each word after the slash symbol '/'");

	if(options.constructor === Function){
		func = options;
		options = {};
	}

	// Return for Decorator
	if(func === void 0){
		return function(claz){
			Blackprint.registerInterface(templatePath, options, claz);
			return claz;
		}
	}

	let isExist = Blackprint._iface[templatePath];
	if(isExist !== void 0){
		if(isClass(func))
			window.sf$hotReload?.replaceClass(isExist, func);
		else if(isExist !== void 0 && options.extend !== void 0)
			window.sf$hotReload?.replaceClass(isExist.extend, options.extend);
	}

	_registerInterface(templatePath, options, func);
}

Blackprint.loadModuleFromURL.browser = function(url, options){
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
Blackprint.loadScope = function(options){
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