Space.model('nodes', function(My, include){
	let container = My.container = include('container');

	var sizeObserve = new ResizeObserver(function(items){
		for (var i = 0; i < items.length; i++){
			var resized = items[i];
			var iface = resized.target.model;
			if(iface === void 0) continue;

			iface.h = resized.contentRect.height;
			iface.w = resized.contentRect.width;

			var Ofst = container.offset;

			var ports = Blackprint.Interface._ports;
			for(var a = 0; a < ports.length; a++){
				var which = iface[ports[a]];
				if(which === void 0)
					continue;

				for(var key in which){
					let port = which[key];
					var cables = port.cables;
					if(cables.length === 0)
						continue;

					var rect = which.getElement(key).querySelector('.port');
					rect = rect.getBoundingClientRect();

					var cable;
					for (var a = 0; a < cables.length; a++) {
						let cable = cables[a];

						// Avoid moving branch cable
						if(cable._allBranch !== void 0
						   && port.source === 'output'
						   && cable.cableTrunk !== cable){
							continue;
						}

						if(cable.owner.iface === iface)
							cable = cable.head1;
						else
							cable = cable.head2;

						var center = rect.width/2;
						cable[0] = (rect.x+center - container.pos.x - Ofst.x) / container.scale;
						cable[1] = (rect.y+center - container.pos.y - Ofst.y) / container.scale;
					}
				}
			}
		}
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

	My.checkNodeClick = function(ev){
		if(ev.target.closest('.ports'))
			return;

		var node = ev.target.closest('.node');
		if(node === null)
			return;

		// Check if he dropped the cable behind current node
		var cable = include('cables').currentCable;
		if(cable){
			if(cable.branch == null || cable.branch.length === 0)
				return;

			var rect = node.getBoundingClientRect();
			cable.head2[1] = -container.pos.y + rect.bottom + 15; // Put it on bottom of node
		}
	}

	var menuEv;
	My.menu = function(ev){
		ev.preventDefault();
		menuEv = ev;

		let menu = createNodesMenu(Blackprint.availableNode, My.$space.sketch, ev);
		include('dropdown').show(menu, {x: ev.clientX, y: ev.clientY, event: ev});
	}
});