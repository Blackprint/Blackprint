// import { Cable } from "./Cable.js";

Blackprint.RoutePort = class RoutePort extends Blackprint.RoutePort {
	// in = []; // Allow incoming route from multiple path
	// out = null; // Only one route/path

	constructor(iface){
		super(iface);
		this._hovered = false;
		this.type = {_bpRoute: true, name: 'BP-Route'};
	}

	_initForSketch(){
		if(this._init) return;
		this._init = true;

		let iface = this.iface;
		this._inElement = iface.$el('.routes .in');
		this._outElement = iface.$el('.routes .out');
		this._scope = iface.$space;
	}

	_unhover(ev){ this._hovered = false; }
	_hover(ev){ this._hovered = true; }

	rightClick(event){ }

	// For creating output cable
	createCable(event){
		if(!this._init) this._initForSketch();
		var cable;

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
		else cable = new Cable({x: 0, y: 0}, this, true);

		cable.source = 'output';
		super.createCable(cable);

		// Trigger the drag handler
		if(event != null){
			// Default head index is "2" when creating new cable
			cable.cableHeadClicked(event, true);
		}

		return cable;
	}

	// Connect to input route
	connectCable(cable){
		if(!this._init) this._initForSketch();

		let cables = this._scope('cables');
		if(cable == null)
			cable = cables.currentCable;

		if(!cable) return false;
		cables.currentCable = void 0;

		if(cable.owner.iface === this.iface){
			cable.disconnect();
			return false;
		}

		if(!Blackprint.settings.windowless){
			let offset = this._scope('container').offset;
			let rect = this._inElement[0].getBoundingClientRect();
			let center = rect.width / 2;

			cable.head2[0] = rect.x + center - offset.x;
			cable.head2[1] = rect.y + center - offset.y;
		}

		return super.connectCable(cable);
	}
}