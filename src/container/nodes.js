Space.model('nodes', function(My, include){
	let container = My.container = include('container');

	var sizeObserve = new ResizeObserver(My._recalculate = function(items, noEvent){
		if(My.$space.sketch == null) return;

		// Use the main container's offset when having multiple container
		if(container.$el.length > 1)
			container.resetOffset(container.nodeScope.$el[0].getBoundingClientRect());

		let {offset: Ofst, pos} = container;
		let oX = pos.x + Ofst.x;
		let oY = pos.y + Ofst.y;

		for (var i = 0; i < items.length; i++){
			var resized = items[i];
			var iface = resized.target.model;
			if(iface === void 0) continue;

			let {height, width} = resized.contentRect;
			if(height > 0)
				iface.h = height;

			if(width > 0)
				iface.w = width;

			let routeCable = iface.node.routes.out;
			if(routeCable != null){
				if(routeCable.input != null){
					let inp = routeCable.input.iface.$el('.routes .in')[0].getBoundingClientRect();
					let inPortX = (inp.x+(inp.width/2) - oX) / container.scale;
					let inPortY = (inp.y+(inp.height/2) - oY) / container.scale;
					routeCable.head2 = [inPortX, inPortY];
				}

				if(routeCable.output != null){
					let out = routeCable.output.iface.$el('.routes .out')[0].getBoundingClientRect();
					let outPortX = (out.x+(out.width/2) - oX) / container.scale;
					let outPortY = (out.y+(out.height/2) - oY) / container.scale;
					routeCable.head1 = [outPortX, outPortY];
				}
			}

			var ports = Blackprint.Interface._ports;
			for(var a = 0; a < ports.length; a++){
				let which = ports[a];
				var _list = iface[which]?._portList;

				if(_list === void 0)
					continue;

				for (var z = 0; z < _list.length; z++) {
					let port = _list[z];
					var cables = port.cables;
					if(cables.length === 0)
						continue;

					var rect = _list.getElement(port).querySelector('.port').getBoundingClientRect();

					// ToDo: simplify this math
					let portX = (rect.x+(rect.width/2) - oX) / container.scale;
					let portY = (rect.y+(rect.height/2) - oY) / container.scale;

					var cable, isRouteOutput = which === 'output' && port.type === Blackprint.Port.Route;
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

						if(isRouteOutput){
							let rect = cable.input._inElement[0].getBoundingClientRect();
							let head2 = cable.head2;

							// ToDo: simplify this math
							head2[0] = (rect.x+(rect.width/2) - oX) / container.scale;
							head2[1] = (rect.y+(rect.height/2) - oY) / container.scale;
						}

						if(cable.owner.iface === iface && which === 'output')
							cable = cable.head1;
						else{
							if(!cable.connected && which === 'input') continue;
							cable = cable.head2;
						}

						cable[0] = portX;
						cable[1] = portY;
					}
				}
			}
		}

		if(noEvent !== true) My.$space.sketch.emit('node.resize', { items });
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

	My.destroy = function(){
		sizeObserve.disconnect();
	}

	$(window).once('beforeunload', My.destroy);

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

	My.menu = function(ev, availableNode, options){
		ev.preventDefault();
		options ??= {};

		let menu = createNodesMenu(availableNode ?? Blackprint.availableNode, My.$space.sketch, ev, null, options);
		if(menu === false) return;

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