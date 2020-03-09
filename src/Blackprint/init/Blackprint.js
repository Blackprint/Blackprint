class Blackprint{
	constructor(){
		this.index = Blackprint.index++;
		this.scope = Blackprint.space.getScope(this.index);
	}

	cloneContainer(){
		return Blackprint.space.getHTML(Blackprint.index);
	}

	registerHandler(namespace, func){
		_.set(Blackprint.nodes, namespace.split('/'), func);
	}

	registerNode(nodeType, func){
		if(/[^\w\-]/.test(nodeType) !== false)
			return console.error("nodeType can only contain character a-zA-Z0-9 and dashes");

		Blackprint.space.component(nodeType+'-node', function(self, root){
			root('nodes').extendNode(self, root);
			func(self, root);
		});
	}

	importJSON(json){
		if(json.constructor === String)
			json = JSON.parse(json);

		var version = json.version;
		delete json.version;

		var inserted = [];

		// Prepare all nodes depend on the namespace
		// before we create cables for them
		var namespace = Object.keys(json);
		for (var i = 0; i < namespace.length; i++) {
			var nodes = json[namespace[i]];

			// Every nodes that using this namespace name
			for (var a = 0; a < nodes.length; a++)
				inserted[nodes[a].id] = this.createNode(namespace[i], {
					x:nodes[a].x,
					y:nodes[a].y
				});
		}

		// Get cable model
		var cables = Blackprint.space.scope('cables');

		// RepeatedElement can from inputs, outputs, properties
		function findPortByName(RE, name){
			for (var i = 0; i < RE.length; i++) {
				if(RE[i].name === name)
					return {
						port:RE[i],
						rect:RE.getElement(i).querySelector('.port').getBoundingClientRect()
					};
			}

			return;
		}

		// Create cable only from outputs and properties
		for (var i = 0; i < namespace.length; i++) {
			var nodes = json[namespace[i]];

			// Every nodes that using this namespace name
			for (var a = 0; a < nodes.length; a++){
				var currentNode = inserted[nodes[a].id];

				// If have outputs connection
				if(nodes[a].outputs !== void 0){
					var out = nodes[a].outputs;
					var names = Object.keys(out);

					// Every outputs port that have connection
					for (var z = 0; z < names.length; z++) {
						var foundA = findPortByName(currentNode.outputs, names[z]);
						if(foundA === void 0){
							console.error("Port not found for", currentNode, "with name:", names[z]);
							continue;
						}

						var port = out[names[z]];

						// Current outputs's available targets
						for (var k = 0; k < port.length; k++) {
							var target = port[k];
							var targetNode = inserted[target.id];

							// Outputs can only meet input port
							var foundB = findPortByName(targetNode.inputs, target.name);
							if(foundB === void 0){
								console.error("Port not found for", targetNode, "with name:", names[z]);
								continue;
							}

							// Create cable from NodeA
							cables.currentCable = currentNode.createCable(foundA.rect, foundA.port);

							// Positioning the cable head2 into target port position from NodeB
							var center = foundB.rect.width/2;
							cables.currentCable.head2 = [foundB.rect.x+center, foundB.rect.y+center];

							// Connect cable to NodeB
							targetNode.cableConnect(foundB.port);
							console.log('nyam', foundA, foundB);
						}
					}
				}

				// cables.createCable();
				// cables.currentCable
			}
		}

		console.log(json);
		console.log(inserted);
	}

	// @return node scope
	createNode(namespace, options){
		var func = _.get(Blackprint.nodes, namespace.split('/'));
		if(func === void 0)
			return console.error('Node for', namespace, "was not found") && void 0;

		// Processing scope is different with node scope
		var handle = {}, node = {type:'default'};
		func(handle, node);

		// Type extract for port data type
		// Create reactiveness of handle and node's ports
		function extract(which){
			var link = node[which] = [];
			var local = handle[which];
			if(local === void 0)
				return;

			var temp = Object.keys(local);
			for (let i = 0; i < temp.length; i++) {
				var prepare = {
					get:function(){
						if(link[i].value === void 0){
							if(link[i].root === void 0)
								return link[i].default;

							// Run from root node and stop when reach this node
							link[i].root(link[i]);
						}

						return link[i].value;
					}
				};

				// Can only obtain data when accessing input port
				if(which !== 'inputs'){
					prepare.set = function(val){
						link[i].value = val;
						return link[i].value || link[i].default;
					}
				}

				// Determine type and add default value for each type
				var type, def;
				if(typeof local[temp[i]] === 'function'){
					type = local[temp[i]];

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
				else if(local[temp[i]] === null)
					type = {name:'Any'};
				else type = local[temp[i]].constructor;

				// Set for the linked node
				link.push({name:temp[i], type:type, default:def, cables:[]});

				// Set on the local scope
				Object.defineProperty(local, temp[i], prepare);
			}
		}

		var portType = ['inputs', 'outputs', 'properties'];
		for (var i = 0; i < portType.length; i++)
			extract(portType[i]);

		if(options !== void 0)
			Object.assign(node, options);

		// Node is become the component scope
		this.scope('nodes').list.push(node);
		console.log(node);
		return node;
	}
}

Blackprint.nodes = {};
Blackprint.index = 0;

// Start private scope for Blackprint Module
;(function(){

// Let's define `Space` that handle model and component as global variable on our private scope
var Space = Blackprint.space = sf.space('blackprint', {
	templatePath:'Blackprint/page.html'
});