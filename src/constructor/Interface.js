let EngineInterface = Blackprint.Interface;

// Override the Interface to make it compatible for Sketch and non-sketch
Blackprint.Interface = class Interface extends sf.Model {
	/*
	x = 0;
	y = 0;

	input = {};
	output = {};
	*/

	static _ports = ['input', 'output'];
	static _prepare = Blackprint.Interface._prepare; // Copy from engine-js
	static _reuse = Blackprint.Interface._reuse; // Copy from engine-js

	constructor(node){
		if(Blackprint._reuseIFace !== void 0){
			// This part will run when created from sketch "/src/page.sf"
			// node == Blackprint.space
			let that = Blackprint._reuseIFace;
			Blackprint._reuseIFace = void 0;

			// Throw the cloned element to SF Component
			if(that.$decoration !== void 0)
				throw {_sf_component: true, _sf_obj: that};

			return that;
		}
		else{
			if(node === void 0)
				throw new Error("First parameter was not found, did you forget 'super(node)' when extending Blackprint.Interface?");

			super();
			this.title = 'No Title';
			this.description = '';
			this.x = 0;
			this.y = 0;
			this.importing = true;
			this.comment = '';
			this.type = false; // default node type: general
			this.env = Blackprint.Environment.map;
			this.node = node;
			this._scope = node._instance.scope;
			this._nodeSelected = false;

			if(this._scope !== void 0){
				this._container = this._scope('container');
				this.hideUnusedPort = this._container.hideUnusedPort;
			}

			this.$decoration = new IFaceDecoration(this);
		}
	}

	get id(){ return this._id_ }
	set id(val){
		let {marks} = this.$decoration;

		if(Blackprint.settings._remoteSketch && this._scope != null){
			this._scope.sketch.emit('node.id.changed', {
				iface: this,
				from: this._id_,
				to: val
			});
		}

		if(val){
			if(val.constructor !== String)
				val = ''+val;

			this._id_ = val;
			marks.set('id', {
				title: 'IFace ID: '+ val,
				icon: 'fa fa-bookmark'
			});
		}
		else{
			this._id_ = void 0;
			marks.delete('id');
		}
	}

	_newPort(portName, type, def, which, haveFeature){
		var temp = new Blackprint.Engine.Port(portName, type, def, which, this, haveFeature);
		temp._scope = this._scope;
		temp.inactive = false;
		Object.setPrototypeOf(temp, Port.prototype);

		if(type.constructor === Array && type.name.includes(' '))
			type._name = type.name.replace(/ /g, ', ');

		return temp;
	}

	// ==== Below is for Sketch only ====

	// DragMove event handler
	moveNode(e, single){
		var container = this._container;
		var scale = container.scale;
		var x = e.movementX/devicePixelRatio / scale;
		var y = e.movementY/devicePixelRatio / scale;

		this.x += x;
		this.y += y;

		if(!single) container.moveSelection(e, this);

		if(container.onNodeMove !== void 0)
			container.onNodeMove(e, this);

		// Also move all cable connected to current iface
		var ports = Blackprint.Interface._ports;
		for(var i = 0; i < ports.length; i++){
			let which = ports[i];
			var _list = this[which]?._list;

			if(_list === void 0)
				continue;

			for (var z = 0; z < _list.length; z++) {
				let port = _list[z];
				var cables = port.cables;
				if(cables.length === 0)
					continue;

				var head;
				for (var a = 0; a < cables.length; a++) {
					let cable = cables[a];

					// Avoid moving ghost cable
					if(cable._ghost) continue;

					// Avoid moving branch cable
					if(cable._allBranch !== void 0){
						if(which === 'output'
						   && (cable.cableTrunk !== cable || cable.parentCable !== void 0))
							continue;
					}

					// If the source and target is in current node
					if(cable.owner.iface === this && (cable.target && cable.target.iface === this)){
						if(which === 'output')
							continue;

						let { head1, head2 } = cable;

						if(cable.parentCable == null){
							head1[0] += x;
							head1[1] += y;
						}

						head2[0] += x;
						head2[1] += y;
						continue;
					}

					if(cable.owner.iface === this)
						head = cable.head1;
					else
						head = cable.head2;

					head[0] += x;
					head[1] += y;
				}
			}
		}
	}

	nodeMenu(ev){
		var scope = this._scope;
		var container = this._container;
		let iface = this;
		var menu = [{
			title: 'New Node',
			callback(){
				scope.sketch.createNode(iface.namespace, {
					x: iface.x + 10, y: iface.y + 10
				});
			}
		}, {
			title: 'Delete',
			callback(){
				// delete selected
				let selected = container.nodeScope.selected;
				if(selected.length !== 0){
					for (var i = selected.length - 1; i >= 0; i--)
						scope.sketch.deleteNode(selected[i]);

					selected.splice(0);
					container.cableScope.selected.splice(0);
					return;
				}

				scope.sketch.deleteNode(iface);
			}
		}];

		let event = {iface: this, instance: scope.sketch, menu};

		this.emit('node.menu', event);
		scope.sketch.emit('node.menu', event);

		scope('dropdown').show(menu, {x: ev.clientX, y: ev.clientY, event: ev});
	}

	swapZIndex(ev, disableSwap){
		var container = this._container;
		let ifaceList = container.nodeScope.list;
		this._scope.sketch.emit('node.click', { event: ev, iface: this});

		if(!disableSwap)
			ifaceList.push(ifaceList.splice(ifaceList.indexOf(this), 1)[0]);
	}

	nodeHovered(event){
		var container = this._container;
		let cableScope = container.cableScope;
		let cable = cableScope.currentCable;

		this._scope.sketch.emit('node.hover', { event, iface: this });

		if(cable !== void 0){
			let el = event.target;

			// Return if already targeting to any port
			if(el.parentElement.classList.contains('ports') || el.classList.contains('ports'))
				return;

			this.__onCableDrop = function(ev){
				let el = event.target;

				// Return if already targeting to any port
				if(el.parentElement.classList.contains('ports') || el.classList.contains('ports'))
					return;

				if(cableScope.hoverPort === false || cable.connected || cable.selected)
					return;

				let port = cableScope.hoverPort.item;
				port.connectCable(cable);
			};

			this.$el.once('pointerup', this.__onCableDrop);

			// Search suitable port for the hovering cable
			let owner = cable.owner; // source port
			let targetPorts = owner.source === "input" ? this.output : this.input;

			if(targetPorts == null) return;

			let _list = targetPorts._list;
			for (var i = 0; i < _list.length; i++) {
				let port = _list[i];

				if((port.type.any && owner.type !== Function)
					|| (owner.type.any && port.type !== Function)
					|| port.type === owner.type
					|| (port.type.constructor === Array && port.type.includes(owner.type))
					|| (owner.type.constructor === Array && owner.type.includes(port.type))
				){
					let portElem = _list.getElement(i).querySelector('.port');
					cableScope.hoverPort = {
						elem: portElem,
						rect: portElem.getBoundingClientRect(),
						item: port,
					};
					break;
				}
			}

			return;
		}
	}

	nodeUnhovered(event){
		var container = this._container;
		let cableScope = container.cableScope;
		// let cable = cableScope.currentCable;

		this._scope.sketch.emit('node.unhover', { event, iface: this });

		if(this.__onCableDrop !== void 0){
			this.$el.off('pointerup', this.__onCableDrop);
			this.__onCableDrop = void 0;
		}

		cableScope.hoverPort = false;
	}
};


