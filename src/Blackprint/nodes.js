Space.model('nodes', function(self){
	self.dataColor = {
		Boolean:'#ff3636',
		String:'white',
		Number:'deepskyblue',
		Object:'mediumpurple'
	};

	self.list = [];
});

Space.component('a-node', function(self, root, item){
	// For setting position
	self.x = 50;
	self.y = 50;

	// Assign item value to the component
	Object.assign(self, item);

	// DragMove event handler
	self.moveNode = function(e){
		self.x += e.movementX;
		self.y += e.movementY;
	}

	// PointerDown event handler
	self.createCable = function(e, item){
		// Determine port position
		var pos = 'left';
		if(self.outputs.indexOf(item) !== -1)
			pos = 'right';
		else if(self.properties.indexOf(item) !== -1)
			pos = 'bottom';

		// Create cable and save the reference
		var cable = root('cables').createCable({
			x:e.clientX,
			y:e.clientY,
			color:root('nodes').dataColor[item.type] || root('nodes').dataColor.Object,
			position:pos
		});

		// Default head index is "2" when creating new cable 
		root('cables').cableHeadClicked(cable, 2);
	}

	// PointerUp event handler
	self.cableConnect = function(item){
		console.log('A cable was connected', item);
	}

	// PointerOver event handler
	self.portHovered = function(event, item){
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