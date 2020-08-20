// Start private scope for Blackprint Module
;(function(global, factory){
  if(typeof exports === 'object' && typeof module !== 'undefined')
  	return module.exports = factory(global);
  factory(global);
}(typeof window !== "undefined" ? window : this, (function(window){

if(window.Blackprint === void 0)
	window.Blackprint = {
		settings:function(which, val){
			Blackprint.settings[which] = val;
		}
	};

var Blackprint = window.Blackprint;

Blackprint.Sketch = class Sketch{
	// Create new blackprint container
	constructor(){
		this.index = Blackprint.index++;
		this.scope = Blackprint.space.getScope(this.index);
	}

	settings(which, val){
		Blackprint.settings[which] = val;
	}

	// Clone current container index
	cloneContainer(index){
		return Blackprint.space.createHTML(index || Blackprint.index);
	}

	// Import node positions and cable connection from JSON
	importJSON(json){
		if(json.constructor === String)
			json = JSON.parse(json);

		var version = json.version;
		delete json.version;

		var inserted = [];
		var handlers = [];

		// Prepare all nodes depend on the namespace
		// before we create cables for them
		for(var namespace in json){
			var nodes = json[namespace];

			// Every nodes that using this namespace name
			for (var a = 0; a < nodes.length; a++){
				var nodeOpt = {
					x:nodes[a].x,
					y:nodes[a].y
				};

				if(nodes[a].options !== void 0)
					nodeOpt.options = nodes[a].options;

				inserted[nodes[a].id] = this.createNode(namespace, nodeOpt, handlers);
			}
		}

		// Create cable only from outputs and properties
		// > Important to be separated from above, so the cable can reference to loaded nodes
		for(var namespace in json){
			var nodes = json[namespace];

			// Every nodes that using this namespace name
			for (var a = 0; a < nodes.length; a++){
				var node = inserted[nodes[a].id];

				// If have outputs connection
				if(nodes[a].outputs !== void 0){
					var out = nodes[a].outputs;

					// Every outputs port that have connection
					for(var portName in out){
						var linkPortA = node.outputs[portName];
						if(linkPortA === void 0){
							console.error("Node port not found for", node, "with name:", portName);
							continue;
						}

						var port = out[portName];

						// Current outputs's available targets
						for (var k = 0; k < port.length; k++) {
							var target = port[k];
							var targetNode = inserted[target.id];

							// Outputs can only meet input port
							var linkPortB = targetNode.inputs[target.name];
							if(linkPortB === void 0){
								console.error("Node port not found for", targetNode, "with name:", target.name);
								continue;
							}

							// Create cable from NodeA
							var rectA = getPortRect(node.outputs, portName);
							var cable = linkPortA.createCable(rectA);

							// Positioning the cable head2 into target port position from NodeB
							var rectB = getPortRect(targetNode.inputs, target.name);
							var center = rectB.width/2;
							cable.head2 = [rectB.x+center, rectB.y+center];

							// Connect cables.currentCable to target port on NodeB
							linkPortB.connectCable(cable);
						}
					}
				}
			}
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

		if(options && options.exclude)
			exclude = options.exclude;

		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if(exclude.includes(node.namespace))
				continue;

			if(json[node.namespace] === void 0)
				json[node.namespace] = [];

			var data = {
				id:i,
				x: Math.round(node.x),
				y: Math.round(node.y),
			};

			if(node.options !== void 0){
				data.options = {};

				deepCopy(data.options, node.options);
			}

			if(node.outputs !== void 0){
				var outputs = data.outputs = {};
				var outputs_ = node.outputs;

				var haveValue = false;
				for(var name in outputs_){
					if(outputs[name] === void 0)
						outputs[name] = [];

					var port = outputs_[name];
					var cables = port.cables;

					for (var a = 0; a < cables.length; a++) {
						var target = cables[a].owner === port ? cables[a].target : cables[a].owner;
						if(target === void 0)
							continue;

						var id = nodes.indexOf(target.node);
						if(exclude.includes(nodes[id].namespace))
							continue;

						haveValue = true;
						outputs[name].push({
							id:id,
							name:target.name
						});
					}
				}

				if(haveValue === false)
					delete data.outputs;
			}

			json[node.namespace].push(data);
		}

		return JSON.stringify(json);
	}

	clearNodes(){
		sketch.scope('nodes').list.splice(0);
		sketch.scope('cables').list.splice(0);
	}

	// Create new node that will be inserted to the container
	// @return node scope
	createNode(namespace, options, handlers){
		var func = deepProperty(Blackprint.nodes, namespace.split('/'));
		if(func === void 0)
			return console.error('Node for', namespace, "was not found, maybe .registerNode() haven't being called?") && void 0;

		// Processing scope is different with node scope
		var handle = {}, node = new Blackprint.Node(this);
		node.handle = handle;
		node.namespace = namespace;
		node.importing = true;

		// Call the registered func (from this.registerNode)
		func(handle, node);

		if(Blackprint.Interpreter.Node === void 0)
			throw new Error("Blackprint.Interpreter was not found, please load it first before creating new node");

		// Create the linker between the handler and the node
		Blackprint.Interpreter.Node.prepare(handle, node);

		// Replace port prototype (intepreter port -> visual port)
		['inputs', 'outputs', 'properties'].forEach(function(which){
			var localPorts = node[which];
			for(var portName in localPorts)
				Object.setPrototypeOf(localPorts[portName], Port.prototype);
		});

		Blackprint.Node.prepare(handle, node);

		var savedOpt = options.options;
		delete options.options;

		// Assign the node options if exist
		if(options !== void 0)
			Object.assign(node, options);

		// Node is become the component scope
		// equal to calling registerInterface's registered function
		this.scope('nodes').list.push(node);
		node.importing = false;

		node.imported && node.imported(savedOpt);
		handle.imported && handle.imported(savedOpt);

		if(handlers !== void 0)
			handlers.push(handle);
		else if(handle.init !== void 0)
			handle.init();

		return node;
	}
}

// Register node handler
// Callback function will get handle and node
// - handle = Blackprint binding
// - node = ScarletsFrame binding <~> element
Blackprint.registerNode = function(namespace, func){
	deepProperty(Blackprint.nodes, namespace.split('/'), func);
}

var NOOP = function(){};

// Register new node type
Blackprint.registerInterface = function(templatePath, options, func){
	if(options.constructor === Function){
		func = options;
		options = {};
	}

	if(options.extend === void 0)
		options.extend = Blackprint.Node;

	if(options.template === void 0)
		options.template = templatePath+'.html';
	else
		options.template += '.html';

	if(options.extend !== Blackprint.Node && !(options.extend.prototype instanceof Blackprint.Node))
		throw new Error(options.extend.constructor.name+" must be instance of Blackprint.Node");

	if(func === void 0)
		func = NOOP;

	var nodeName = templatePath.replace(/[\\/]/g, '-').toLowerCase();
	nodeName = nodeName.split('.html')[0];

	// Just like how we do it on ScarletsFrame component with namespace feature
	Blackprint.space.component(nodeName, options, func);
}

Blackprint.nodes = {};
Blackprint.availableNode = Blackprint.nodes; // To display for available dropdown nodes
Blackprint.index = 0;
Blackprint.template = {
	outputPort:'Blackprint/nodes/template/output-port.html'
};

// Let's define `Space` that handle model and component as global variable on our private scope
var Space = Blackprint.space = sf.space('blackprint', {
	templatePath:'Blackprint/page.html'
});