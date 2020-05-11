Space.model('cables', function(self, root){
	/*{
		head1:[x,y], -- Number
		head2:[x,y], -- Number
		type:'String',
		curve:self.curve[..],
		valid:true,

		nodeA:Object,
		nodeB:Object,
	}*/
	self.list = [];
	self.container = root('container');

	// Fixing viewport position
	self.space = [0,0];
	self.init = function(){
		setTimeout(function(){
			// Get sf-space element
			var rect = self.$el[0].parentNode.getBoundingClientRect();
			self.space = [rect.x, rect.y];
		}, 500);
	}

	// Flag if cursor was hovering a node port
	self.hoverPort = false; // {elem:, item:}

	// This will run everytime the cable was moving
	self.recalculatePath = function(item){
		var x1 = item.head1[0], y1 = item.head1[1];
		var x2 = item.head2[0], y2 = item.head2[1];

		// Written without formula, just logic...
		if(item.source !== 'properties'){
			var cx = (x2-x1)/2;
			if(cx > -50 && cx < 0)
				cx = -50;
			else if(cx < 50 && cx >= 0)
				cx = 50;

			if(item.source === 'inputs'){
				if(x2 < x1)
				  item.linePath = `${x1 + cx} ${y1} ${x2 - cx} ${y2}`;
				else
				  item.linePath = `${x1 - cx} ${y1} ${x2 + cx} ${y2}`;
			}
			else if(item.source === 'outputs'){
				if(x2 < x1)
				  item.linePath = `${x1 - cx} ${y1} ${x2 + cx} ${y2}`;
				else
				  item.linePath = `${x1 + cx} ${y1} ${x2 - cx} ${y2}`;
			}
		}
		else{
			var cy = (y2-y1)/2;
			if(cy > -50 && cy < 0)
				cy = -50;
			else if(cy < 50 && cy >= 0)
				cy = 50;

			if(y2 < y1)
			  item.linePath = `${x1} ${y1 - cy} ${x2} ${y2 - cy}`;
			else
			  item.linePath = `${x1} ${y1 + cy} ${x2} ${y2 + cy}`;
		}
	}

	// Move clicked cable
	self.currentCable = void 0;
	self.cableHeadClicked = function(item){
		function moveCableHead(event){
			var xy;

			// Let's make a magnet sensation (fixed position when hovering node port)
			if(self.hoverPort !== false){
				var center = self.hoverPort.rect.width/2;
				xy = [self.hoverPort.rect.x+center - self.container.pos.x, self.hoverPort.rect.y+center - self.container.pos.y];
			}

			// Follow pointer
			else xy = [event.clientX - self.container.pos.x, event.clientY - self.container.pos.y];

			item.head2 = xy;
		}

		var elem = self.list.getElement(item);

		// Let the pointer pass thru the current svg group
		if(elem !== void 0){
			elem = $(elem);
			elem.css('pointer-events', 'none');
		}

		// Save current cable for referencing when cable connected into node's port
		self.currentCable = item;
		$('vw-sketch').on('pointermove', moveCableHead).once('pointerup', function(event){
			$('vw-sketch').off('pointermove', moveCableHead);

			// Add delay because it may be used for connecting port
			setTimeout(function(){
				self.currentCable = void 0;
			}, 100);

			if(elem !== void 0)
				elem.css('pointer-events', '');
		});
	}

	self.disconnectCable = function(cable){
		cable.owner[0].removeCable(cable);

		cable.owner[0]._trigger('cableDisconnected', cable);
		cable.target[0]._trigger('cableDisconnected', cable);
	}

	self.cableMenu = function(item, ev){
		ev.stopPropagation();

		root('dropdown').show([{
			title:"Disconnect",
			args:[item],
			callback:self.disconnectCable
		}], ev.clientX, ev.clientY);
	}

	self.createCable = function(obj){
		return self.list[self.list.push({
			head1:[obj.x - self.container.pos.x, obj.y - self.container.pos.y],
			head2:[obj.x - self.container.pos.x, obj.y - self.container.pos.y],
			type:obj.type,
			source:obj.source,
			valid:true,
			linePath:'0 0 0 0',

			// Cable connection
			owner:void 0, // head1
			target:void 0 // head2
		}) - 1];
	}
});