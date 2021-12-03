let BP_Port = Blackprint.Port;
class Port extends Blackprint.Engine.Port{
	// For Prototype only, the constructor() must not being used here
	// But used on ./Interface.js -> newPort()

	findPortElement(el){
		if(!el.classList.contains('ports'))
			el = el.closest('.ports');

		return el.querySelector('.port');
	}

	createCable(e){
		var isAuto = e.constructor === DOMRect;

		// Get size and position of the port
		var rect = isAuto ? e : this.findPortElement(e.target).getBoundingClientRect();
		var Ofst = {x:0, y:0};

		if(!isAuto){
			var container = this._scope('container');
			if(e.target.closest('sf-space') !== container.$el[0].closest('sf-space'))
				Ofst = container.offset;
		}

		var center = rect.width/2;

		// Create cable and save the reference
		var cable = new Cable({
			x:rect.x + center + Ofst.x,
			y:rect.y + center + Ofst.y
		}, this);

		// Connect this cable into port's cable list
		this.cables.push(cable);

		// Put port reference to the cable
		cable.owner = this;

		// Stop here if this function wasn't triggered by user
		if(isAuto)
			return cable;

		// Default head index is "2" when creating new cable
		cable.cableHeadClicked(e, true);
		this.iface.emit('cable.created', {iface: this, cable});
	}

	connectCable(cable){
		let scope = this._scope;
		if(cable === void 0)
			cable = this._scope('cables').currentCable;

		// It's not a cable might
		if(cable === void 0)
			return;

		if(cable.owner === this) // It's referencing to same port
			return cable.disconnect();

		// Remove cable if ...
		if((cable.source === 'output' && this.source !== 'input') // Output source not connected to input
			|| (cable.source === 'input' && this.source !== 'output')  // Input source not connected to output
			|| (cable.source === 'property' && this.source !== 'property')  // Property source not connected to property
		){
			scope.sketch.emit('cable.wrong_pair', {cable, port: this});
			cable.disconnect();
			return;
		}

		if(cable.owner.source === 'output'){
			if((this.feature === BP_Port.ArrayOf && !BP_Port.ArrayOf.validate(this.type, cable.owner.type))
			   || (this.feature === BP_Port.Union && !BP_Port.Union.validate(this.type, cable.owner.type))){
				scope.sketch.emit('cable.wrong_type', {cable, iface: this.iface, source: cable.owner, target: this});
				return cable.disconnect();
			}
		}

		else if(this.source === 'output'){
			if((cable.owner.feature === BP_Port.ArrayOf && !BP_Port.ArrayOf.validate(cable.owner.type, this.type))
			   || (cable.owner.feature === BP_Port.Union && !BP_Port.Union.validate(cable.owner.type, this.type))){
				scope.sketch.emit('cable.wrong_type', {cable, iface: this.iface, source: this, target: cable.owner});
				return cable.disconnect();
			}
		}

		// ToDo: recheck why we need to check if the constructor is a function
		var isInstance = true;
		if(cable.owner.type !== this.type
		   && cable.owner.type.constructor === Function
		   && this.type.constructor === Function)
			isInstance = cable.owner.type instanceof this.type || this.type instanceof cable.owner.type;

		var valid = false;
		if(cable.owner.type.portFeature === BP_Port.Validator
			|| this.type.portFeature === BP_Port.Validator
		){
			isInstance = valid = true;
		}

		// Remove cable if type restriction
		if(!isInstance || !valid && (
			   cable.owner.type === Function && this.type !== Function
			|| cable.owner.type !== Function && this.type === Function
		)){
			scope.sketch.emit('cable.wrong_type_pair', {cable, target: this});
			cable.disconnect();
			return;
		}

		var sourceCables = cable.owner.cables;

		// Remove cable if there are similar connection for the ports
		for (var i = 0; i < sourceCables.length; i++) {
			if(this.cables.includes(sourceCables[i])){
				scope.sketch.emit('cable.duplicate_removed', {cable, target: this});
				cable.disconnect();
				return;
			}
		}

		// Put port reference to the cable
		cable.target = this;

		// Remove old cable if the port not support array
		if(this.feature !== BP_Port.ArrayOf && this.type !== Function){
			var removal = cable.target.source === 'input' ? cable.target : cable.owner;
			let _cables = removal.cables;

			if(removal === cable.owner){
				if(removal.cables.length !== 1){
					for (var a = 0; a < _cables.length; a++) {
						if(_cables[a].connected){
							_cables[a].disconnect();
							break;
						}
					}

					removal = true;
				}
			}
			else if(removal.cables.length !== 0){ // when cable not owned
				for (var a = _cables.length-1; a >= 0; a--) {
					if(_cables[a].connected){
						_cables[a].disconnect();
						break;
					}
				}

				removal = true;
			}

			if(removal === true)
				scope.sketch.emit('cable.replaced', {cable, target: this});
		}

		// Connect this cable into port's cable list
		this.cables.push(cable);
		cable.connecting();
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

		let event = {iface: this, instance: scope.sketch, menu};
		this.iface.emit('port.menu', event);
		scope.sketch.emit('port.menu', event);

		// Prepare default menu
		var disconnect = {title:"Disconnect", deep:[]};

		var cables = this.cables;
		for (var i = 0; i < cables.length; i++) {
			let cable = cables[i];
			let target = cable.owner === this ? cable.target : cable.owner;
			if(target === void 0)
				continue;

			disconnect.deep.push({
				title:target.iface.title+`(${this.name} ~ ${target.name})`,
				callback(){cable.disconnect()},
				hover(){
					scope('cables').list.getElement(this)?.classList.add('highlight');

					target.iface.$el.addClass('highlight');
				},
				unhover(){
					scope('cables').list.getElement(this)?.classList.remove('highlight');

					target.iface.$el.removeClass('highlight');
				}
			});
		}

		if(disconnect.deep.length !== 0)
			menu.push(disconnect);

		if(menu.length === 0)
			return;

		var pos = this.findPortElement(ev.target).getClientRects()[0];
		pos.event = ev;
		scope('dropdown').show(menu, pos);
	}

