;(function(){

// Private variable
var container;

// Run when all ready
$(function(){
	container = Blackprint.space.scope('container');
});

// Private function
function moveCables(node, e, which){
	// Move the connected cables
	for(var key in which){
		var cables = which[key].cables;
		if(cables.length === 0)
			continue;

		var cable;
		for (var a = 0; a < cables.length; a++) {
			if(cables[a].owner.node === node)
				cable = cables[a].head1;
			else
				cable = cables[a].head2;

			cable[0] += e.movementX / container.scale;
			cable[1] += e.movementY / container.scale;
		}
	}
}

Blackprint.Node = class Node extends Blackprint.Interpreter.CustomEvent{
	/*
	x = 0;
	y = 0;

	inputs = {};
	outputs = {};
	properties = {};
	*/

	static prepare(handle, node){
		// Default Node properties
		node.x = 0;
		node.y = 0;
	}

	newPort(portName, type, def, which, node){
		var temp = new Blackprint.Interpreter.Port(portName, type, def, which, node);
		Object.setPrototypeOf(temp, Port.prototype);
		return temp;
	}

	// DragMove event handler
	moveNode(e){
		this.x += e.movementX / container.scale;
		this.y += e.movementY / container.scale;

		// Also move all cable connected to current node
		moveCables(this, e, this.inputs);
		moveCables(this, e, this.outputs);
		moveCables(this, e, this.properties);
	}

	nodeMenu(ev){
		var menu = [{
			title:'Delete',
			args:[this],
			callback:function(node){
				var list = Blackprint.space.scope('nodes').list;
				var i = list.indexOf(node);

				if(i === -1)
					return console.error("Node was not found on the list", node);

				list.splice(i, 1);

				var check = ['outputs', 'inputs', 'properties'];
				for (var i = 0; i < check.length; i++) {
					var portList = node[check[i]];
					for(var port in portList){
						var cables = portList[port].cables;
						for (var a = cables.length - 1; a >= 0; a--)
							cables[a].destroy();
					}
				}
			}
		}];

		this._trigger('node.menu', menu);
		Blackprint.space.scope('dropdown').show(menu, ev.clientX, ev.clientY);
	}
}

})();