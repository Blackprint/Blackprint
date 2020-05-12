class Port{
	constructor(name, type, def, source, node){
		this.name = name;
		this.type = type;
		this.def = def;
		this.cables = [];
		this.source = source;
		this.node = node;
	}

	// Set for the linked port (Handle for ScarletsFrame)
	// ex: linkedPort = node.outputs.portName
	createLinker(){
		var port = this;
		var prepare = {
			get:function(){
				if(port.value === void 0){
					if(port.root === void 0)
						return port.default;

					// Run from root node and stop when reach this node
					port.root(port);
				}

				return port.value;
			}
		};

		// Can only obtain data when accessing input port
		if(port.source !== 'inputs'){
			prepare.set = function(val){
				port.value = val;

				if(port.source === 'outputs' && port.cables.length !== 0){
					port.cables
				}
				// return port.value || port.default;
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
		this.node._trigger('cableCreated', cable);
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
		console.log('A cable was connected', this);

		// Connect this cable into port's cable list
		this.cables.push(cable);
		this.node._trigger('cableConnected', cable);
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
		this.node._trigger('portMenu', {key:key, port:port, menu:menu});

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

	disconnectCable(){

	}

	disconnectNode(){

	}
}