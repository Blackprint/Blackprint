Space.model('nodes', function(self, root){
	var sizeObserve = new ResizeObserver(function(items){
		for (var i = 0; i < items.length; i++)
			resetCablePosition(items[i].target.model);
	});

	function resetCablePosition(iface){
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

					cable[0] = rect.x + (rect.width/2);
					cable[1] = rect.y + (rect.height/2);
				}
			}
		}
	}

	self.list = [];
	self.on$list = {
		create:function(el){
			sizeObserve.observe(el.querySelector('.node'));
		},
		remove:function(el){
			sizeObserve.unobserve(el.querySelector('.node'));
		},
	};

	function createNode(namespace){
		sketch.createNode(namespace, {x:menuEv.layerX, y:menuEv.layerY});
	}

	var menuEv;
	self.menu = function(ev){
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

		deep(Blackprint.availableNode, menu);
		root('dropdown').show(menu, ev.clientX, ev.clientY);
	}
});