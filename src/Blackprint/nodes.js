Space.model('nodes', function(self){
	self.list = [];
});

Space.component('a-node', function(self, root, item){
	// For setting position
	self.x = 50;
	self.y = 50;

	// Assign item value to the component
	// Including `inputs, outputs, properties`
	Object.assign(self, item);

	// DragMove event handler
	self.moveNode = function(e){
		self.x += e.movementX;
		self.y += e.movementY;

		moveCables(e, self.inputs);
		moveCables(e, self.outputs);
		moveCables(e, self.properties);
	}

	function moveCables(e, which){
		// Move the connected cables
		for (var i = 0; i < which.length; i++) {
			var cables = which[i].cables;
			if(cables.length === 0)
				continue;

			for (var a = 0; a < cables.length; a++) {
				var cable;
				if(cables[a].owner[0] === self)
					cable = cables[a].head1;
				else
					cable = cables[a].head2;

				cable[0] += e.movementX;
				cable[1] += e.movementY;
			}
		}
	}

	// Determine port source
	function getPortSource(item){
		if(self.outputs.indexOf(item) !== -1)
			return 'outputs';
		else if(self.properties.indexOf(item) !== -1)
			return 'properties';
		return 'inputs';
	}

	// PointerDown event handler
	self.createCable = function(e, item){
		var source = getPortSource(item);

		// Get size and position of the port
		var rect = event.target.getBoundingClientRect();
		var center = rect.width/2;

		// Create cable and save the reference
		var cable = root('cables').createCable({
			x:rect.x + center,
			y:rect.y + center,
			type:item.type.name,
			source:source
		});

		// Connect this cable into port's cable list
		item.cables.push(cable);

		// Put port reference to the cable
		cable.owner = [self, item];

		// Default head index is "2" when creating new cable 
		root('cables').cableHeadClicked(cable, 2);
	}

	function removeCable(cable){
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
	self.cableConnect = function(port){
		// Get currect cable and the port source name
		var cable = root('cables').currentCable;
		var source = getPortSource(port);

		// Remove cable if ...
		if(cable.owner[0] === self // It's referencing to same node
			|| cable.source === 'outputs' && source !== 'inputs' // Output source not connected to input
			|| cable.source === 'inputs' && source !== 'outputs'  // Input source not connected to output
			|| cable.source === 'properties' && source !== 'properties'  // Property source not connected to property
		){
			removeCable(cable);
			return;
		}

		// Connect this cable into port's cable list
		port.cables.push(cable);

		// Put port reference to the cable
		cable.target = [self, port];
		console.log('A cable was connected', port);
	}

	// PointerOver event handler
	self.portHovered = function(event, item){
		// For magnet sensation when the cable reach the port
		root('cables').hoverPort = {
			elem:event.target,
			rect:event.target.getBoundingClientRect(),
			item:item
		};
	}

	// PointerOut event handler
	self.portUnhovered = function(){
		root('cables').hoverPort = false;
	}
});