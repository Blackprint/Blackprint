var dotGlow = document.createElement('div');
dotGlow.classList.add('bp-dot-glow');

function _deleteFromList(list, item){
	if(list === void 0) return;

	let a = list.indexOf(item);
	if(a !== -1)
		list.splice(a, 1);
}

function _resetCableZIndex(branch, cableList){
	for (var i = 0; i < branch.length; i++) {
		let cable = branch[i];

		cableList.move(cableList.indexOf(cable), 0);

		if(cable.branch !== void 0)
			_resetCableZIndex(cable.branch, cableList);
	}
}

class Cable extends Blackprint.Engine.Cable {
	constructor(obj, port, _unshift=false){
		super(port);
		this._scope = port._scope;

		this.connected = false;
		this.valid = true;
		this.hasBranch = false;
		this.selected = false;
		this._destroyed = false;
		this.beforeConnect = null;

		var container = this._container = port._scope('container');
		this._cablesModel = this._scope('cables');

		var Ofst = container.offset;
		if(obj instanceof Cable){
			this.parentCable = obj;
			obj = {x: obj.head2[0], y: obj.head2[1]};
			_unshift = true;
		}

		let windowless = Blackprint.settings.windowless;

		let x = windowless ? 100 : (obj.x - container.pos.x - Ofst.x) / container.scale;
		let y = windowless ? 100 : (obj.y - container.pos.y - Ofst.y) / container.scale;
		this.linePath = `${x} ${y} ${x} ${y}`;

		this.head1 = this.parentCable ? this.parentCable.head2.slice(0) : [x, y];
		this.head2 = this.head1.slice(0); // Copy on same position

		this.typeName = !port.type ? 'Any' : port.type.name;
		this.source = port.source;

		// Push to cable list
		var list = port._scope('cables').list;

		if(_unshift)
			list.unshift(this);
		else list.push(this);

		this._ownerCableList = list;
		this.moveCableHead = this.moveCableHead.bind(this);
	}

	// Get SVG Path element
	get pathEl(){
		if(Blackprint.settings.windowless) return null;

		if(this._pathEl == null){
			let temp = this._ownerCableList.getElement?.(this);
			if(temp == null) return null;

			this._pathEl = temp.firstElementChild;
		}

		return this._pathEl;
	}

	// ToDo: Improve performance by caching the dotGlow.cloneNode()
	// ToDo: Make the animation more better
	async visualizeFlow(){
		if(this.animating || window.Timeplate === void 0)
			return;

		if(this.pathEl == null) return;
		this.animating = true;

		let cableScope = this._scope('cables');
		var glowContainer = cableScope.$el('.glow-cable');

		await $.afterRepaint();
		if(this.output === void 0 || this._destroyed) return;

		if(cableScope.minimapCableScope !== void 0)
			glowContainer = [...glowContainer, ...cableScope.minimapCableScope.$el('.glow-cable')];

		var anim = this.animPlayer;
		if(anim === void 0){
			anim = this.animPlayer = Timeplate.parallel(1000);
			anim.el = new WeakMap();
		}

		function r(a, b){return Math.round(Math.random()*(b-a)*1000)/1000+a}

		var offsetPath = `path('${this.pathEl.getAttribute('d')}')`;
		var first = {offset: 0, offsetPath, offsetDistance: '1%'};
		var last = {offset: 1, translate: 0, offsetPath, scale: 1, offsetDistance: '100%'};

		// reverse if owner is not the output port
		if(this.owner !== this.output){
			first.offsetDistance = '100%';
			last.offsetDistance = '1%';
		}

		var els = new Array(glowContainer.length);
		for (var z = 0; z < glowContainer.length; z++) {
			var data = anim.el.get(glowContainer[z]);
			if(data === void 0){
				data = [dotGlow.cloneNode(), dotGlow.cloneNode(), dotGlow.cloneNode()];
				anim.el.set(glowContainer[z], data);
			}

			for (var i = 0; i < data.length; i++) {
				var ref = els[i];
				if(ref === void 0)
					ref = els[i] = $(new Array(glowContainer.length));

				ref[z] = data[i];
			}

			$(glowContainer[z]).append(data);
		}

		var timeline = new Array(3); // 3 glow element
		for (var i = 0; i < timeline.length; i++) {
			var keyframes = new Array(4);

			var o = 1/(keyframes.length+3);
			for (var a = 0; a < keyframes.length; a++) {
				keyframes[a] = {
					offset: o*(a+i+1),
					translate: [r(-15, 15)+'px', r(-15, 15)+'px'],
					scale: r(0.5, 1.6),
				};
			}

			keyframes[0].visibility = 'visible';
			keyframes.unshift(first, {offset:0.02, visibility: 'hidden'});
			keyframes.push(last);

			timeline[i] = Timeplate.for(els[i], keyframes, {delay: i*100});
		}

		anim.timeline = timeline;

		// Put on DOM tree and play it
		anim.restart();

		// Remove from DOM tree
		anim.once('finish', ()=> {
			this.animating = false;

			for (var i = 0; i < els.length; i++)
				els[i].remove();
		});

		super.visualizeFlow();
	}

