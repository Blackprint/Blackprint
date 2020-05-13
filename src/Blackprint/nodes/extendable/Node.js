;(function(){
var root = Blackprint.space.scope;
var container;

// Run when all ready
$(function(){
	container = root('container');
});

function moveCables(node, e, which){
	// Move the connected cables
	for(var key in which){
		var cables = which[key].cables;
		if(cables.length === 0)
			continue;

		var cable;
		for (var a = 0; a < cables.length; a++) {
			if(cables[a].owner.node === node)
				cable = cables[a].head1;
			else
				cable = cables[a].head2;

			cable[0] += e.movementX / container.scale;
			cable[1] += e.movementY / container.scale;
		}
	}
}

class Node extends CustomEvent{
	/*
	x = 0;
	y = 0;

	inputs = {};
	outputs = {};
	properties = {};
	*/

	static prepare(handle, node){
		// Type extract for port data type
		// Create reactiveness of handle and node's ports
		['inputs', 'outputs', 'properties'].forEach(function(which){
			node[which] = {}; // Handled by ScarletsFrame

			var localPorts = handle[which]; // Handled by registered node handler
			if(localPorts === void 0)
				return;

			for(let portName in localPorts){
				let port = localPorts[portName]; // Handled by registered node handler

				// Determine type and add default value for each type
				var type, def, haveFeature;
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
					else if(type.constructor === Function){
						if(type.portFeature !== void 0){
							haveFeature = type.portFeature;
							type = type.portType || Object;
						}
						else type = Function;

						def = void 0;
					}
					else return console.error(type, "was unrecognized as an port data type");
				}
				else if(port === null){
					type = {name:'Any'};
					def = null;
				}
				else{
					type = port.constructor;
					def = port;
				}

				var linkedPort = node[which][portName] = new Port(portName, type, def, which, node);
				if(haveFeature){
					linkedPort.feature = haveFeature;
					linkedPort._call = port;
				}

				// Set on the localPorts scope
				if(type === Function){
					if(which === 'outputs')
						Object.defineProperty(localPorts, portName, {enumerable:true, writable:false, value:linkedPort.createLinker()});
				}
				else Object.defineProperty(localPorts, portName, linkedPort.createLinker());
			}
		});

		Object.defineProperty(node, '_requsting', {writable:true, value:false});
	}

	// DragMove event handler
	moveNode(e){
		this.x += e.movementX / container.scale;
		this.y += e.movementY / container.scale;

		// Also move all cable connected to current node
		moveCables(this, e, this.inputs);
		moveCables(this, e, this.outputs);
		moveCables(this, e, this.properties);
	}

	nodeMenu(ev){
		var menu = [{
			title:'Delete',
			args:[this],
			callback:function(node){
				var list = root('nodes').list;
				var i = list.indexOf(node);

				if(i === -1)
					return console.error("Node was not found on the list", node);

				list.splice(i, 1);

				var check = ['outputs', 'inputs', 'properties'];
				for (var i = 0; i < check.length; i++) {
					var portList = node[check[i]];
					for(var port in portList){
						var cables = portList[port].cables;
						for (var a = cables.length - 1; a >= 0; a--)
							cables[a].destroy();
					}
				}
			}
		}];

		this._trigger('node.menu', {node:this, menu:menu});
		root('dropdown').show(menu, ev.clientX, ev.clientY);
	}
}

Blackprint.Node = Node;
})();