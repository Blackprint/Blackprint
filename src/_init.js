// ToDo: Export as module instead to window
if(window.Blackprint === void 0)
	throw "Blackprint Engine must be loaded before Blackprint Sketch";

let { $ } = sf; // sQuery shortcut
var Blackprint = window.Blackprint;

Blackprint.Sketch = class Sketch extends Blackprint.Engine.CustomEvent {
	iface = {};
	ifaceList = [];

	// Create new blackprint container
	constructor(){
		super();

		this.index = Blackprint.index++;
		this.scope = Blackprint.space.getScope(this.index);
		this.scope.sketch = this;

		this.getNode = Blackprint.Engine.prototype.getNode;
		this.getNodes = Blackprint.Engine.prototype.getNodes;

		this._event = {$_fallback: BlackprintEventFallback};
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

		var version = json.version;
		delete json.version;

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
		let metaData = json._ = {};

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
			metaData.env = Blackprint.Environment.map;

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
			metaData.moduleJS = [...modules];

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
		var func = deepProperty(Blackprint.nodes, namespace.split('/'));
		if(func === void 0){
			this._trigger('error', {
				type: 'node_not_found',
				data: {namespace}
			});

			return;
		}

		let time = Date.now();

		// Processing scope is different with node scope
		var node = {}, iface = new Blackprint.Node(this);

		iface.node = node;
		iface.namespace = namespace;
		iface.importing = true;
		iface.env = Blackprint.Environment.map;

		// Call the registered func (from this.registerNode)
		func(node, iface);

		if(Blackprint.Engine.Node === void 0)
			throw new Error("Blackprint.Engine was not found, please load it first before creating new node");

		// Create the linker between the node and the iface
		Blackprint.Engine.Node.prepare(node, iface);

		iface.input ??= {};
		iface.output ??= {};
		iface.property ??= {};

		// Replace port prototype (intepreter port -> visual port)
		['input', 'output', 'property'].forEach(function(which){
			var localPorts = iface[which];
			for(var portName in localPorts)
				Object.setPrototypeOf(localPorts[portName], Port.prototype);
		});

		Blackprint.Node.prepare(node, iface);

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
		if(time > 1000){
			this._trigger('slow_node_creation', {
				namespace, time
			});
		}

		return iface;
	}
}

var NOOP = function(){};

// Register new iface type
Blackprint.Browser = {
	registerInterface(templatePath, options, func){
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

		if(options.extend === void 0){
			if(func !== void 0 && Object.getPrototypeOf(func) !== Function.prototype){
				options.extend = func;
				func = NOOP;
			}
			else options.extend = Blackprint.Node;
		}

		if(options.extend !== Blackprint.Node && !(options.extend.prototype instanceof Blackprint.Node))
			throw new Error(options.extend.constructor.name+" must be instance of Blackprint.Node");

		if(func === void 0)
			func = NOOP;

		var nodeName = templatePath.replace(/[\\/]/g, '-').toLowerCase();
		nodeName = nodeName.replace(/\.\w+$/, '');

		// Just like how we do it on ScarletsFrame component with namespace feature
		Blackprint.space.component(nodeName, options, func);
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