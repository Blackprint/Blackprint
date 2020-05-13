class Port{
	constructor(name, type, def, source, node){
		this.name = name;
		this.type = type;
		this.cables = [];
		this.source = source;
		this.node = node;

		// this.value;
		this.default = def;

		// this.feature = PortListener | PortValidator
	}

	// Set for the linked port (Handle for ScarletsFrame)
	// ex: linkedPort = node.outputs.portName
	createLinker(){
		var port = this;

		// Only for outputs
		if(this.type === Function)
			return function(){
				var cables = port.cables;
				for (var i = 0; i < cables.length; i++) {
					var target = cables[i].owner === port ? cables[i].target : cables[i].owner;
					target.node.handle.inputs[target.name](port, cables[i]);
				}
			};

		var prepare = {
			enumerable:true,
			get:function(){
				// This port must use values from connected outputs
				if(port.source === 'inputs'){
					if(port.cables.length === 0)
						return port.default;

					// Flag current node is requesting value to other node
					port.node._requsting = true;

					// Return single data
					if(port.cables.length === 1){
						var target = port.cables[0].owner === port ? port.cables[0].target : port.cables[0].owner;

						// Request the data first
						if(target.node.handle.request)
							target.node.handle.request(target, port.node);

						port.node._requsting = false;
						return target.value || target.default;
					}

					// Return multiple data as an array
					var cables = port.cables;
					var data = [];
					for (var i = 0; i < cables.length; i++) {
						var target = cables[i].owner === port ? cables[i].target : cables[i].owner;

						// Request the data first
						if(target.node.handle.request)
							target.node.handle.request(target, port.node);

						data.push(target.value || target.default);
					}

					port.node._requsting = false;
					return data;
				}

				return port.value;
			}
		};

		// Can only obtain data when accessing input port
		if(port.source !== 'inputs'){
			prepare.set = function(val){
				if(val === void 0){
					port.value = port.default;
					return;
				}

				// Data type validation
				if(val.constructor !== port.type){
					if(port.type === String || port.type === Number){
						if(val.constructor === Number)
							val = String(val);
						else if(val.constructor === String){
							if(isNaN(val) === true)
								throw new Error(val + " is not a Number");

							val = Number(val);
						}
						else throw new Error(JSON.stringify(val) + " can't be converted as a " + port.type.name);
					}
				}

				port.value = val;

				// Check all connected cables, if any node need to synchronize
				var cables = port.cables;
				for (var i = 0; i < cables.length; i++) {
					var target = cables[i].owner === port ? cables[i].target : cables[i].owner;

					if(target.feature === Blackprint.PortListener)
						target._call(cables[i].owner === port ? cables[i].owner : cables[i].target, val);

					if(target.node._requsting === false && target.node.handle.update)
						target.node.handle.update(cables[i]);
				}
			}
		}

		return prepare;
	}

	createCable(e){
		var isAuto = e.constructor === DOMRect;

		// Get size and position of the port
		var rect = isAuto ? e : e.target.getBoundingClientRect();
		var center = rect.width/2;

		// Create cable and save the reference
		var cable = new Cable({
			x:rect.x + center,
			y:rect.y + center,
			type:!this.type ? 'Any' : this.type.name,
			source:this.source
		});

		// Connect this cable into port's cable list
		this.cables.push(cable);

		// Put port reference to the cable
		cable.owner = this;

		// Stop here if this function wasn't triggered by user
		if(isAuto)
			return cable;

		// Default head index is "2" when creating new cable
		Blackprint.space.scope('cables').cableHeadClicked(cable, e);
		this.node._trigger('cable.created', cable);
	}

	connectCable(cable){
		if(cable === void 0)
			cable = Blackprint.space.scope('cables').currentCable;

		// It's not a cable might
		if(cable === void 0)
			return;

		// Remove cable if ...
		if(cable.owner === this // It's referencing to same port
			|| (cable.source === 'outputs' && this.source !== 'inputs') // Output source not connected to input
			|| (cable.source === 'inputs' && this.source !== 'outputs')  // Input source not connected to output
			|| (cable.source === 'properties' && this.source !== 'properties')  // Property source not connected to property
		){
			console.log(`The cable is not suitable (${cable.source}, ${this.source})`);
			cable.destroy();
			return;
		}

		var sourceCables = cable.owner.cables;

		// Remove cable if there are similar connection for the ports
		for (var i = 0; i < sourceCables.length; i++) {
			if(this.cables.includes(sourceCables[i])){
				console.log("Duplicate connection");
				cable.destroy();
				return;
			}
		}

		// Put port reference to the cable
		cable.target = this;

		// Connect this cable into port's cable list
		this.cables.push(cable);

		this.node._trigger('cable.connect', cable);
		cable.owner.node._trigger('cable.connect', cable, true);
	}

	// PointerOver event handler
	portHovered(event){
		// For magnet sensation when the cable reach the port
		Blackprint.space.scope('cables').hoverPort = {
			elem:event.target,
			rect:event.target.getBoundingClientRect(),
			item:this
		};
	}

	// PointerOut event handler
	portUnhovered(){
		Blackprint.space.scope('cables').hoverPort = false;
	}

	portRightClick(ev, key, port){
		var menu = [];
		this.node._trigger('port.menu', {port:port, menu:menu});

		var cables = port.cables;
		for (var i = 0; i < cables.length; i++) {
			var target = cables[i].owner === port ? cables[i].target : cables[i].owner;
			if(target === void 0)
				continue;

			menu.push({
				title:"Disconnect "+target.node.title+`(${key} ~ ${target.name})`,
				context:cables[i],
				callback:Cable.prototype.destroy
			});
		}

		if(menu.length === 0)
			return;

		var pos = ev.target.getClientRects()[0];
		Blackprint.space.scope('dropdown').show(menu, pos.x, pos.y);
	}
}

$(function(){
	Port.requestable = [
		Blackprint.Function,
		Blackprint.Node,
	];
});