	moveCableHead(ev, single){
		let { _container, branch } = this;
		let { offset: Ofst, pos, scale } = this._container;
		let { hoverPort } = this._cablesModel;

		// Let's make a magnet sensation (fixed position when hovering node port)
		if(!single && hoverPort !== false && (branch == null || branch.length === 0)){
			var center = hoverPort.rect.width/2;
			this.head2 = [
				(hoverPort.rect.x + center - pos.x - Ofst.x) / scale,
				(hoverPort.rect.y + center - pos.y - Ofst.y) / scale
			];

			this.beforeConnect = null;
			this._scope.sketch.emit('port.cable.test', {
				cable: this,
				port: this.owner,
				target: hoverPort.item,
				instance: this._scope.sketch,
				handler: fn => {
					this.beforeConnect = fn;
				}
			});
		}

		// Follow pointer
		else{
			if(!single) {
				this.head2 = [
					(ev.clientX - pos.x - Ofst.x) / scale,
					(ev.clientY - pos.y - Ofst.y) / scale
				];

				_container.moveSelection(ev, this);
			}
			else {
				this.head2[0] += ev.movementX / scale;
				this.head2[1] += ev.movementY / scale;
			}

			this.beforeConnect = null;
		}

		if(branch !== void 0 && branch.length !== 0){
			for (var i = 0; i < branch.length; i++) {
				let _cable = branch[i];
				if(_cable.head1 === this.head2) continue;

				_cable.head1 = this.head2;
			}
		}
	}

	cableHeadClicked(ev, isCreating){
		ev.stopPropagation();

		if(!isCreating && ev.ctrlKey){
			if(Blackprint.settings._remoteSketch){
				var evTemp = { event: ev, type: 'cableHead', cable: this };
				this._scope.sketch.emit('cable.create.branch', evTemp);
			}

			let newCable = this.createBranch(ev);

			if(Blackprint.settings._remoteSketch)
				evTemp.newCable = newCable;

			return newCable;
		}

		var container = this._container;
		var cablesModel = this._cablesModel;

		var Ofst = container.offset;
		var cable = this;

		if(!ev.noMoveListen){
			var elem = cablesModel.list.getElement(cable);

			// Let the pointer pass thru the current svg group
			if(elem !== void 0){
				elem = $(elem);
				elem.css('pointer-events', 'none');
			}

			// Save current cable for referencing when cable connected into node's port
			cablesModel.currentCable = cable;

			var space = $(ev.target.closest('sf-space'));
			space.on('pointermove', this.moveCableHead).once('pointerup', ev => {
				space.off('pointermove', this.moveCableHead);

				// Add delay because it may be used for connecting port
				setTimeout(function(){
					cablesModel.currentCable = void 0;
				}, 100);

				if(elem !== void 0)
					elem.css('pointer-events', '');

				this._scope.sketch.emit('cable.dropped', {
					event: ev,
					port: cable.owner,
					cable,
					afterCreated: isCreating
				});
			});
		}

		if(isCreating){
			cable.head2 = [
				(ev.clientX - container.pos.x - Ofst.x) / container.scale,
				(ev.clientY - container.pos.y - Ofst.y) / container.scale
			];
		}

		if(ev.pointerType === 'touch') this._touchCable(ev);
	}

