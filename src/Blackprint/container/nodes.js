Space.model('nodes', function(self, root){
	self.list = [];

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