// Override the Interface to make it compatible for Sketch and non-sketch
Blackprint.Interface = class SketchInterface extends sf.Model {
	/*
	x = 0;
	y = 0;

	input = {};
	output = {};
	property = {};
	*/

	static _ports = ['input', 'output', 'property'];
	static prepare = Blackprint.Interface.prepare; // Copy from engine-js

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
			this.importing = true;
			this.env = Blackprint.Environment.map;
			this.node = node;
			this._scope = node._instance.scope;

			if(this._scope !== void 0)
				this._container = this._scope('container');

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
	}

	newPort(portName, type, def, which, iface){
		var temp = new Blackprint.Engine.Port(portName, type, def, which, iface);
		temp._scope = this._scope;
		Object.setPrototypeOf(temp, Port.prototype);

		if(type.constructor === Array && type.name.includes(' '))
			type._name = type.name.replace(/ /g, ', ');

		return temp;
	}

	// ==== Below is for Sketch only ====

	// DragMove event handler
	moveNode(e){
		var container = this._container;
		var scale = container.scale;
		var x = e.movementX / scale;
		var y = e.movementY / scale;

		this.x += x;
		this.y += y;

		if(container.onNodeMove !== void 0)
			container.onNodeMove(e, this);

		let nonce;

		// Also move all cable connected to current iface
		var ports = Blackprint.Interface._ports;
		for(var i=0; i<ports.length; i++){
			var which = this[ports[i]];

			for(var key in which){
				let port = which[key];
				var cables = port.cables;
				if(cables.length === 0)
					continue;

				var cable;
				for (var a = 0; a < cables.length; a++) {
					let ref = cables[a];

					// Avoid moving branch cable
					if(ref._allBranch !== void 0
					   && port.source === 'output'
					   && ref.cableTrunk !== ref){
						continue;
					}

					// If the source and target is in current node
					if(ref.owner.iface === this && (ref.target && ref.target.iface === this)){
						if(nonce === void 0){
							nonce = Date.now() + Math.random();
							ref._nonce = nonce;
						}
						else if(ref._nonce === nonce)
							continue;

						let { head1, head2 } = ref;

						head1[0] += x;
						head1[1] += y;

						head2[0] += x;
						head2[1] += y;
						continue;
					}

					if(ref.owner.iface === this)
						cable = ref.head1;
					else
						cable = ref.head2;

					cable[0] += x;
					cable[1] += y;
				}
			}
		}
	}

	nodeMenu(ev){
		var scope = this._scope;
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
				scope.sketch.deleteNode(iface);
			}
		}];

		let event = {iface: this, instance: scope.sketch, menu};

		this.emit('node.menu', event);
		scope.sketch.emit('node.menu', event);

		scope('dropdown').show(menu, {x: ev.clientX, y: ev.clientY, event: ev});
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