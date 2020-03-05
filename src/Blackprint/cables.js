Space.model('cables', function(self){
	/*{
		head1:[x,y], -- Number
		head2:[x,y], -- Number
		color:'black',
		curve:self.curve[..],
		valid:true,

		nodeA:Object,
		nodeB:Object,
	}*/
	self.list = [];

	// Flag if cursor was hit a node port
	self.hitNode = false;

	self.recalculatePath = function(item){
		var x1 = item.head1[0], y1 = item.head1[1];
		var x2 = item.head2[0], y2 = item.head2[1];

		if(item.pos !== 'bottom'){
			var cx = (x2-x1)/2;
			if(cx > -50 && cx < 0)
				cx = -50;
			else if(cx < 50 && cx >= 0)
				cx = 50;

			if(item.pos === 'left'){
				if(x2 < x1)
				  item.linePath = `${x1 + cx} ${y1} ${x2 - cx} ${y2}`;
				else
				  item.linePath = `${x1 - cx} ${y1} ${x2 + cx} ${y2}`;
			}
			else if(item.pos === 'right'){
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

	// Some effect when mouse hovering / the cable was focused
	self.cableFocused = function(item){
		if(item.default === void 0)
			item.default = item.color;

		item.color = 'white';
	}

	self.cableUnfocused = function(item){
		item.color = item.default;
	}

	// Determine which cable head is clicked
	self.cableHeadClicked = function(item, event){
		var whichHead = event;
		if(event.constructor !== Number)
			whichHead = event.target.previousElementSibling.tagName === 'circle' ? 2 : 1;

		function moveCableHead(event){
			if(whichHead === 1)
				item.head1 = [event.layerX, event.layerY];
			else
				item.head2 = [event.layerX, event.layerY];
		}

		$('vw-sketch').on('pointermove', moveCableHead).once('pointerup', function(event){
			$('vw-sketch').off('pointermove', moveCableHead);
		});
	}

	self.createCable = function(obj){
		return self.list[self.list.push({
			head1:[obj.x, obj.y],
			head2:[obj.x, obj.y],
			color:obj.color,
			pos:obj.position,
			valid:true,
			linePath:'0 0 0 0'
		}) - 1];
	}
});