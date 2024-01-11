Space.model('cables', function(My, include){
	My.container = include('container');

	// Check if the container was a minimap
	// If yes, then copy the Array reference from the original Space
	// If not, then create new array list
	if(My.container.isMinimap)
		My.list = My.container.minimapSource.cableScope.list;
	// any item will be: ../constructor/Cable.js
	else My.list = [];

	// Fixing viewport position
	My.space = [0,0];
	My.init = function(){
		setTimeout(function(){
			// Get sf-space element
			var rect = My.$el[0].parentNode?.getBoundingClientRect();
			if(rect == null) return;
			My.space = [rect.x, rect.y];
		}, 500);
	}

	// Flag if cursor was hovering a node port
	My.hoverPort = false; // {elem:, item:}

	// Move clicked cable
	My.currentCable = void 0;

	My.selected = [];
	My.deselectAll = function(){
		let list = My.selected;
		for (let i = 0; i < list.length; i++)
			list[i].selected = false;

		list.splice(0);
	}

	My.isSelected = function(iface){ return iface.selected }
	My.select = function(items){
		if(items.constructor !== Array) items = [items];

		let list = My.selected;
		for (let i=0; i < items.length; i++) {
			let temp = items[i];
			if(temp.selected) continue;
			if(!list.includes(temp)){
				temp.selected = true;
				list.push(temp);
			}
		}
	}

	My.deselect = function(items){
		if(items.constructor !== Array) items = [items];
		items = new Set(items);

		let list = My.selected;
		for (let i=list.length-1; i >= 0; i--) {
			let temp = items[i];
			if(!temp.selected) continue;
			if(items.has(temp)){
				temp.selected = false;
				list.splice(i, 1);
			}
		}
	}

	// This will run everytime the cable was moving
	// used on: ../page.sf
	var pendingCable = new Set();
	var recalculatePending = false;
	My.recalculatePath = function(item){
		// Reduce multiple redraw when x and y are changed in separated time
		if(pendingCable.has(item)) return;
		pendingCable.add(item);

		if(recalculatePending) return;
		recalculatePending = true;
		requestAnimationFrame(recalculatePath_);
	}

	function recalculatePath_(){
		for(let item of pendingCable){
			const [x1, y1] = item.head1;
			const [x2, y2] = item.head2;

			// If you use this code as reference please support this project
			// by put link on your code to this repository :3
			if(item.source !== 'property'){
				var cx = (x2-x1)/2;
				if(cx > -50 && cx < 0)
					cx = -50;
				else if(cx < 50 && cx >= 0)
					cx = 50;

				let temp = item.overrideRot ?? (item.source === 'input' ? 'in-out' : 'out-in');
				if(temp === 'out-in'){
					if(x2 < x1)
						item.linePath = `${x1 - cx} ${y1} ${x2 + cx} ${y2}`;
					else
						item.linePath = `${x1 + cx} ${y1} ${x2 - cx} ${y2}`;
				}
				else if(temp === 'in-out'){
					if(x2 < x1)
						item.linePath = `${x1 + cx} ${y1} ${x2 - cx} ${y2}`;
					else
						item.linePath = `${x1 - cx} ${y1} ${x2 + cx} ${y2}`;
				}
				else if(temp === 'out-out'){
					if(x2 < x1)
						item.linePath = `${x1 - cx} ${y1} ${x2 - cx} ${y2}`;
					else
						item.linePath = `${x1 + cx} ${y1} ${x2 + cx} ${y2}`;
				}
				else if(temp === 'in-in'){
					if(x2 < x1)
						item.linePath = `${x1 + cx} ${y1} ${x2 + cx} ${y2}`;
					else
						item.linePath = `${x1 - cx} ${y1} ${x2 - cx} ${y2}`;
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

		recalculatePending = false;
		pendingCable.clear();
	}
});