Blackprint.Node = class NodeInteface extends Blackprint.Engine.CustomEvent{
	/*
	x = 0;
	y = 0;

	inputs = {};
	outputs = {};
	properties = {};
	*/

	static _ports = ['inputs', 'outputs', 'properties'];

	interface = 'bp/default';
	title = 'No Title';
	description = '';

	#scope;
	#container;
	constructor(sketch){
		super();
		this.#scope = sketch.scope;
		this.#container = sketch.scope('container');
	}

	static prepare(node, iface){
		// Default Node properties
		iface.x = 0;
		iface.y = 0;
	}

	newPort(portName, type, def, which, iface){
		var temp = new Blackprint.Engine.Port(portName, type, def, which, iface);
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

		// Also move all cable connected to current iface
		var ports = Blackprint.Node._ports;
		for(var i=0; i<ports.length; i++){
			var which = this[ports[i]];

			for(var key in which){
				var cables = which[key].cables;
				if(cables.length === 0)
					continue;

				var cable;
				for (var a = 0; a < cables.length; a++) {
					if(cables[a].owner.iface === this)
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
			callback:function(iface){
				var list = scope('nodes').list;
				var i = list.indexOf(iface);

				if(i === -1)
					return console.error("Node was not found on the list", iface);

				list.splice(i, 1);

				var check = ['outputs', 'inputs', 'properties'];
				for (var i = 0; i < check.length; i++) {
					var portList = iface[check[i]];
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