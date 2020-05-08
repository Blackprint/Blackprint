// Start private scope for Blackprint Module
;(function(){

class Blackprint{
	// Create new blackprint container
	constructor(){
		this.index = Blackprint.index++;
		this.scope = Blackprint.space.getScope(this.index);
	}

	// Clone current container index
	cloneContainer(index){
		return Blackprint.space.getHTML(index || Blackprint.index);
	}

	// Register node handler
	// Callback function will get handle and node
	// - handle = ScarletsFrame binding
	// - node = Blackprint binding
	registerNode(namespace, func){
		_.set(Blackprint.nodes, namespace.split('/'), func);
	}

	// Register new node type
	registerNodeType(nodeType, func){
		if(/[^\w\-]/.test(nodeType) !== false)
			return console.error("nodeType can only contain character a-zA-Z0-9 and dashes");

		Blackprint.space.component(nodeType+'-node', function(self, root){
			root('nodes').extendNode(self, root);
			func(self, root);
		});
	}

	// Import node positions and cable connection from JSON
	importJSON(json){
		if(json.constructor === String)
			json = JSON.parse(json);

		var version = json.version;
		delete json.version;

		var inserted = [];

		// Prepare all nodes depend on the namespace
		// before we create cables for them
		for(var namespace in json){
			var nodes = json[namespace];

			// Every nodes that using this namespace name
			for (var a = 0; a < nodes.length; a++)
				inserted[nodes[a].id] = this.createNode(namespace, {
					x:nodes[a].x,
					y:nodes[a].y
				});
		}

		// Get cable model
		var cables = Blackprint.space.scope('cables');

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
							cables.currentCable = node.createCable(rectA, portName);

							// Positioning the cable head2 into target port position from NodeB
							var rectB = getPortRect(targetNode.inputs, target.name);
							var center = rectB.width/2;
							cables.currentCable.head2 = [rectB.x+center, rectB.y+center];

							// Connect cables.currentCable to target port on NodeB
							targetNode.cableConnect(target.name);
						}
					}
				}
			}
		}

		return inserted;
	}

	// Create new node that will be inserted to the container
	// @return node scope
	createNode(namespace, options){
		var func = _.get(Blackprint.nodes, namespace.split('/'));
		if(func === void 0)
			return console.error('Node for', namespace, "was not found") && void 0;

		// Processing scope is different with node scope
		var handle = {}, node = {type:'default', title:'No Title', description:''};
		func(handle, node);

		// Type extract for port data type
		// Create reactiveness of handle and node's ports
		function extract(which){
			node[which] = {}; // Handled by ScarletsFrame

			var localPorts = handle[which]; // Handled by registered node handler
			if(localPorts === void 0)
				return;

			for(let portName in localPorts){
				let port = localPorts[portName]; // Handled by registered node handler

				// Determine type and add default value for each type
				var type, def;
				if(typeof port === 'function'){
					type = port;

					// Give default value for each data type
					if(type === Number)
						def = 0;
					else if(type === Boolean)
						def = false;
					else if(type === String)
						def = '';
					else if(type === Array)
						def = [];
					else if(type === Object)
						def = {};
					else if(type.constructor === Function)
						def = void 0;
					else return console.error(type, "was unrecognized as an port data type");
				}
				else if(port === null)
					type = {name:'Any'};
				else type = port.constructor;

				// Set for the linked port (Handle for ScarletsFrame)
				// ex: linkedPort = node.outputs.portName
				let linkedPort = node[which][portName] = {type:type, default:def, cables:[]};
				var prepare = {
					get:function(){
						if(linkedPort.value === void 0){
							if(linkedPort.root === void 0)
								return linkedPort.default;

							// Run from root node and stop when reach this node
							linkedPort.root(linkedPort);
						}

						return linkedPort.value;
					}
				};

				// Can only obtain data when accessing input port
				if(which !== 'inputs'){
					prepare.set = function(val){
						linkedPort.value = val;
						return linkedPort.value || linkedPort.default;
					}
				}


				// Set on the localPorts scope
				Object.defineProperty(localPorts, portName, prepare);
			}
		}

		var portType = ['inputs', 'outputs', 'properties'];
		for (var i = 0; i < portType.length; i++)
			extract(portType[i]);

		if(options !== void 0)
			Object.assign(node, options);

		// Node is become the component scope
		this.scope('nodes').list.push(node);
		return node;
	}
}

window.Blackprint = Blackprint;
Blackprint.nodes = {};
Blackprint.index = 0;
Blackprint.template = {
	outputPort:'Blackprint/nodes/template/output-port.html'
};

// Let's define `Space` that handle model and component as global variable on our private scope
var Space = Blackprint.space = sf.space('blackprint', {
	templatePath:'Blackprint/page.html'
});