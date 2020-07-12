Blackprint.Node = class Node extends Blackprint.Interpreter.CustomEvent{
	/*
	x = 0;
	y = 0;

	inputs = {};
	outputs = {};
	properties = {};
	*/

	static _ports = ['inputs', 'outputs', 'properties'];

	type = 'default';
	title = 'No Title';
	description = '';

	#scope;
	#container;
	constructor(sketch){
		super();
		this.#scope = sketch.scope;
		this.#container = sketch.scope('container');
	}

	static prepare(handle, node){
		// Default Node properties
		node.x = 0;
		node.y = 0;
	}

	newPort(portName, type, def, which, node){
		var temp = new Blackprint.Interpreter.Port(portName, type, def, which, node);
		temp._scope = this.#scope;
		Object.setPrototypeOf(temp, Port.prototype);
		return temp;
	}

	// DragMove event handler
	moveNode(e){
		var container = this.#container;
		var scale = container.scale;
		this.x += e.movementX / scale;
		this.y += e.movementY / scale;

		// Also move all cable connected to current node
		var ports = Blackprint.Node._ports;
		for(var i=0; i<ports.length; i++){
			var which = this[ports[i]];

			for(var key in which){
				var cables = which[key].cables;
				if(cables.length === 0)
					continue;

				var cable;
				for (var a = 0; a < cables.length; a++) {
					if(cables[a].owner.node === this)
						cable = cables[a].head1;
					else
						cable = cables[a].head2;

					cable[0] += e.movementX / container.scale;
					cable[1] += e.movementY / container.scale;
				}
			}
		}
	}

	nodeMenu(ev){
		var scope = this.#scope;
		var menu = [{
			title:'Delete',
			args:[this],
			callback:function(node){
				var list = scope('nodes').list;
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

		this._trigger('node.menu', menu);
		scope('dropdown').show(menu, ev.clientX, ev.clientY);
	}
}