var IFaceDecoration = Blackprint.Interface.Decoration = class IFaceDecoration {
	constructor(iface){
		this.marks = new Map();
		this.other = []; // This elements will be appended on <div class="other">
	}

	// ToDO: fix for cloned container, the decoration doesn't get cloned
	headInfo(type, msg){
		let temp = Blackprint.space.component('bpnode-header-info').new.stem({});
		temp.model.type = type;
		temp.model.text = msg;

		let list = this.other;
		list.push(temp);

		let controller = temp.model;
		controller.destroy = function(){
			let i = list.indexOf(temp);
			if(i === -1) return;

			list.splice(i, 1);
		}

		return controller;
	}
	info(msg){ return this.headInfo('info', msg) }
	warn(msg){ return this.headInfo('warn', msg) }
	error(msg){ return this.headInfo('error', msg) }
	success(msg, timeout=5000){
		let model = this.headInfo('success', msg);

		if(timeout){
			setTimeout(()=> model.destroy(), timeout);
		}

		return model;
	}
}

// Class combine (sf.Model + CustomEvent)
let _proto1 = Object.getOwnPropertyDescriptors(Blackprint.Engine.CustomEvent.prototype);
delete _proto1.constructor;
Object.defineProperties(Blackprint.Interface.prototype, _proto1);