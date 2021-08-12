Blackprint.Node = class NodeInteface extends Blackprint.Engine.CustomEvent{
	/*
	x = 0;
	y = 0;

	input = {};
	output = {};
	property = {};
	*/

	static _ports = ['input', 'output', 'property'];

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
		// Default Node property
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
		var x = e.movementX / scale;
		var y = e.movementY / scale;

		this.x += x;
		this.y += y;

		if(container.onNodeMove !== void 0)
			container.onNodeMove(e, this);

		let nonce;

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
					let ref = cables[a];

					// If the source and target is in current node
					if(ref.owner.iface === this && (ref.target && ref.target.iface === this)){
						if(nonce === void 0){
							nonce = Date.now() + Math.random();
							ref._nonce = nonce;
						}
						else if(ref._nonce === nonce)
							continue;

						let { head1, head2 } = ref;

						head1[0] += x;
						head1[1] += y;

						head2[0] += x;
						head2[1] += y;
						continue;
					}

					if(ref.owner.iface === this)
						cable = ref.head1;
					else
						cable = ref.head2;

					cable[0] += x;
					cable[1] += y;
				}
			}
		}
	}

	nodeMenu(ev){
		var scope = this.#scope;
		var menu = [{
			title: 'Delete',
			args: [this],
			callback(iface){
				var list = scope('nodes').list;
				var i = list.indexOf(iface);

				if(i === -1)
					return scope.sketch._trigger('error', {
						type: 'node_delete_not_found',
						data: {iface}
					});

				scope.$destroyed = true;
				list.splice(i, 1);

				var check = Blackprint.Node._ports;
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