	insertComponent(beforeSelector, compName, item, callback, _repeat, _reinit){
		var portList = this.iface[this.source];
		var that = this;

		if(portList.getElement === void 0){
			return setTimeout(function(){
				if(_repeat === void 0)
					that.insertComponent(beforeSelector, compName, item, callback, true)
			}, 100);
		}

		if(_reinit === void 0){
			var reinitClone = false;
			if(this.iface.initClone === void 0)
				reinitClone = true;
			else if(this.iface.initClone.bp$insertComponent === void 0)
				reinitClone = this.iface.initClone;

			if(reinitClone){
				var reinitList = [];
				this.iface.initClone = function(a,b,c){
					reinitClone !== true && reinitClone(a,b,c);

					for (var i = 0; i < reinitList.length; i++)
						reinitList[i]();
				}

				this.iface.initClone.bp$insertComponent = reinitList;
			}

			this.iface.initClone.bp$insertComponent.push(function(){
				that.insertComponent(beforeSelector, compName, item, callback, true, true);
			});
		}

		if(compName.constructor === String){
			compName = compName.split('-');
			for (var i = 0; i < compName.length; i++)
				compName[i] = compName[i][0].toUpperCase() + compName[i].slice(1);
		}

		var comp = window['$'+compName.join('')];
		var beforeEl = portList.getElements(this.name);
		for (var i = 0; i < beforeEl.length; i++) {
			var before = beforeEl[i];
			if(before.bp$insertItem === item)
				continue;

			before.bp$insertItem = item;
			var el = new comp(item, Blackprint.space, true);

			if(beforeSelector !== null)
				before.insertBefore(el, before.querySelector(beforeSelector));
			else
				before.appendChild(el);

			callback && callback(item, el);
		}
	}
}