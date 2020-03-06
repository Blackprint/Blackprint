Space.model('cables', function(self){
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

	self.recalculatePath = function(item){
		var x1 = item.head1[0], y1 = item.head1[1];
		var x2 = item.head2[0], y2 = item.head2[1];

		if(item.pos !== 'property'){
			var cx = (x2-x1)/2;
			if(cx > -50 && cx < 0)
				cx = -50;
			else if(cx < 50 && cx >= 0)
				cx = 50;

			if(item.pos === 'input'){
				if(x2 < x1)
				  item.linePath = `${x1 + cx} ${y1} ${x2 - cx} ${y2}`;
				else
				  item.linePath = `${x1 - cx} ${y1} ${x2 + cx} ${y2}`;
			}
			else if(item.pos === 'output'){
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

	// Determine which cable head is clicked
	self.currentCable = void 0;
	self.cableHeadClicked = function(item, event){
		var whichHead = event;
		if(event.constructor !== Number)
			whichHead = event.target.previousElementSibling.tagName === 'circle' ? 2 : 1;

		function moveCableHead(event){
			var xy;

			// Let's make a magnet sensation (fixed position when hovering node port)
			if(self.hoverPort !== false){
				var center = self.hoverPort.rect.width/2;
				xy = [self.hoverPort.rect.x+center, self.hoverPort.rect.y+center];
			}

			// Follow pointer
			else xy = [event.clientX, event.clientY];

			if(whichHead === 1)
				item.head1 = xy;
			else
				item.head2 = xy;
		}

		var elem = self.list.getElement(item);

		// Let the pointer pass thru the current svg group
		if(elem !== void 0){
			elem = $(elem);
			elem.css('pointer-events', 'none');
		}

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

	self.createCable = function(obj, owner){
		return self.list[self.list.push({
			head1:[obj.x, obj.y],
			head2:[obj.x, obj.y],
			type:obj.type,
			pos:obj.position,
			valid:true,
			linePath:'0 0 0 0',
			connection:[],
			owner:owner
		}) - 1];
	}
});