	cablePathClicked(ev){
		if(!ev.ctrlKey && !this._clicked){
			this._clicked = true
			setTimeout(()=> this._clicked = void 0, 400);
			return;
		}

		if(Blackprint.settings._remoteSketch){
			var evTemp = { event: ev, type: 'cablePath', cable: this };
			this._scope.sketch.emit('cable.create.branch', evTemp);
		}

		let current = this;

		let cable, assignPosFor;
		if(!current.hasBranch){
			if(current.parentCable !== void 0){
				// Remove from old branch
				let parentBranch = current.parentCable.branch;
				parentBranch.splice(parentBranch.indexOf(current), 1);

				// Create new branch from the parent
				cable = current.parentCable.createBranch();
				cable.createBranch(void 0, current);

				// Make this as the selected cable
				current = cable;

				_resetCableZIndex(current.branch, this._scope('cables').list);
			}
			else{
				cable = current.createBranch();

				cable.cableTrunk = current;
				current._allBranch.push(current);
				current._inputCable.push(cable);

				if(current.input != null){
					// Swap from input port
					let list = current.input.cables;
					list[list.indexOf(current)] = cable;

					cable.target = cable.input = current.input;
					current.target = current.input = void 0;

					// Put it on output port
					current.output.cables.push(cable);
				}

				cable.connected = current.connected;
				cable.parentCable = current;
				current.connected = false;
				current.hasBranch = true;

				assignPosFor = cable.head1;
			}
		}
		else{
			if(current.branch == null || current.branch.length === 0){
				cable = current.parentCable.createBranch();

				let parentBranch = current.parentCable.branch;
				parentBranch[parentBranch.indexOf(current)] = cable;

				cable.branch = [current];
				current = cable;

				current.parentCable = cable;
				assignPosFor = cable.head1;
			}
			else{
				cable = current.createBranch();
				current.branch.pop();

				let branch = cable.branch = current.branch;
				for (var i = 0; i < branch.length; i++) {
					branch[i].parentCable = cable;
				}

				cable.hasBranch = true;
				current.branch = [cable];

				_resetCableZIndex(current.branch, this._scope('cables').list);
				assignPosFor = cable.head1;
			}
		}

		current.cableHeadClicked({
			stopPropagation(){ev.stopPropagation()},
			type: ev.type,
			noMoveListen: ev.noMoveListen,
			pointerType: ev.pointerType,
			target: current.pathEl,
			clientX: ev.clientX,
			clientY: ev.clientY,
		}, true);

		if(Blackprint.settings._remoteSketch)
			evTemp.newCable = current;

		// Don't use Object.assign
		if(assignPosFor !== void 0){
			let temp = current.head2;
			let temp2 = assignPosFor;
			temp2[0] = temp[0];
			temp2[1] = temp[1];
		}
	}

	createBranch(ev, cable){
		if(this.source !== 'output' || this.isRoute)
			throw new Error("Cable branch currently can only be created from output port");

		this.hasBranch = true;
		this.cableTrunk ??= this;
		this.branch ??= [];

		this._allBranch ??= []; // All cables reference
		this._inputCable ??= []; // All input port IFace reference

		let newCable = cable || new Cable(this, this.owner);
		newCable._allBranch = this._allBranch; // copy reference
		newCable._inputCable = this._inputCable; // copy reference
		newCable.cableTrunk = this.cableTrunk; // copy reference

		if(this.source === 'output')
			this.output = newCable.output = this.owner;

		this._allBranch.push(newCable);
		this.branch.push(newCable);
		newCable.parentCable = this;

		if(ev !== void 0)
			newCable.cableHeadClicked(ev, true);

		return newCable;
	}

