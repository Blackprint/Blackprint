// Start private scope for Blackprint Module
;(function(){
var backup = window.Blackprint;

var Blackprint = window.Blackprint = class Blackprint{
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
		return Blackprint.space.getHTML(index || Blackprint.index);
	}

	// Register node handler
	// Callback function will get handle and node
	// - handle = Blackprint binding
	// - node = ScarletsFrame binding <~> element
	registerNode(namespace, func){
		deepProperty(Blackprint.nodes, namespace.split('/'), func);
	}

	// Register new node type
	registerInterface(nodeType, options, func){
		if(/[^\w\-]/.test(nodeType) !== false)
			return console.error("nodeType can only contain character a-zA-Z0-9 and dashes");

		if(options.extend === void 0 || options.template === void 0)
			throw new Error("Please define the node template and the extend options");

		if(!(options.extend.prototype instanceof Blackprint.Node))
			throw new Error(options.extend.constructor.name+" must be instance of Blackprint.Node");

		// Just like how we do it on ScarletsFrame component with namespace feature
		Blackprint.space.component(nodeType+'-node', options, func);
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
			for (var a = 0; a < nodes.length; a++)
				inserted[nodes[a].id] = this.createNode(namespace,
					Object.assign({
						x:nodes[a].x,
						y:nodes[a].y
					}, nodes[a].options), handlers);
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

	exportJSON(){
		var nodes = Blackprint.space.scope('nodes').list;
		var json = {};

		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if(json[node._namespace] === void 0)
				json[node._namespace] = [];

			var data = {
				id:i,
				x:node.x,
				y:node.y,
			};

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

						haveValue = true;
						outputs[name].push({
							id:nodes.indexOf(target.node),
							name:target.name
						});
					}
				}

				if(haveValue === false)
					delete data.outputs;
			}

			json[node._namespace].push(data);
		}

		console.log(nodes);
		return JSON.stringify(json);
	}

	// Create new node that will be inserted to the container
	// @return node scope
	createNode(namespace, options, handlers){
		var func = deepProperty(Blackprint.nodes, namespace.split('/'));
		if(func === void 0)
			return console.error('Node for', namespace, "was not found, maybe .registerNode() haven't being called?") && void 0;

		// Processing scope is different with node scope
		var handle = {}, node = {type:'default', title:'No Title', description:''};
		node.handle = handle;
		node._namespace = namespace;

		// Call the registered func (from this.registerNode)
		func(handle, node);

		if(Blackprint.Interpreter.Node === void 0){
			throw new Error("Blackprint.Interpreter was not found, please load it first before creating new node");
		}

		// Create the linker between the handler and the node
		Blackprint.Interpreter.Node.prepare(handle, node);

		// Replace port prototype (intepreter port -> visual port)
		['inputs', 'outputs', 'properties'].forEach(function(which){
			var localPorts = node[which];
			for(var portName in localPorts)
				Object.setPrototypeOf(localPorts[portName], Port.prototype);
		});

		// Assign the options if exist
		if(options !== void 0)
			Object.assign(node, options);

		// Node is become the component scope
		this.scope('nodes').list.push(node);

		if(handlers !== void 0)
			handlers.push(handle);
		else if(handle.init !== void 0)
			handle.init();

		return node;
	}
}

// Combine other plugin if exist
if(backup !== void 0){
	Object.assign(Blackprint, backup);
	backup = void 0;
}

Blackprint.nodes = {};
Blackprint.index = 0;
Blackprint.settings = {};
Blackprint.template = {
	outputPort:'Blackprint/nodes/template/output-port.html'
};

// Let's define `Space` that handle model and component as global variable on our private scope
var Space = Blackprint.space = sf.space('blackprint', {
	templatePath:'Blackprint/page.html'
});