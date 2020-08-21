class Port extends Blackprint.Interpreter.Port{
	_scope = null;

	findPortElement(el){
		if(!el.classList.contains('ports'))
			el = el.closest('.ports');

		return el.querySelector('.port');
	}

	createCable(e){
		var isAuto = e.constructor === DOMRect;

		// Get size and position of the port
		var rect = isAuto ? e : this.findPortElement(e.target).getBoundingClientRect();

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
		this.iface._trigger('cable.created', this, cable);
	}

	connectCable(cable){
		if(cable === void 0)
			cable = this._scope('cables').currentCable;

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

		if(cable.owner.source === 'outputs')
			if(this.feature === Blackprint.PortArrayOf && !Blackprint.PortArrayOf.validate(this.type, cable.owner.type)){
				console.log(this.iface.title+"> Port from '"+cable.owner.iface.title + " - " + cable.owner.name+"' was not an "+this.type.name);
				return cable.destroy();
			}

		else if(this.source === 'outputs')
			if(cable.owner.feature === Blackprint.PortArrayOf && !Blackprint.PortArrayOf.validate(cable.owner.type, this.type)){
				console.log(this.iface.title+"> Port from '"+this.iface.title + " - " + this.name+"' was not an "+cable.owner.type.name);
				return cable.destroy();
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
				// console.log("Duplicate connection");
				cable.destroy();
				return;
			}
		}

		// Put port reference to the cable
		cable.target = this;

		// Remove old cable if the port not support array
		if(this.feature !== Blackprint.PortArrayOf && this.type !== Function){
			var removal = cable.target.source === 'inputs' ? cable.target : cable.owner;

			if(removal.cables.length !== 0){
				removal.cables.pop().destroy();
				// console.log("Cable was replaced because input doesn't support array");
			}
		}

		// Connect this cable into port's cable list
		this.cables.push(cable);
		cable.triggerConnected();
	}

	// PointerOver event handler
	portHovered(event){
		var portElem = this.findPortElement(event.target);

		// For magnet sensation when the cable reach the port
		this._scope('cables').hoverPort = {
			elem:portElem,
			rect:portElem.getBoundingClientRect(),
			item:this
		};
	}

	// PointerOut event handler
	portUnhovered(){
		this._scope('cables').hoverPort = false;
	}

	portRightClick(ev){
		var scope = this._scope;
		var menu = [];
		this.iface._trigger('port.menu', this, menu);

		// Prepare default menu
		var disconnect = {title:"Disconnect", deep:[]};

		var cables = this.cables;
		for (var i = 0; i < cables.length; i++) {
			let target = cables[i].owner === this ? cables[i].target : cables[i].owner;
			if(target === void 0)
				continue;

			disconnect.deep.push({
				title:target.iface.title+`(${this.name} ~ ${target.name})`,
				context:cables[i],
				callback:Cable.prototype.destroy,
				hover:function(){
					scope('cables').list.getElement(this).classList.add('highlight');

					target.iface.$el.addClass('highlight');
				},
				unhover:function(){
					scope('cables').list.getElement(this).classList.remove('highlight');

					target.iface.$el.removeClass('highlight');
				}
			});
		}

		if(disconnect.deep.length !== 0)
			menu.push(disconnect);

		if(menu.length === 0)
			return;

		var pos = this.findPortElement(ev.target).getClientRects()[0];
		scope('dropdown').show(menu, pos.x, pos.y);
	}

	insertComponent(beforeSelector, compName, item, callback, _repeat){
		var portList = this.iface[this.source];
		if(portList.getElement === void 0){
			var that = this;
			return setTimeout(function(){
				if(_repeat === void 0)
					that.insertComponent(beforeSelector, compName, item, callback, true)
			}, 100);
		}

		compName = compName.split('-');
		for (var i = 0; i < compName.length; i++)
			compName[i] = compName[i][0].toUpperCase() + compName[i].slice(1);

		var el = new window['$'+compName.join('')](item, Blackprint.space, true);

		var beforeEl = portList.getElement(this.name);
		if(beforeSelector !== null)
			beforeEl.insertBefore(item.$el[0], beforeEl.querySelector(beforeSelector));
		else
			beforeEl.appendChild(item.$el[0]);

		callback && callback(item);
	}
}