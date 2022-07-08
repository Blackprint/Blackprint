if(window.Blackprint === void 0)
	throw "Blackprint Engine must be loaded before Blackprint Sketch";

var NOOP = function(){};
let { $ } = sf; // sQuery shortcut
var Blackprint = window.Blackprint;

let onModuleConflict = Blackprint._utils.onModuleConflict;
let _InternalNodeEnum = Blackprint._InternalNodeEnum;

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

	static registerInterface(templatePath, options, func, _fromDecorator=false){
		if(templatePath.slice(0, 5) !== 'BPIC/')
			throw new Error("The first parameter of 'registerInterface' must be started with BPIC to avoid name conflict. Please name the interface similar with 'templatePrefix' for your module that you have set on 'blackprint.config.js'.");

		if(options && options.constructor === Function){
			func = options;
			options = {};
		}

		// Return for Decorator
		if(func === void 0){
			// this == Blackprint.Sketch
			return claz => {
				this.registerInterface(templatePath, options, claz, true);
				return claz;
			}
		}

		// Pause registration if have conflict
		let info = onModuleConflict.pending.get(this._scopeURL);
		if(info != null) return info.pending.push({
			namespace: templatePath,
			_call: ()=> this.registerInterface.apply(this, arguments),
		});

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
				hotRefreshNodeClass(isExist, func);
		}
		else{
			Blackprint.Sketch._iface[templatePath] = {func, options};

			if(options.extend === void 0)
				options.extend = Blackprint.Interface;
			else if(isExist !== void 0 && isExist.extend !== void 0)
				hotRefreshNodeClass(isExist.extend, func.extend);
		}

		var nodeName = templatePath.replace(/[\/.,<>:\[\]{}+_=`~!@#$%^*(\\|)]/g, '-').toLowerCase();
		nodeName = nodeName.replace(/\.\w+$/, '');

		// Just like how we do it on ScarletsFrame component with namespace feature
		Blackprint.space.component(nodeName, options, func || NOOP);

		// For ScarletsFrame inspector
		func.prototype.sf$resolveSrc ??= {
			url: (new Error(1)).stack.split('\n')[_fromDecorator ? 3 : 2].split('://')[1],
			rawText: templatePath
		};
	}

	// Clone current container index
	cloneContainer(minimap){
		return Blackprint.space.createHTML(this.index + (minimap ? '+mini' : ''));
	}

	// Import node positions and cable connection from JSON
	async importJSON(json, options){
		if(window.sf && window.sf.loader)
			await window.sf.loader.task;

		if(this._remote != null && !this._remote._skipEvent)
			return await this._remote.importJSON(json, options, false, true);

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
			if(metadata.env !== void 0 && options.importEnvironment){
				let Env = Blackprint.Environment;
				let temp = metadata.env;
				
				for (let key in temp) {
					Env.set(key, temp[key]);
				}
			}

			let mjs;
			if(metadata.functions != null) mjs = metadata.moduleJS.slice(0) || [];

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

			if(metadata.functions != null){
				let functions = metadata.functions;

				for (let key in functions){
					let temp = this.createFunction(key, functions[key]);

					// Required to be included on JSON export if this function isn't modified
					// ToDo: use better mapping for moduleJS
					let other = temp.structure._ = {};
					other.moduleJS = mjs;
				}
			}

			if(metadata.variables != null){
				let variables = metadata.variables;

				for (let key in variables)
					this.createVariable(key, variables[key]);
			}
		}

		var inserted = this.ifaceList;
		var handlers = []; // nodes
		let isCleanImport = inserted.length === 0;

		// Prepare all nodes depend on the namespace
		// before we create cables for them
		try {
			for(var namespace in json){
				var nodes = json[namespace];

				// Every nodes that using this namespace name
				for (var a = 0; a < nodes.length; a++){
					let temp = nodes[a];
					let iface = this.createNode(namespace, {
						x: temp.x,
						y: temp.y,
						z: temp.z,
						forceZIndex: isCleanImport,
						id: temp.id, // Named ID (if exist)
						i: temp.i, // List Index
						comment: temp.comment,
						data: temp.data, // if exist
						oldIface: oldIfaces[temp.id],
					}, handlers);

					// For custom function node
					await iface._BpFnInit?.();
				}
			}
		} catch(e) {
			containerModel._isImporting = false;
			throw e;
		}

		let cableConnects = [];
		let routeConnects = [];
		let branchPrepare = new Map();

		// Create cable only from output and property
		// > Important to be separated from above, so the cable can reference to loaded nodes
		for(var namespace in json){
			var nodes = json[namespace];

			// Every nodes that using this namespace name
			for (var a = 0; a < nodes.length; a++){
				let node = nodes[a];
				var iface = inserted[node.i];

				if(node.route != null)
					routeConnects.push({from: iface, to: inserted[node.route.i]});

				// If have output connection
				if(node.output !== void 0){
					var out = node.output;
					var _cableMeta = node._cable;

					// Every output port that have connection
					for(var portName in out){
						var port = out[portName];

						var linkPortA = iface.output[portName];
						if(linkPortA === void 0){
							if(iface._enum === _InternalNodeEnum.BPFnInput){
								let target = this._getTargetPortType(iface.node.instance, 'input', port);
								linkPortA = iface.addPort(target, portName);

								if(linkPortA === void 0)
									throw new Error(`Can't create output port (${portName}) for function (${iface._funcMain.node._funcInstance.id})`);
							}
							else if(iface._enum === _InternalNodeEnum.BPVarGet){
								let target = this._getTargetPortType(this, 'input', port);
								iface.useType(target);
								linkPortA = iface.output[portName];
							}
							else{
								this.emit('error', {
									type: 'node_port_not_found',
									data: {iface, portName}
								});
								continue;
							}
						}

						if(_cableMeta)
							branchPrepare.set(linkPortA, _cableMeta[portName])

						// Current output's available targets
						for (var k = 0; k < port.length; k++) {
							var target = port[k];
							var targetNode = inserted[target.i];

							// Output can only meet input port
							var linkPortB = targetNode.input[target.name];
							if(linkPortB === void 0){
								if(targetNode._enum === _InternalNodeEnum.BPFnOutput){
									linkPortB = targetNode.addPort(linkPortA, target.name);

									if(linkPortB === void 0)
										throw new Error(`Can't create output port (${target.name}) for function (${targetNode._funcMain.node._funcInstance.id})`);
								}
								else if(targetNode._enum === _InternalNodeEnum.BPVarSet){
									targetNode.useType(linkPortA);
									linkPortB = targetNode.input[target.name];
								}
								else {
									this.emit('error', {
										type: 'node_port_not_found',
										data: {
											iface: targetNode,
											portName: target.name
										}
									});
									continue;
								}
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

				if(temp.overRot != null)
					cable.overrideRot = temp.overRot;

				let list = temp.branch;
				for (let z = 0; z < list.length; z++)
					deepCreate(list[z], cable.createBranch(), linkPortA);

				return;
			}

			if(!branchMap.has(linkPortA))
				branchMap.set(linkPortA, []);

			branchMap.get(linkPortA)[temp.id] = cable;
		}

		if(isCleanImport)
			this.scope('nodes').list.refresh?.();
		
		await $.afterRepaint();
		
		let _getPortRect, _windowless = Blackprint.settings.windowless;
		if(options.pendingRender){
			this.pendingRender = true;

			let temp = {x:50,y:50,width:50,height:50,left:50,right:50,top:50,bottom:50};
			Object.setPrototypeOf(temp, DOMRect.prototype);
			_getPortRect = () => temp;

			Blackprint.settings.windowless = true;
		}
		else _getPortRect = getPortRect;

		if(isCleanImport && !Blackprint.settings.windowless){
			let list = this.scope('nodes').list;
			
			// Init after pushed into DOM tree
			for (let i=0; i < list.length; i++) {
				list[i].node.routes._initForSketch();
			}
		}

		for (let i=0; i < routeConnects.length; i++) {
			let { from, to } = routeConnects[i];
			from.node.routes.routeTo(to);
		}

		for (var i = 0; i < cableConnects.length; i++) {
			let {output, portName, linkPortA, input, target, linkPortB} = cableConnects[i];

			let cable;
			let _cable = branchPrepare.get(linkPortA);
			if(_cable !== void 0){
				if(_cable !== true){
					branchPrepare.set(linkPortA, true);

					// Create cable from NodeA
					let rectA = _getPortRect(output, portName);

					// Create branches
					for (let z = 0; z < _cable.length; z++)
						deepCreate(_cable[z], linkPortA.createCable(rectA), linkPortA);
				}

				cable = branchMap.get(linkPortA)[target.parentId];
			}

			// Create cable from NodeA
			if(cable === void 0)
				cable = linkPortA.createCable(_getPortRect(output, portName));

			if(target.overRot != null)
				cable.overrideRot = target.overRot;

			// Positioning the cable head2 into target port position from NodeB
			var rectB = _getPortRect(input, target.name);
			var center = rectB.width / 2;
			cable.head2 = [rectB.x + center, rectB.y + center];

			// Connect cables.currentCable to target port on NodeB
			linkPortB.connectCable(cable);
		}

		// Call node init after creation processes was finished
		for (var i = 0; i < handlers.length; i++)
			handlers[i].init?.();

		containerModel._isImporting = false;
		this.emit("json.imported", {appendMode: options.appendMode, nodes: inserted, raw: json});

		if(!Blackprint.settings.windowless)
			this.recalculatePosition();

		if(this.pendingRender) Blackprint.settings.windowless = _windowless;
		return inserted;
	}

	exportJSON(options){
		var ifaces;

		var json = {};
		var exclude = [];
		options ??= {};
		let metadata = json._ = {};

		let zPlacement = this.scope('nodes').list;

		if(options.selectedOnly)
			ifaces = this.scope('nodes').selected;
		else ifaces = this.ifaceList;

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
				data.z = zPlacement.indexOf(iface); // kind of z-index
			}

			if(iface.id !== void 0)
				data.id = iface.id;

			if(options.comment !== false && iface.comment)
				data.comment = iface.comment;

			if(iface.data !== void 0){
				if(iface.data.exportData != null)
					data.data = iface.data.exportData();
				else {
					data.data = {};
					deepCopy(data.data, iface.data);
				}
			}

			let cableMetadata = {};
			let hasCableMetadata = false;

			if(iface.output !== void 0){
				var output = data.output = {};
				var _list = iface.output._portList;

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
						if(_i == -1 || exclude.includes(ifaces[_i].namespace))
							continue; // Being excluded from export

						let temp = {
							i: _i,
							name: target.name,
						};

						if(cable.overrideRot != null)
							temp.overRot = cable.overrideRot;

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

								if(cable.overrideRot != null)
									save.overRot = cable.overrideRot;

								save.x = Math.round(cable.head2[0]);
								save.y = Math.round(cable.head2[1]);
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
							if(options.selectedOnly && temp == null)
								return;

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

			let routeToIface = iface.node.routes?.out?.input?.iface;
			if(routeToIface != null){
				data.route = { i: ifaces.indexOf(routeToIface) };
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
		if(options.environment !== false && Blackprint.Environment._list.length !== 0)
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

		if(options.exportFunctions !== false){
			let hasFunc = false, functions = {};
			let funcs = this.functions;
			let moduleJS = new Set(metadata.moduleJS || []);
			let onlySelected = options.selectedOnly ? ifaces.map(v => v.namespace) : null;

			let dive = function(list, path){
				for (let key in list) {
					hasFunc = true;

					let bpFunc = list[key];
					if(bpFunc instanceof Blackprint._utils.BPFunction){
						if(options.selectedOnly && !onlySelected.includes(`BPI/F/${path+key}`))
							continue;

						let temp = functions[path+key] = {};
						temp.id = bpFunc.id;
						temp.title = bpFunc.title;
						temp.description = bpFunc.description;
						temp.vars = Object.keys(bpFunc.variables);
						temp.privateVars = bpFunc.privateVars;

						let copy = temp.structure = Object.assign({}, bpFunc.structure);
						let mjs = copy._?.moduleJS;
						if(mjs != null){
							for (let i=0; i < mjs.length; i++)
								moduleJS.add(mjs[i]);
						}

						if(options.position === false || options.comment === false){
							for (let key in copy) {
								if(key === '_') continue;

								let temp = copy[key] = copy[key].slice(0);
								for (let i=0; i < temp.length; i++) {
									let item = temp[i] = Object.assign({}, temp[i])
									if(options.position === false){
										delete item.x;
										delete item.y;
										delete item.z;
									}

									if(options.comment === false)
										delete item.comment;
								}
							}
						}

						delete copy._;
					}
					else dive(bpFunc, path+key+'/');
				}
			}

			dive(funcs, '');
			if(hasFunc) metadata.functions = functions;

			if(options.module !== false)
				metadata.moduleJS = [...moduleJS];
		}

		if(options.exportVariables !== false){
			let hasVar = false, variables = {};
			let vars = this.variables;

			let dive = function(list, path){
				for (let key in list) {
					hasVar = true;

					let bpVar = list[key];
					if(bpVar instanceof Blackprint._utils.BPVariable){
						let temp = variables[path+key] = {};
						temp.id = bpVar.id;
						temp.title = bpVar.title;
					}
					else dive(bpVar, path+key+'/');
				}
			}

			dive(vars, '');
			if(hasVar) metadata.variables = variables;
		}

		// Remove metadata if empty
		if(options.module === false && options.environment === false)
			delete json._;

		if(options.toRawObject) return json;

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

		iface._bpDestroy = true;

		let eventData = { iface };
		this.emit('node.delete', eventData);

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
				portList[port].disconnectAll(this._remote != null);
			}
		}

		let routes = iface.node.routes;
		if(routes.in.length !== 0){
			let inp = routes.in;
			for (let i=0; i < inp.length; i++) {
				inp[i].disconnect();
			}
		}

		routes.out?.disconnect();

		// Delete reference
		delete this.iface[iface.id];
		delete this.ref[iface.id];

		let parent = iface.node.instance._funcMain;
		if(parent != null)
			delete parent.ref[iface.id];

		this.emit('node.deleted', eventData);
	}

	clearNodes(){
		let list = this.scope('nodes').list;
		for (var i = 0; i < list.length; i++) {
			let temp = list[i].node;
			temp.destroy && temp.destroy();
		}

		list.splice(0);
		this.scope('cables').list.splice(0);

		super.clearNodes();
	}

	// Create new node that will be inserted to the container
	// @return node scope
	createNode(namespace, options, handlers){
		var node, func;
		if(!(namespace.prototype instanceof Blackprint.Node)){
			func = deepProperty(Blackprint.nodes, namespace.split('/'));

			if(func == null){
				if(namespace.startsWith("BPI/F/")){
					func = deepProperty(this.functions, namespace.slice(6).split('/'));

					if(func != null){
						func = func.node;
					}
					else return this.emit('error', {
						type: 'node_not_found',
						data: {namespace}
					});
				}
				else return this.emit('error', {
					type: 'node_not_found',
					data: {namespace}
				});
			}
		}
		else{
			func = namespace;
			if(func.type === 'function')
				namespace = "BPI/F/" + func.namespace;
			else throw new Error("Unrecognized node");
		}

		let time = Date.now();

		// Call the registered func (from this.registerNode)
		try{
			if(isClass(func))
				node = new func(this);
			else func(node = new Blackprint.Node(this));
		} catch(e){
			console.error("Error when processing:", namespace);
			throw e;
		}

		// Disable data flow on any node ports
		if(this.disablePorts) node.disablePorts = true;

		// Obtain iface from the node
		let iface = node.iface;
		if(iface === void 0)
			throw new Error(namespace+"> 'node.iface' was not found, do you forget to call 'node.setInterface()'?");

		iface.namespace = namespace;
		options ??= {};

		if(options.oldIface !== void 0 && options.oldIface.namespace === iface.namespace){
			try {
				Blackprint.Interface._reuse(iface, options.oldIface);
			} catch (e) {
				console.error("Failed to create node for:", namespace);
				throw e;
			}

			iface.input ??= {_portList: []};
			iface.output ??= {_portList: []};
			iface.property ??= {_portList: []};
		}

		// Create the linker between the node and the iface
		else{
			try {
				Blackprint.Interface._prepare(node, iface);
			} catch (e) {
				console.error("Failed to create node for:", namespace);
				throw e;
			}

			iface.input ??= {_portList: []};
			iface.output ??= {_portList: []};
			iface.property ??= {_portList: []};

			// Replace port prototype (intepreter port -> visual port)
			let _ports = Blackprint.Interface._ports;
			for (var i = 0; i < _ports.length; i++) {
				var localPorts = iface[_ports[i]]._portList;

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
		if(options.forceZIndex && options.z !== void 0){
			this.scope('nodes').list[options.z] = iface;
		}
		else{
			this.scope('nodes').list.push(iface);

			// Init after pushed into DOM tree
			node.routes._initForSketch();
		}

		if(iface.id !== void 0){
			this.iface[iface.id] = iface;
			this.ref[iface.id] = iface.ref;

			let parent = iface.node.instance._funcMain;
			if(parent != null)
				parent.ref[iface.id] = iface.ref;
		}

		if(iface.i !== void 0)
			this.ifaceList[iface.i] = iface;
		else this.ifaceList.push(iface);

		iface.importing = false;
		iface.comment = options.comment || '';

		if(iface.imported) iface.imported(savedData);
		if(node.imported) node.imported(savedData);

		if(handlers !== void 0)
			handlers.push(node);
		else if(node.init !== void 0)
			node.init();

		if(Blackprint.settings.windowless)
			iface.init?.();

		time = Date.now() - time;
		if(time > 500){
			this.emit('node.slow_creation', {
				namespace, time
			});
		}

		if(handlers == null && !Blackprint.settings.windowless){
			$.afterRepaint().then(()=>{
				let rect = iface.$el[0].firstElementChild.getBoundingClientRect();
				iface.w = rect.width;
				iface.h = rect.height;
			});
		}

		iface._updateDocs();

		this.emit('node.created', { iface });
		return iface;
	}

	createVariable(id, options){
		let temp = super.createVariable(id, options);
		this.variables.refresh?.();
		return temp;
	}

	createFunction(id, options){
		let temp = super.createFunction(id, options);
		this.functions.refresh?.();
		return temp;
	}

	async recalculatePosition(){
		let body = $(document.body);
		let switchVFX = !body.hasClass('blackprint-no-vfx');
		if(switchVFX) body.addClass('blackprint-no-vfx');

		if(this.ifaceList.length === 0 || this.ifaceList[0].$el == null)
			return;

		await $.afterRepaint();
		this.scope('container').resetOffset();
		await $.afterRepaint();

		let list = this.ifaceList.map(v => ({
			target: {model: v},
			contentRect: v.$el[0].firstElementChild.getBoundingClientRect()
		}));

		this.scope('nodes')._recalculate(list, true);
		if(switchVFX) body.removeClass('blackprint-no-vfx');

		this.pendingRender = false;

		// Also fix minimap
		let spaceId = this.scope.id;
		if(!spaceId.includes('+mini')){
			let minimap = this.scope.Space.list[spaceId+'+mini'];
			if(minimap != null){
				await $.afterRepaint();
				minimap('container').fixScaling();
			}
		}
	}
}

// Replace function from Blackprint Engine
Blackprint.registerNode = function(namespace, func, _fromDecorator=false){
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
		return claz => {
			this.registerNode(namespace, claz, true);
			return claz;
		}
	}

	let namespace_ = namespace;
	namespace = namespace.split('/');

	// Add with sf.Obj to trigger ScarletsFrame object binding update
	if(!(namespace[0] in Blackprint.nodes))
		sf.Obj.set(Blackprint.nodes, namespace[0], {});

	let isExist = deepProperty(Blackprint.nodes, namespace);
	if(isExist){
		if(this._scopeURL && isExist._scopeURL !== this._scopeURL){
			let _call = ()=> this.registerNode.apply(this, arguments);
			onModuleConflict(namespace.join('/'), isExist._scopeURL, this._scopeURL, _call);
			return;
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
	}

	let ref = Blackprint.nodes[namespace[0]];
	if(ref._length === void 0){
		Object.defineProperty(ref, 'hidden', {configurable: true, writable: true, value: false});
		Object.defineProperty(ref, 'disabled', {configurable: true, writable: true, value: false});
		Object.defineProperty(ref, '_length', {configurable: true, writable: true, value: 0});
		Object.defineProperty(ref, '_visibleNode', {configurable: true, writable: true, value: 0});
	}

	ref._length++;
	ref._visibleNode++;

	if(isClass(func)){
		let isExist = deepProperty(Blackprint.nodes, namespace);

		if(isExist !== void 0){
			hotRefreshNodePort('output', isExist, func);
			hotRefreshNodePort('input', isExist, func);
			hotRefreshNodeClass(isExist, func);
		}
	}

	func._scopeURL = this._scopeURL;
	deepProperty(Blackprint.nodes, namespace, func, function(obj){
		if(obj._length !== void 0)
			obj._length++;
		else{
			Object.defineProperty(obj, 'hidden', {configurable: true, writable: true, value: false});
			Object.defineProperty(obj, '_length', {configurable: true, writable: true, value: 1});
			Object.defineProperty(obj, '_visibleNode', {configurable: true, writable: true, value: 1});
		}
	});

	// For ScarletsFrame inspector
	func.prototype.sf$resolveSrc ??= {
		url: (new Error(1)).stack.split('\n')[_fromDecorator ? 3 : 2].split('://')[1],
		rawText: namespace_
	};
}

function hotRefreshNodeClass(old, now){
	let list = Blackprint.space.list;
	for (let key in list) {
		if(key === 'Space' || key === 'default') continue;
		let ifaces = list[key]('nodes').list;

		for (let i=0; i < ifaces.length; i++) {
			let iface = ifaces[i];
			if(iface.constructor === old)
				Object.setPrototypeOf(iface, now.prototype);
			else if(iface.node.constructor === old)
				Object.setPrototypeOf(iface.node, now.prototype);
			else if(iface.constructor.prototype instanceof old)
				deepPrototypeFindAndSet(iface.constructor, old, now);
			else if(iface.node.constructor.prototype instanceof old)
				deepPrototypeFindAndSet(iface.node.constructor, old, now);
		}
	}
}

function deepPrototypeFindAndSet(objClazz, old, now){
	if(objClazz == null) return;

	let current = Object.getPrototypeOf(objClazz);
	if(current === Object.prototype) return;

	if(current === old){
		Object.setPrototypeOf(objClazz.prototype, now.prototype);
		Object.setPrototypeOf(objClazz, now);
	}
	else deepPrototypeFindAndSet(current, old, now);
}

function hotRefreshNodePort(which, oldClaz, newClaz){
	let old = oldClaz[which];
	let now = newClaz[which];

	let remove = [];
	for (let key in old) {
		if(!isPortTypeSimilar(old[key], now[key])) remove.push(key);
	}

	let add = [];
	for (let key in now) {
		if(!isPortTypeSimilar(now[key], old[key])) add.push(key);
	}

	// Get Sketch instance list
	let list = Blackprint.space.list;
	for (let key in list) {
		if(key === 'Space' || key === 'default') continue;
		let ifaces = list[key]('nodes').list;

		for (let i=0; i < ifaces.length; i++) {
			let node = ifaces[i].node;
			for (let a=0; a < remove.length; a++) {
				node.deletePort(which, remove[a]);
			}
			for (let a=0; a < add.length; a++) {
				let name = add[a];
				node.createPort(which, name, now[name]);
			}
		}
	}
}

function isPortTypeSimilar(old, now){
	if(old === now) return true;

	if(old == null || now == null)
		throw new Error("Port type mustn't be null");

	if((old.isRoute && now.isRoute === false) || (now.isRoute && old.isRoute === false))
		return false;

	if((old.portFeature != null && now.portFeature == null) || now.portFeature != null && old.portFeature == null)
		return false;
	
	if(old.portFeature !== now.portFeature || old.portFeature == null || now.portFeature == null)
		return false;

	let feature = old.portFeature;
	let port = Blackprint.Port;

	if(feature === port.Default){
		if(old.portType !== now.portType || old.default !== now.default)
			return false;
	}
	else if(feature === port.ArrayOf){
		if(old.portType !== now.portType)
			return false;
	}
	else if(feature === port.Trigger){
		if(old.default.toString() !== now.default.toString())
			return false;
	}
	else if(feature === port.Union){
		if(old.portType.length !== now.portType.length)
			return false;
		
		let temp = old.portType;
		let temp2 = new Set(now.portType);
		for (let i=0; i < temp.length; i++) {
			if(!temp2.has(temp[i])) return false;
		}
	}

	return true;
}

// Override just for supporting hot reload
let _registerInterface = Blackprint.registerInterface;
Blackprint.registerInterface = function(templatePath, options, func, _fromDecorator=false){
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
		return claz => {
			this.registerInterface(templatePath, options, claz, true);
			return claz;
		}
	}

	// Pause registration if have conflict
	let info = onModuleConflict.pending.get(this._scopeURL);
	if(info != null) return info.pending.push({
		namespace: templatePath,
		_call: ()=> this.registerInterface.apply(this, arguments),
	});

	let isExist = Blackprint._iface[templatePath];
	if(isExist !== void 0){
		if(isClass(func))
			hotRefreshNodeClass(isExist, func);
		else if(isExist !== void 0 && options.extend !== void 0)
			hotRefreshNodeClass(isExist.extend, func.extend);
	}

	_registerInterface.call(this, templatePath, options, func);

	// For ScarletsFrame inspector
	func.prototype.sf$resolveSrc ??= {
		url: (new Error(1)).stack.split('\n')[_fromDecorator ? 3 : 2].split('://')[1],
		rawText: templatePath
	};
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
	temp.Sketch = Object.create(Blackprint.Sketch);
	let isInterfaceModule = /\.sf\.mjs$/m.test(cleanURL);

	// Save URL to the object
	temp.Sketch._scopeURL = temp._scopeURL = cleanURL.replace(/\.sf\.mjs$/m, '.min.mjs');

	if(Blackprint.loadBrowserInterface){
		if(window.sf === void 0)
			return console.log("[Blackprint] ScarletsFrame was not found, node interface for Blackprint Editor will not being loaded. You can also set `Blackprint.loadBrowserInterface` to false if you don't want to use node interface for Blackprint Editor.");

		let url = temp._scopeURL.replace(/(|\.min|\.es6)\.(js|mjs|ts)$/m, '');

		if(!isInterfaceModule && options.hasInterface){
			let noStyle = Blackprint.loadBrowserInterface === 'without-css';
			if(options != null && options.css === false)
				noStyle = false;

			if(!noStyle)
				sf.loader.css([url+'.sf.css']);

			sf.loader.mjs([url+'.sf.mjs']);
		}
	}

	if(options.hasDocs){
		let url = temp._scopeURL.replace(/(|\.min|\.es6)\.(js|mjs|ts)$/m, '');
		sf.$.getJSON(url+'.docs.json').then(Blackprint.Sketch.registerDocs);
	}

	return temp;
}

Blackprint._docs = {};
Blackprint.Sketch.registerDocs = function(obj){
	deepMerge(Blackprint._docs, obj);

	// Update every nodes that already been added to any active sketch instance
	let modelList = Blackprint.space.modelList;
	for (let key in modelList) {
		let ifaces = modelList[key].nodes.list;
		for (let i=0; i < ifaces.length; i++) {
			ifaces[i]._updateDocs();
		}
	}
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