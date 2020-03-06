class Blackprint{
	constructor(){
		this.index = Blackprint.index++;
		this.scope = Blackprint.space.getScope(this.index);
	}

	cloneContainer(){
		return Blackprint.space.getHTML(Blackprint.index);
	}

	registerNode(namespace, func){
		_.set(Blackprint.nodes, namespace.split('/'), func);
	}

	createNode(namespace, options){
		var func = _.get(Blackprint.nodes, namespace.split('/'));
		if(func === void 0)
			return console.error('Node for', namespace, "was not found") && void 0;

		var self = {};
		func(self);

		// Prepare to be pushed as node
		var node = {
			title:self.title,
			description:self.description || ''
		};

		// Type extract for port data type
		function extract(which){
			var link = node[which] = [];
			var local = self[which];
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

				var type, def;
				if(typeof local[temp[i]] === 'function'){
					type = local[temp[i]];

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

		// Get model scope
		var nodes = this.scope('nodes');

		// This may not return the component, but only the raw object
		node = nodes.list[nodes.list.push(node)-1];
		if(options !== void 0)
			Object.assign(node, options);
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