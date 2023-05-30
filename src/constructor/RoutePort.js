// import { Cable } from "./Cable.js";

Blackprint.RoutePort = class RoutePort extends Blackprint.RoutePort {
	// in = []; // Allow incoming route from multiple path
	// out = null; // Only one route/path

	constructor(iface){
		super(iface);
		this._hovered = false;
		this.type = {_bpRoute: true, name: 'BP-Route'};

		// Return true if 'node.update' was not defined
		this.noUpdate = iface.node.update == null;
	}

	_initForSketch(){
		let iface = this.iface;

		if(this._init || iface.$el == null) return;
		this._init = true;
		this._scope = iface.$space;
	}

	get _inElement(){
		if(Blackprint.settings.windowless || this.iface.node.instance.pendingRender) return null;
		if(this.__inElement == null || this.__inElement.length === 0)
			this.__inElement = this.iface.$el('.routes .in');

		return this.__inElement
	}

	get _outElement(){
		if(Blackprint.settings.windowless || this.iface.node.instance.pendingRender) return null;
		if(this.__outElement == null || this.__outElement.length === 0)
			this.__outElement = this.iface.$el('.routes .out');

		return this.__outElement;
	}

	_unhover(ev){ this._hovered = false; }
	_hover(ev){ this._hovered = true; }

	rightClick(event){ }

	// For creating output cable
	createCable(event){
		if(!this._init) this._initForSketch();
		var cable, iface = this.iface;

		if(event != null){
			let target = $(event.target);
			if(!target.hasClass('out')) return;

			let rect = target[0].getBoundingClientRect();
			let center = rect.width / 2;

			cable = new Cable({
				x: rect.x + center,
				y: rect.y + center,
			}, this, true);
		}
		else{
			let rect;
			if(iface.$el == null || Blackprint.settings.windowless || iface.node.instance.pendingRender)
				rect = {x:0, y:0, height:0, width:0};
			else rect = iface.$el('.routes .out')[0].getBoundingClientRect();

			cable = new Cable({
				x: rect.x + rect.width/2,
				y: rect.y + rect.height/2
			}, this, true);
		}

		cable.source = 'output';
		super.createCable(cable);

		// Trigger the drag handler
		if(event != null){
			// Default head index is "2" when creating new cable
			cable.cableHeadClicked(event, true);
		}

		if(iface.update == null && iface.node.update == null && this._invalidRoute == null){
			if(!(findAnyRouteOut(iface) || findAnyRouteOut(iface.node))){
				this._invalidRoute = true;
			}
		}

		if(this._invalidRoute)
			cable.valid = false;

		let evTemp = {port: this, cable};
		iface.emit('cable.created', evTemp);
		this._scope.sketch.emit('cable.created', evTemp);

		return cable;
	}

	// Connect to input route
	connectCable(cable, _ev){
		if(!this._init) this._initForSketch();

		let cables = this._scope('cables');
		if(cable == null)
			cable = cables.currentCable;

		if(!cable) return false;
		cables.currentCable = void 0;

		if(cable.owner.iface === this.iface || cable.isRoute === false){
			cable.disconnect();
			return false;
		}

		if(!Blackprint.settings.windowless && !this.iface.node.instance.pendingRender){
			let { offset, pos, scale } = this._scope('container');

			let el_;
			if(_ev == null) el_ = this._inElement[0];
			else el_ = sf.Window.source(this._inElement, _ev);

			let rect = el_.getBoundingClientRect();

			cable.head2[0] = (rect.x+(rect.width/2) - offset.x - pos.x) / scale;
			cable.head2[1] = (rect.y+(rect.height/2) - offset.y - pos.y) / scale;
		}

		let res = super.connectCable(cable);
		this._checkInactiveFromNode(cable.owner.iface);
		return res;
	}

	_checkInactiveFromNode(iface, checked=new Set()){
		let outputs = iface.output;
		for (let key in outputs) {
			let { cables } = outputs[key];
			for (let i=0; i < cables.length; i++) {
				this._checkInactiveNode(cables[i].input?.iface, checked);
			}
		}
	}

	_checkInactiveNode(target, checked=new Set()){
		if(target == null) return;

		if(checked.has(target)) return;
		checked.add(target);

		let isActive = false;

		// Active if it connected to port that controlled by a script
		if(target.isGhost) isActive = true;

		// Active if this node can be requested from other input port
		if(!isActive) isActive = target.node.request != null || target.request != null;

		// Active if have 'port.value' listener
		if(!isActive) isActive = !!(target._event?.['port.value']?.length);

		// Check every input port
		if(!isActive){
			let hasInput = false;
			let inputs = target.input;

			that: for (let key in inputs) {
				hasInput = true;
				let { cables, _event } = inputs[key];

				// Active if have 'value' listener
				if(!!(_event?.value?.length)){
					isActive = true;
					break that;
				}

				for (let i=0; i < cables.length; i++) {
					let prevIface = cables[i].output?.iface;
					if(prevIface == null) continue;

					// Active if previous node is active and don't have any route out
					if(prevIface._inactive === false && prevIface.node.routes.out == null){
						isActive = true;
						break that;
					}
				}
			}

			// Active if have active route into current node
			let ins = target.node.routes.in;
			for (let i=0; i < ins.length; i++) {
				if(ins[i].output.iface._inactive === false){
					isActive = true;
					break;
				}
			}

			// Default to active if have no input (like standalone node that triggered by itself)
			if(!hasInput) isActive = true;
		}

		let willInactive = !isActive;

		// Mark connected cables as active/inactive
		let inputs = target.input;
		for (let key in inputs) {
			let { cables } = inputs[key];
			for (let i=cables.length-1; i >= 0; i--) {
				if(cables[i] == null) cables.splice(i, 1);
				cables[i]._inactive = willInactive;
			}
		}

		// Mark connected route cables as active/inactive
		let outRoute = target.node.routes?.out;
		if(outRoute != null) outRoute._inactive = willInactive;

		// Mark node as active/inactive
		if(!target.isGhost)
			target._inactive = willInactive;

		// Deep recheck
		this._checkInactiveFromNode(target, checked);
	}
}

function findAnyRouteOut(obj) {
    if(obj === Object.prototype)
        return false;
    if(obj.constructor.toString().includes('.routeOut('))
        return true;

    return findAnyRouteOut(Object.getPrototypeOf(obj.constructor.prototype));
}