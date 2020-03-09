;(function(){
var root = Blackprint.space.scope;

class Node{
	// DragMove event handler
	moveNode(e){
		this.x += e.movementX;
		this.y += e.movementY;

		this.moveCables(e, this.inputs);
		this.moveCables(e, this.outputs);
		this.moveCables(e, this.properties);
	}

	moveCables(e, which){
		// Move the connected cables
		for (var i = 0; i < which.length; i++) {
			var cables = which[i].cables;
			if(cables.length === 0)
				continue;

			for (var a = 0; a < cables.length; a++) {
				var cable;
				if(cables[a].owner[0] === this)
					cable = cables[a].head1;
				else
					cable = cables[a].head2;

				cable[0] += e.movementX;
				cable[1] += e.movementY;
			}
		}
	}

	// Determine port source
	getPortSource(item){
		if(this.outputs.indexOf(item) !== -1)
			return 'outputs';
		else if(this.properties.indexOf(item) !== -1)
			return 'properties';
		return 'inputs';
	}

	// PointerDown event handler
	createCable(e, item){
		var source = this.getPortSource(item);
		var isAuto = e.constructor === DOMRect;

		// Get size and position of the port
		var rect = isAuto ? e : e.target.getBoundingClientRect();
		var center = rect.width/2;

		// Create cable and save the reference
		var cable = root('cables').createCable({
			x:rect.x + center,
			y:rect.y + center,
			type:item.type === null ? 'Any' : item.type.name,
			source:source
		});

		// Connect this cable into port's cable list
		item.cables.push(cable);

		// Put port reference to the cable
		cable.owner = [this, item];

		// Stop here if this function wasn't triggered by user
		if(isAuto)
			return cable;

		// Default head index is "2" when creating new cable 
		root('cables').cableHeadClicked(cable, 2);
	}

	removeCable(cable){
		var list = root('cables').list;

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

		// Remove from cable list
		list.splice(list.indexOf(cable), 1);
		console.log('A cable was removed', cable);
	}

	// PointerUp event handler
	cableConnect(port){
		// Get currect cable and the port source name
		var cable = root('cables').currentCable;
		var source = this.getPortSource(port);

		// Remove cable if ...
		if(cable.owner[0] === this // It's referencing to same node
			|| cable.source === 'outputs' && source !== 'inputs' // Output source not connected to input
			|| cable.source === 'inputs' && source !== 'outputs'  // Input source not connected to output
			|| cable.source === 'properties' && source !== 'properties'  // Property source not connected to property
		){
			console.log(cable.owner[0], this);
			this.removeCable(cable);
			return;
		}

		// Connect this cable into port's cable list
		port.cables.push(cable);

		// Put port reference to the cable
		cable.target = [this, port];
		console.log('A cable was connected', port);
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
}

Blackprint.Node = Node;
})();