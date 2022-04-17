let BP_Port = Blackprint.Port;
class Port extends Blackprint.Engine.Port {
	// For Prototype only, the constructor() must not being used here
	// But used on ./Interface.js -> _newPort()

	findPortElement(el){
		if(!el.classList.contains('ports'))
			el = el.closest('.ports');

		return el.querySelector('.port');
	}

	createCable(e, noPush){
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
		if(!noPush) this.cables.push(cable);

		// Put port reference to the cable
		cable.owner = this;

		let evTemp = {port: this, cable};
		this.iface.emit('cable.created', evTemp);

		if(Blackprint.settings._remoteSketch)
			this._scope.sketch.emit('cable.created', evTemp);

		// Stop here if this function wasn't triggered by user
		if(isAuto) return cable;

		this._scope('nodes').unselectAll();
		this._scope('cables').unselectAll();

		// Default head index is "2" when creating new cable
		cable.cableHeadClicked(e, true);

		if(e.pointerType !== 'touch') return;

		let targetEl = $(e.target);
		function isContextMenu() {
			cable._delete();
		}

		targetEl.once('contextmenu', isContextMenu);
		setTimeout(()=> {
			targetEl.off('contextmenu', isContextMenu);
		}, 4000);
	}

	connectCable(cable){
		if(this._ignoreConnect) return;

		let _cable = cable;
		if(_cable === void 0 && this._scope !== void 0)
			_cable = this._scope('cables').currentCable;

		if(_cable.beforeConnect != null){
			let temp = _cable.beforeConnect;
			_cable.beforeConnect = null;

			temp();
			if(_cable.connected || _cable._destroyed)
				return;
		}

		let res = super.connectCable(cable);
		if(res === true && cable != null && this._scope != null){
			if(!Blackprint.settings.windowless){
				let list = cable.input.iface.input._list;
				if(list != null){
					let rect = this.findPortElement(list.getElement(cable.input)).getBoundingClientRect();
	
					let { offset, pos, scale } = this._scope('container');
					cable.head2[0] = (rect.x + rect.width/2 - offset.x - pos.x) / scale;
					cable.head2[1] = (rect.y + rect.height/2 - offset.y - pos.y) / scale;
				}

				list = cable.output.iface.output._list;
				if(list != null){
					let rect = this.findPortElement(list.getElement(cable.output)).getBoundingClientRect();
	
					let { offset, pos, scale } = this._scope('container');
					cable.head1[0] = (rect.x + rect.width/2 - offset.x - pos.x) / scale;
					cable.head1[1] = (rect.y + rect.height/2 - offset.y - pos.y) / scale;
				}
			}
		}

		return res;
	}

	_cableConnectError(name, obj){
		if(this._scope === void 0)
			return super._cableConnectError(name, obj);

		this._scope.sketch.emit(name, obj);
	}

	// PointerOver event handler
	portHovered(event){
		if(event.pointerType === 'touch')
			return;

		var portElem = this.findPortElement(event.target);

		this._scope.sketch.emit('port.hover', { event, port: this });
		this.iface.emit('port.hover', { event, port: this });

		// For magnet sensation when the cable reach the port
		this._scope('cables').hoverPort = {
			elem:portElem,
			rect:portElem.getBoundingClientRect(),
			item:this
		};
	}

	// PointerOut event handler
	portUnhovered(event){
		if(event.pointerType === 'touch')
			return;

		this._scope.sketch.emit('port.unhover', { event, port: this });
		this.iface.emit('port.unhover', { event, port: this });

		this._scope('cables').hoverPort = false;
	}

	portRightClick(ev){
		var scope = this._scope;
		var menu = [{
			title: "Suggested Node",
			callback(){ setTimeout(suggestNode, 220) },
		}];

		let port = this;
		if(ev.ctrlKey) return suggestNode();
		function suggestNode(){
			let suggestedNode = Blackprint.Sketch.suggestNodeForPort(port);

			var pos = port.findPortElement(ev.target).getClientRects()[0];
			pos.event = ev;

			let menu = createNodesMenu(suggestedNode, scope.sketch, ev, pos);
			scope('dropdown').show(menu, pos);
		}

		let event = {iface: this, instance: scope.sketch, port, menu};
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
		var portList = this.iface[this.source]._list;
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

		let _compName = compName;
		if(compName.constructor === String){
			compName = compName.split('-');
			for (var i = 0; i < compName.length; i++)
				compName[i] = compName[i][0].toUpperCase() + compName[i].slice(1);
		}

		var comp = window['$'+compName.join('')];
		var beforeEl = portList.getElements(this);
		for (var i = 0; i < beforeEl.length; i++) {
			var before = beforeEl[i];
			if(before.bp$insertItem === item)
				continue;

			before.bp$insertItem = item;
			var el = new comp(item, Blackprint.space, true);

			if(beforeSelector !== null){
				if(beforeSelector === '.name' && _compName === 'comp-port-input')
					el.style.marginRight = '-5px';

				before.insertBefore(el, before.querySelector(beforeSelector));
			}
			else
				before.appendChild(el);

			callback && callback(item, el);
		}
	}
}