let EngineInterface = Blackprint.Interface;

// Override the Interface to make it compatible for Sketch and non-sketch
Blackprint.Interface = class Interface extends sf.Model {
	/*
	x = 0;
	y = 0;

	input = {};
	output = {};
	routes = {};
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
			this.description = '';  // summary
			this._description = ''; // bpDocs
			this.x = 0;
			this.y = 0;
			this.importing = true;
			this.comment = '';
			this.type = node.constructor.type ?? ''; // default node type: general
			this.node = node;
			this._scope = node.instance.scope;
			this._nodeSelected = false;
			this._nodeHovered = false;
			this._inactive = false;

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

		this.node.instance.changeNodeId(this, val);
	}

	_newPort(portName, type, def, which, haveFeature){
		var temp = new Blackprint.Engine.Port(portName, type, def, which, this, haveFeature);
		temp._scope = this._scope;
		temp.inactive = false;
		temp._description = '';
		Object.setPrototypeOf(temp, Port.prototype);

		function iName(){
			if(type.constructor === Array && type.name.includes(' '))
				type._name = type.name.replace(/ /g, ', ');

			temp._iname = temp.name.replace(/([a-z])([A-Z])/g, '$1 $2');
		}

		sf.watch(temp, 'name', iName);
		iName();

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

		if(!single && this._nodeSelected)
			container.moveSelection(e, this);

		if(container.onNodeMove !== void 0)
			container.onNodeMove(e, this);

		// Also move all cable connected to current iface
		var ports = Blackprint.Interface._ports;
		for(var i = 0; i < ports.length; i++){
			let which = ports[i];
			var _list = this[which]?._portList;

			if(_list === void 0)
				continue;

			for (var z = 0; z < _list.length; z++) {
				let port = _list[z];
				var cables = port.cables;
				if(cables.length === 0)
					continue;

				for (var a = 0; a < cables.length; a++) {
					this._cableMove(which, cables[a], x, y, this);
				}
			}
		}

		let { routes } =  this.node;
		if(routes._outTrunk) this._cableMove('output', routes._outTrunk, x, y, this);
		else if(routes.out) this._cableMove('output', routes.out, x, y, this);

		let routesIn = routes.in;
		for (let i=0; i < routesIn.length; i++) {
			this._cableMove('input', routesIn[i], x, y, this);
		}

		if(e.type === "pointerup")
			this.node.instance.emit('node.move', {iface: this, event: e});
	}

	_cableMove(which, cable, x, y, iface){
		// Avoid moving ghost cable
		if(cable._ghost) return;

		// Avoid moving branch cable
		if(cable._allBranch !== void 0){
			if(which === 'output' && (cable.cableTrunk !== cable || cable.parentCable !== void 0))
				return;
		}

		// If the source and target is in current node
		if(cable.owner.iface === iface && (cable.target && cable.target.iface === iface)){
			if(which === 'output')
				return;

			let { head1, head2 } = cable;

			if(cable.parentCable == null){
				head1[0] += x;
				head1[1] += y;
			}

			head2[0] += x;
			head2[1] += y;
			return;
		}

		var head;
		if(cable.owner.iface === iface)
			head = cable.head1;
		else
			head = cable.head2;

		head[0] += x;
		head[1] += y;
	}

	nodeMenu(ev){
		var scope = this._scope;
		var container = this._container;
		let iface = this;
		let menu;

		if(this.namespace.startsWith('BP/Fn/')) menu = [];
		else {
			menu = [{
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
		}

		let skipMenu = false;
		let event = {iface: this, instance: scope.sketch, menu, event: ev, preventDefault(){
			skipMenu = true;
		}};

		this.emit('node.menu', event);
		scope.sketch.emit('node.menu', event);

		if(skipMenu) return;
		scope('dropdown').show(menu, {x: ev.clientX, y: ev.clientY, event: ev});
	}

	swapZIndex(ev, disableSwap){
		let container = this._container;
		let ifaceList = container.nodeScope.list;

		this._scope.sketch.emit('node.click', { event: ev, iface: this});

		if(!disableSwap){
			let refresh = () => {
				let i = ifaceList.indexOf(this);
				if(i+1 === ifaceList.length) return;
	
				ifaceList.move(i, -1, 1);
			};

			if(ev.pointerType === 'touch'){
				$(ev.target).once('pointerup', refresh);
			}
			else refresh();
		}
	}

	nodeHovered(event){
		var container = this._container;
		let cableScope = container.cableScope;
		let cable = cableScope.currentCable;
		this._nodeHovered = true;

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

				// item == Port
				cableScope.hoverPort.item.connectCable(cable, ev);
			};

			this.$el.once('pointerup', this.__onCableDrop);

			if(cable.isRoute){
				let portElem = this.node.routes._inElement;
				if(portElem == null) return;

				event.view ??= window;
				portElem = sf.Window.source(portElem, event);

				// Maybe the route port was disabled for that node
				if(portElem == null) return;

				let rect = portElem.getBoundingClientRect();
				let temp = rect => {
					cableScope.hoverPort = {
						elem: portElem,
						rect,
						item: this.node.routes,
					};
				}

				if(rect.x === 0 && rect.y === 0){
					setTimeout(() => temp(portElem.getBoundingClientRect()), 100);
					return;
				}

				temp(rect);
				return;
			}

			// Search suitable port for the hovering cable
			let owner = cable.owner; // source port
			let targetPorts = owner.source === "input" ? this.output : this.input;

			if(targetPorts == null) return;

			let _list = targetPorts._portList;
			for (var i = 0; i < _list.length; i++) {
				let port = _list[i];

				if((port.type.any && owner.type !== Function)
					|| (owner.type.any && port.type !== Function)
					|| port.type === owner.type
					|| (port.type.constructor === Array && port.type.includes(owner.type))
					|| (owner.type.constructor === Array && owner.type.includes(port.type))
				){
					event.view ??= window;

					let portElem = sf.Window.source(_list.getElements(port), event).querySelector('.port');
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
		this._nodeHovered = false;

		this._scope.sketch.emit('node.unhover', { event, iface: this });

		if(this.__onCableDrop !== void 0){
			this.$el.off('pointerup', this.__onCableDrop);
			this.__onCableDrop = void 0;
		}

		cableScope.hoverPort = false;
	}

	_updateDocs(){
		let docs = Blackprint._docs;
		let exist = deepProperty(docs, this.namespace.split('/'));
		if(exist == null) return;

		this.docs = exist;

		let { input, output, tags } = exist;
		if(input != null){
			for (let key in input) {
				let port = this.input[key];
				if(port == null) continue;

				port.docs = input[key];
			}
		}

		if(output != null){
			for (let key in output) {
				let port = this.output[key];
				if(port == null) continue;

				port.docs = output[key];
			}
		}

		if(tags?.summary != null) this.description = tags.summary;
	}
	async _recalculateSize(){
		if(Blackprint.settings.windowless || this.node.instance.pendingRender) return;
		await $.afterRepaint();

		this.$space?.('nodes')._recalculate([{
			target: {model: this},
			contentRect: this.$el[0].firstElementChild.getBoundingClientRect(),
		}]);
	}
	initInputPort(){
		if(this.node.instance.pendingRender) return;
		let isEventNode = this.namespace.startsWith('BP/Event/');

		let _debounce;
		let inputs = this.input;
		let update = port => {
			if(isEventNode) return;

			let node = this.node;
			node.instance.emit('port.default.changed', { port });
			port.emit('value', { port, cable: { isVirtual: true, value: port.default } });

			if(node.routes.in.length === 0)
				node._bpUpdate();
		}


		// Skip default value's port input box for internal nodes
		if(this.namespace.startsWith('BP/') && !isEventNode) return;

		for(let key in inputs){
			let port = inputs[key];
			if(port._hasComponent) continue; // Skip default component if the developer already added a component

			let type = 'string';
			if(port.type === Number) type = 'number';
			else if(port.type === Boolean) type = 'checkbox';
			else if(port.type !== String) continue; // Skip if not Number/Boolean/String

			// Skip if the port is using ArrayOf feature
			if(port.feature === BP_Port.ArrayOf) continue;

			port._mainDefault = port.default;
			let debouncer = ()=> update(port);

			let item = port._boxInput = {
				value: port.default ?? '',
				visible: port.cables.length === 0,
				type,
				whenChanged(now){
					clearTimeout(_debounce);
					_debounce = setTimeout(debouncer, 700);

					return port.default = type === 'number' ? +now : now;
				}
			};

			let componentName = port.type === String ? 'comp-port-textarea' : 'comp-port-input';

			port.insertComponent(null, componentName, item);
			port.on('connect', ()=> this._assignDefault(item, false, port));
			port.on('disconnect', ()=> this._assignDefault(item, true, port));
		}

		setTimeout(() => this._recalculateSize(), 200);
	}
	_assignDefault(item, isDisconnect, port){
		item.visible = isDisconnect;
		if(isDisconnect)
			port.default = port._defaultTemp;
		else {
			port._defaultTemp = port.default;
			port.default = port._mainDefault;
		}

		this._recalculateSize();
	}
	_exportInputs(){
		let portData = {};
		let inputs = this.input;
		let hasData = false;

		for(let key in inputs){
			let port = inputs[key];
			if(port.cables.length === 0 && port.default != null){
				if(port.default instanceof Object || port.default.constructor === Symbol)
					continue;

				hasData = true;
				portData[key] = port.default;
			}
		}

		return hasData ? portData : null;
	}
};

Blackprint.Interface.prototype._importInputs = EngineInterface.prototype._importInputs;
Blackprint.Interface.prototype._initPortSwitches = EngineInterface.prototype._initPortSwitches;

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

prototypeReplacer(Blackprint._iface, EngineInterface, Blackprint.Interface);