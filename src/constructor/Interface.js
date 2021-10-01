Blackprint.Sketch.Interface = class SketchInterface extends sf.Model{
	/*
	x = 0;
	y = 0;

	input = {};
	output = {};
	property = {};
	*/

	static _ports = ['input', 'output', 'property'];

	constructor(node){
		if(Blackprint._reuseIFace !== void 0){
			// This part will run when created from sketch "/src/page.sf"
			// node == Blackprint.space
			let that = Blackprint._reuseIFace;
			Blackprint._reuseIFace = void 0;
			return that;
		}
		else{
			if(node === void 0)
				throw new Error("First parameter was not found, did you forget 'super(node)' when extending Blackprint.Sketch.Interface?");

			super();
			this.title = 'No Title';
			this.description = '';
			this.importing = true;
			this.env = Blackprint.Environment.map;
			this._scope = node._instance.scope;
			this._container = this._scope('container');
			this.node = node;
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
		var ports = Blackprint.Sketch.Interface._ports;
		for(var i=0; i<ports.length; i++){
			var which = this[ports[i]];

			for(var key in which){
				var cables = which[key].cables;
				if(cables.length === 0)
					continue;

				var cable;
				for (var a = 0; a < cables.length; a++) {
					let ref = cables[a];

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
		var menu = [{
			title: 'Delete',
			args: [this],
			callback(iface){
				var list = scope('nodes').list;
				var i = list.indexOf(iface);

				if(i === -1)
					return scope.sketch._trigger('error', {
						type: 'node_delete_not_found',
						data: {iface}
					});

				scope.$destroyed = true;
				list.splice(i, 1);

				var check = Blackprint.Sketch.Interface._ports;
				for (var i = 0; i < check.length; i++) {
					var portList = iface[check[i]];
					for(var port in portList){
						var cables = portList[port].cables;
						for (var a = cables.length - 1; a >= 0; a--)
							cables[a].destroy();
					}
				}
			}
		}];

		this._trigger('node.menu', menu);
		scope('dropdown').show(menu, {x: ev.clientX, y: ev.clientY});
	}

	static From(branch){
		if(!(branch.prototype instanceof Blackprint.Interface)){
			console.log("Got this class:", branch);
			throw new Error('Class must extends Blackprint.Interface to be transformed into Blackprint.Sketch.Interface');
		}

  		let classes = [];
  		getPrototypeMethods(classes, branch);

  		// Trying to support multiple inheritance for
  		// (Blackprint.Interface + Blackprint.Sketch.Interface)
  		// I know that this code was a bit complicated
  		let clazz = class extends Blackprint.Sketch.Interface {};
  		for(var i=classes.length-1; i >= 0; i--){
  			var now = classes[i];
  			Object.defineProperties(clazz.prototype, now.proto);
  			Object.defineProperty(clazz, 'name', {value: now.ref.name});

  			if(i !== 0) clazz = class extends clazz {};
  		}

  		return class extends Blackprint.Sketch.Interface {
  			constructor(node){
  				super(node);
  				if(this._bp_this !== void 0)
  					return this._bp_this;

  				let temp = new branch(node);
  				let property = Object.getOwnPropertyDescriptors(this);
  				delete property.prototype;
  				property._bp_this = {value: temp};
  				Object.defineProperties(temp, property);
  				Object.setPrototypeOf(temp, clazz.prototype);
  				return temp;
  			}
  		}
	}
};

function getPrototypeMethods(save, clas){
	if(clas.prototype === void 0 || clas === Function || clas === Object || clas === Blackprint.Interface)
		return;

	let proto = Object.getOwnPropertyDescriptors(clas.prototype);
	delete proto.constructor;
	save.push({ ref: clas, proto });

	var deep = Object.getPrototypeOf(clas);
	if(deep.prototype !== void 0)
		getPrototypeMethods(save, deep);
}

// Class combine (sf.Model + CustomEvent)
let _proto1 = Object.getOwnPropertyDescriptors(Blackprint.Engine.CustomEvent.prototype);
delete _proto1.constructor;
Object.defineProperties(Blackprint.Sketch.Interface.prototype, _proto1);