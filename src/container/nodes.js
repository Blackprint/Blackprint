Space.model('nodes', function(My, include){
	let container = My.container = include('container');

	var sizeObserve = new ResizeObserver(function(items){
		if(My.$space.sketch == null) return;

		for (var i = 0; i < items.length; i++){
			var resized = items[i];
			var iface = resized.target.model;
			if(iface === void 0) continue;

			let {height, width} = resized.contentRect;
			if(height > 0)
				iface.h = height;

			if(width > 0)
				iface.w = width;

			var Ofst = container.offset;

			var ports = Blackprint.Interface._ports;
			for(var a = 0; a < ports.length; a++){
				let which = ports[a];
				var _list = iface[which]?._list;

				if(_list === void 0)
					continue;

				for (var z = 0; z < _list.length; z++) {
					let port = _list[z];

					var cables = port.cables;
					if(cables.length === 0)
						continue;

					var rect = _list.getElement(z).querySelector('.port');
					rect = rect.getBoundingClientRect();

					let portX = (rect.x+(rect.width/2) - container.pos.x - Ofst.x) / container.scale;
					let portY = (rect.y+(rect.height/2) - container.pos.y - Ofst.y) / container.scale;

					var cable;
					for (var h = 0; h < cables.length; h++) {
						cable = cables[h];

						// Avoid moving ghost cable
						if(cable._ghost) continue;

						// Avoid moving branch cable
						if(cable._allBranch !== void 0
						   && which === 'output'
						   && cable.cableTrunk !== cable){
							continue;
						}

						if(cable.owner.iface === iface && which === 'output')
							cable = cable.head1;
						else
							cable = cable.head2;

						cable[0] = portX;
						cable[1] = portY;
					}
				}
			}
		}

		My.$space.sketch.emit('node.resize', { items });
	});

	// Check if the container was a minimap
	// If yes, then copy the Array reference from the original Space
	// If not, then create new array list
	if(My.container.isMinimap)
		My.list = My.container.minimapSource.nodeScope.list;
	else My.list = [];

	My.on$list = {
		create(el){
			var node = el.querySelector('.node');
			if(!node){
				include.sketch.emit('error', {
					type: 'node_template_not_found',
					tagName: el.firstChild.tagName.toLowerCase(),
					element: el
				});
				return;
			}

			sizeObserve.observe(node);
		},
		remove(el){
			sizeObserve.unobserve(el.querySelector('.node'));
		},
	};

	My.selected = [];
	My.unselectAll = function(){
		let list = My.selected;
		for (let i = 0; i < list.length; i++)
			list[i]._nodeSelected = false;

		list.splice(0);
	}

	My.checkNodeClick = function(ev){
		if(ev.target.closest('.ports'))
			return;

		var node = ev.target.closest('.node');
		if(node === null)
			return;

		// Check if he dropped the cable behind current node
		var cable = include('cables').currentCable;
		if(cable){
			setTimeout(()=> {
				if(cable.connected || cable._destroyed) return;
				if(cable.branch != null && cable.branch.length !== 0)
					return;

				var rect = node.getBoundingClientRect();
				cable.head2[1] = -container.pos.y + rect.bottom + 15; // Put it on bottom of node
			}, 300);
		}
	}

	var menuEv;
	My.menu = function(ev, availableNode){
		ev.preventDefault();
		menuEv = ev;

		let menu = createNodesMenu(availableNode ?? Blackprint.availableNode, My.$space.sketch, ev);
		include('dropdown').show(menu, {x: ev.clientX, y: ev.clientY, event: ev});
	}

	let lastHoverItem;
	My.pointerOver = function(ev, item){
		if(lastHoverItem === item) return;
		lastHoverItem = item;

		item.hideUnusedPort = false;
	}

	My.pointerOut = function(ev){
		if(lastHoverItem == null) return;

		lastHoverItem.hideUnusedPort = container.hideUnusedPort;
		lastHoverItem = null;
	}
});