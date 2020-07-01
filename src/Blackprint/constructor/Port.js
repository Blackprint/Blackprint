class Port extends Blackprint.Interpreter.Port{
	createCable(e){
		var isAuto = e.constructor === DOMRect;

		// Get size and position of the port
		var rect = isAuto ? e : e.target.getBoundingClientRect();
		var center = rect.width/2;

		// Create cable and save the reference
		var cable = new Cable({
			x:rect.x + center,
			y:rect.y + center
		}, this);

		// Connect this cable into port's cable list
		this.cables.push(cable);

		// Put port reference to the cable
		cable.owner = this;

		// Stop here if this function wasn't triggered by user
		if(isAuto)
			return cable;

		// Default head index is "2" when creating new cable
		cable.cableHeadClicked(e);
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

		// Remove cable if type restriction
		if(cable.owner.type === Function && this.type !== Function
		   || cable.owner.type !== Function && this.type === Function
		){
			console.log(`The cable type is not suitable (${cable.owner.type.name}, ${this.type.name})`);
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

		cable.connected = true;
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

	portRightClick(ev){
		var menu = [];
		this.node._trigger('port.menu', {port:this, menu:menu});

		// Prepare default menu
		var disconnect = {title:"Disconnect", deep:[]};

		var cables = this.cables;
		for (var i = 0; i < cables.length; i++) {
			let target = cables[i].owner === this ? cables[i].target : cables[i].owner;
			if(target === void 0)
				continue;

			disconnect.deep.push({
				title:target.node.title+`(${this.name} ~ ${target.name})`,
				context:cables[i],
				callback:Cable.prototype.destroy,
				hover:function(){
					Blackprint.space.scope('cables').list.getElement(this).classList.add('highlight');

					target.node.$el.addClass('highlight');
				},
				unhover:function(){
					Blackprint.space.scope('cables').list.getElement(this).classList.remove('highlight');

					target.node.$el.removeClass('highlight');
				}
			});
		}

		if(disconnect.deep.length !== 0)
			menu.push(disconnect);

		if(menu.length === 0)
			return;

		var pos = ev.target.getClientRects()[0];
		Blackprint.space.scope('dropdown').show(menu, pos.x, pos.y);
	}
}