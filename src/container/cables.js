Space.model('cables', function(self, root){
	// any item will be: ../constructor/Cable.js
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

	// Move clicked cable
	self.currentCable = void 0;

	// This will run everytime the cable was moving
	// used on: ../page.sf
	var pendingCable = new Set();
	var recalculatePending = false;
	self.recalculatePath = function(item){
		// Reduce multiple redraw when x and y are changed in separated time
		if(pendingCable.has(item)) return;
		pendingCable.add(item);

		if(recalculatePending) return;
		requestAnimationFrame(recalculatePath_);
		recalculatePending = true;
	}

	function recalculatePath_(){
		recalculatePending = false;
		pendingCable.forEach(recalculatePath);
		pendingCable.clear();
	}

	function recalculatePath(item){
		const [x1, y1] = item.head1;
		const [x2, y2] = item.head2;

		// If you use this code as reference please support this project
		// by put link on your code to this repository :3
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
});