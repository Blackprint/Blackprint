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
					var cables = which[key].cables;
					if(cables.length === 0)
						continue;

					var rect = which.getElement(key).querySelector('.port');
					rect = rect.getBoundingClientRect();

					var cable;
					for (var a = 0; a < cables.length; a++) {
						if(cables[a].owner.iface === iface)
							cable = cables[a].head1;
						else
							cable = cables[a].head2;

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

	function createNode(namespace){
		My.$space.sketch.createNode(namespace, {
			x: menuEv.offsetX - container.offset.x,
			y: menuEv.offsetY - container.offset.y
		});
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
			var rect = node.getBoundingClientRect();
			cable.head2[1] = -container.pos.y + rect.bottom + 15; // Put it on bottom of node
		}
	}

	var menuEv;
	My.menu = function(ev){
		ev.preventDefault();
		menuEv = ev;

		var menu = [];
		var strArr = [];
		function deep(obj, target){
			for(var name in obj){
				let that = obj[name];
				if(that == null || that.hidden || that.disabled)
					continue;

				if(that.constructor === Function){
					target.push({
						title: name,
						args: [strArr.length !== 0 ? strArr.join('/')+'/'+name : name],
						callback: createNode
					});
					continue;
				}

				var newMenu = [];

				strArr.push(name);
				deep(that, newMenu);
				strArr.pop();

				newMenu = newMenu.sort((a, b) => a.title < b.title ? -1 : 1);
				target.push({title: name, deep: newMenu});
			}
		}

		menu.event = ev;
		deep(Blackprint.availableNode, menu);

		menu = menu.sort((a, b) => a.title < b.title ? -1 : 1);
		include('dropdown').show(menu, {x: ev.clientX, y: ev.clientY, event: ev});
	}
});