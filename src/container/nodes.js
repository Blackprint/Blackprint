Space.model('nodes', function(My, include){
	var sizeObserve = new ResizeObserver(function(items){
		for (var i = 0; i < items.length; i++)
			resetCablePosition(items[i]);
	});

	function resetCablePosition(resized){
		var iface = resized.target.model;
		iface.h = resized.contentRect.height;
		iface.w = resized.contentRect.width;

		var container = include('container');
		var Ofst = container.offset;

		var ports = Blackprint.Node._ports;
		for(var i=0; i < ports.length; i++){
			var which = iface[ports[i]];
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

	// Check if this categorized as minimap from the sf.Space id
	// If yes, then copy the Array reference from the original Space
	// If not, then create new array list
	let isMinimap = My.$space.id.includes('+mini');
	if(isMinimap === true){
		let mainSpace = Blackprint.space.list[My.$space.id.replace('+mini', '')];
		My.list = mainSpace('nodes').list;
	}
	else My.list = [];

	My.on$list = {
		create(el){
			var node = el.querySelector('.node');
			if(!node){
				console.error("It seems '"+el.firstChild.tagName.toLowerCase()+"' HTML was unable to load", el);
				return;
			}

			sizeObserve.observe(node);
		},
		remove(el){
			sizeObserve.unobserve(el.querySelector('.node'));
		},
	};

	function createNode(namespace){
		var container = include('container');
		My.$space.sketch.createNode(namespace, {
			x:menuEv.offsetX-container.offset.x,
			y:menuEv.offsetY-container.offset.y
		});
	}

	My.checkNodeClick = function(ev){
		if(ev.target.closest('.ports'))
			return;

		var node = ev.target.closest('.node');
		if(node === null)
			return;

		var container = include('container');

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
				if(obj[name].constructor === Function){
					target.push({
						title:name,
						args:[strArr.length !== 0 ? strArr.join('/')+'/'+name : name],
						callback:createNode
					});
					continue;
				}

				var newMenu = [];
				target.push({title:name, deep:newMenu});

				strArr.push(name);
				deep(obj[name], newMenu);
				strArr.pop();
			}
		}

		menu.event = ev;

		deep(Blackprint.availableNode, menu);
		include('dropdown').show(menu, ev.clientX, ev.clientY);
	}
});