	_touchCable(oldEv){
		let lastEl = null;
		function hoverSimulate(ev){
			let touch = ev.touches[0];
			let el = document.elementFromPoint(touch.clientX, touch.clientY);

			if(lastEl === el) return;
			if(lastEl !== null)
				$(lastEl).trigger('pointerout');

			lastEl = el;
			$(el).trigger('pointerover');
		}

		let port = this.owner;
		port._ignoreConnect = true;

		let container = this._scope('container');
		let cable = this;
		container.$el.on('touchmove', hoverSimulate).once('pointerup', function(ev){
			container.$el.off('touchmove', hoverSimulate);

			let hovered = container.cableScope.hoverPort;
			if(hovered !== false){
				if(hovered.item === port)
					cable._delete();
				else
					hovered.item.connectCable(cable);

				container.cableScope.hoverPort = false;
			}
			else {
				if(Math.abs(oldEv.clientX - ev.clientX) < 100
				   && Math.abs(oldEv.clientY - ev.clientY) < 100){
					cable._delete();
				}
			}

			setTimeout(()=> {
				port._ignoreConnect = void 0;
			}, 500);
		});
	}

	_connected(){
		super._connected();

		if(this._allBranch !== void 0){
			if(this.source === 'input'){ // This may never be called for now
				// Sync output port to every branch
				/*let cables = this._allBranch;
				for (var i = cables.length-1; i >= 0; i--) {
					let cable = cables[i];
					cable.output = this.output;
				}*/

				throw new Error("Not implemented");
			}

			this._inputCable.push(this);
			this.cableTrunk.output.cables.push(this);
		}
	}

	_delete(isDeep){
		if(Blackprint.settings._remoteSketch && !isDeep)
			this._scope.sketch.emit('cable.deleted', {cable:this});

		if(this.hasBranch){
			let branch = this.branch;
			for (var i = branch.length-1; i >= 0; i--)
				branch[i]._delete(true);
		}

		_deleteFromList(this._scope('cables').list, this);
		_deleteFromList(this._inputCable, this);
		_deleteFromList(this._allBranch, this);

		if(this.output !== void 0)
			_deleteFromList(this.output.cables, this);

		if(this.parentCable !== void 0){
			let branch = this.parentCable.branch;
			let i = branch.indexOf(this);

			if(i !== -1)
				branch.splice(i, 1);
		}

		if(this.input !== void 0)
			_deleteFromList(this.input.cables, this);

		if(isDeep && this._destroyed === false)
			super.disconnect();
	}

	cableMenu(ev){
		ev.stopPropagation();
		let cable = this;
		let scope = cable._scope;

		let suggestedNode;
		if(this.target === void 0){
			let owner = this.owner;
			suggestedNode = Blackprint.Sketch.suggestNodeForPort(owner);

			if(ev.ctrlKey) return suggestNode();
		}

		function suggestNode(){
			let menu = createNodesMenu(suggestedNode, scope.sketch, ev);
			scope('dropdown').show(menu, {x: ev.clientX, y: ev.clientY, event: ev});
		}

		let {owner, target} = cable;
		let menu = [{
			title: target ? "Disconnect" : "Delete",
			callback(){cable.disconnect()},
			hover(){
				owner.iface.$el.addClass('highlight');

				if(target)
					target.iface.$el.addClass('highlight');
			},
			unhover(){
				owner.iface.$el.removeClass('highlight');

				if(target)
					target.iface.$el.removeClass('highlight');
			}
		}];

		if(target === void 0 && !this.isRoute){
			menu.push({
				title: "Suggested Node",
				callback(){ setTimeout(suggestNode, 220) },
			});
		}

		if(cable.branch !== void 0 && cable.branch.length === 1){
			menu.push({
				title: "Merge cable",
				callback(){
					let child = cable.branch[0];
					child.cableTrunk = child;
					child.head1 = cable.head1;

					if(cable.parentCable !== void 0){
						let branch = cable.parentCable.branch;
						branch[branch.indexOf(cable)] = child;
						child.parentCable = cable.parentCable;
					}
					else {
						let cables = cable.output.cables;

						if(cables.includes(child) === false)
							cables[cables.indexOf(cable)] = child;

						child.parentCable = void 0;
					}

					cable.branch = [];
					cable._delete();
				},
			});
		}

		scope('dropdown').show(menu, {x: ev.clientX, y: ev.clientY, event: ev});
	}

	disconnect(){
		super.disconnect();
		this._destroyed = true;
		this._delete();

		// console.log('A cable was removed', this);
	}
}