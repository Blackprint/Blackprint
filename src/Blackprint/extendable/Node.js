;(function(){
var root = Blackprint.space.scope;
var container;

// Run when all ready
$(function(){
	container = root('container');
});

class Node extends CustomEvent{
	/*
	x = 0;
	y = 0;

	inputs = {};
	outputs = {};
	properties = {};
	*/

	// DragMove event handler
	moveNode(e){
		this.x += e.movementX * container.multiplier;
		this.y += e.movementY * container.multiplier;

		// Also move all cable connected to current node
		this.moveCables(e, this.inputs);
		this.moveCables(e, this.outputs);
		this.moveCables(e, this.properties);
	}

	moveCables(e, which){
		// Move the connected cables
		for(var key in which){
			var cables = which[key].cables;
			if(cables.length === 0)
				continue;

			for (var a = 0; a < cables.length; a++) {
				var cable;
				if(cables[a].owner[0] === this)
					cable = cables[a].head1;
				else
					cable = cables[a].head2;

				cable[0] += e.movementX * container.multiplier;
				cable[1] += e.movementY * container.multiplier;
			}
		}
	}

	// Determine port source
	getPortSourceName(key){
		if(this.outputs[key] !== void 0)
			return 'outputs';
		else if(this.properties[key] !== void 0)
			return 'properties';
		return 'inputs';
	}

	getPortName(item){
		var check = ['outputs', 'inputs', 'properties'];
		for (var i = 0; i < check.length; i++) {
			var ref = this[check[i]];

			for(var key in ref)
				if(ref[key] === item)
					return key;
		}
	}

	// PointerDown event handler
	createCable(e, key){
		var source = this.getPortSourceName(key);
		var isAuto = e.constructor === DOMRect;

		// ex: port = this.outputs.A;
		var port = this[source][key];

		// Get size and position of the port
		var rect = isAuto ? e : e.target.getBoundingClientRect();
		var center = rect.width/2;

		// Create cable and save the reference
		var cable = root('cables').createCable({
			x:rect.x + center,
			y:rect.y + center,
			type:!port.type ? 'Any' : port.type.name,
			source:source
		});

		// Connect this cable into port's cable list
		port.cables.push(cable);

		// Put port reference to the cable
		cable.owner = [this, port];

		// Stop here if this function wasn't triggered by user
		if(isAuto)
			return cable;

		// Default head index is "2" when creating new cable
		root('cables').cableHeadClicked(cable, 2);
		this._trigger('cableCreated', cable);
	}

	removeCable(cable){
		// Remove from cable owner
		if(cable.owner){
			var i = cable.owner[1].cables.indexOf(cable);
			if(i !== -1)
				cable.owner[1].cables.splice(i, 1);
		}

		// Remove from connected target
		if(cable.target){
			var i = cable.target[1].cables.indexOf(cable);
			if(i !== -1)
				cable.target[1].cables.splice(i, 1);
		}

		var list = root('cables').list;

		// Remove from cable list
		list.splice(list.indexOf(cable), 1);
		console.log('A cable was removed', cable);
	}

	// PointerUp event handler
	cableConnect(key){
		// Get currect cable and the port source name
		var cable = root('cables').currentCable;
		var source = this.getPortSourceName(key);

		// Remove cable if ...
		if(cable.owner[0] === this // It's referencing to same node
			|| (cable.source === 'outputs' && source !== 'inputs') // Output source not connected to input
			|| (cable.source === 'inputs' && source !== 'outputs')  // Input source not connected to output
			|| (cable.source === 'properties' && source !== 'properties')  // Property source not connected to property
		){
			console.log(cable.owner[0], this, cable.source, source);
			this.removeCable(cable);
			return;
		}

		// ex: port = this.outputs.A;
		var port = this[source][key];
		var sourceCables = cable.owner[1].cables;

		// Remove cable if there are similar connection for the ports
		for (var i = 0; i < sourceCables.length; i++) {
			if(port.cables.includes(sourceCables[i])){
				console.log("Duplicate connection");
				this.removeCable(cable);
				return;
			}
		}

		// Connect this cable into port's cable list
		port.cables.push(cable);

		// Put port reference to the cable
		cable.target = [this, port];
		console.log('A cable was connected', port);

		this._trigger('cableConnected', cable);
	}

	// PointerOver event handler
	portHovered(event, item){
		// For magnet sensation when the cable reach the port
		root('cables').hoverPort = {
			elem:event.target,
			rect:event.target.getBoundingClientRect(),
			item:item
		};
	}

	// PointerOut event handler
	portUnhovered(){
		root('cables').hoverPort = false;
	}

	portRightClick(ev, key, val){
		var menu = [];
		this._trigger('portMenu', {key:key, val:val, menu:menu});

		var cables = val.cables;
		for (var i = 0; i < cables.length; i++) {
			var target = cables[i].owner[0] === this ? cables[i].target : cables[i].owner;
			if(target === void 0)
				continue;

			menu.push({
				title:"Disconnect "+target[0].title+`(${key} ~ ${target[0].getPortName(target[1])})`,
				args:[cables[i]],
				callback:root('cables').disconnectCable
			});
		}

		if(menu.length === 0)
			return;

		var pos = ev.target.getClientRects()[0];
		root('dropdown').show(menu, pos.x, pos.y);
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
							node.removeCable(cables[a]);
					}
				}
			}
		}];

		this._trigger('nodeMenu', {node:this, menu:menu});
		root('dropdown').show(menu, ev.clientX, ev.clientY);
	}
}

Blackprint.Node = Node;
})();