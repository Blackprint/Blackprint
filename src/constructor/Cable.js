var dotGlow = document.createElement('div');
dotGlow.classList.add('bp-dot-glow');

class Cable extends Blackprint.Engine.Cable{
	constructor(obj, port){
		super(port);
		this._scope = port._scope;

		this.connected = false;
		this.valid = true;
		this.linePath = '0 0 0 0';

		var container = port._scope('container');
		var Ofst = container.offset;

		this.head1 = [
			(obj.x - container.pos.x - Ofst.x) / container.scale,
			(obj.y - container.pos.y - Ofst.y) / container.scale
		];

		this.head2 = [
			(obj.x - container.pos.x - Ofst.x) / container.scale,
			(obj.y - container.pos.y - Ofst.y) / container.scale
		];

		this.type = !port.type ? 'Any' : port.type.name
		this.source = port.source;

		// Push to cable list
		var list = port._scope('cables').list;
		list.push(this);

		// Get SVG Path element
		this.pathEl = list.getElement(this).firstElementChild;
	}

	visualizeFlow(){
		if(this.animating || window.Timeplate === void 0)
			return;

		this.animating = true;
		let cableScope = this._scope('cables');
		var glowContainer = cableScope.$el('.glow-cable');

		if(cableScope.minimapCableScope !== void 0)
			glowContainer = [glowContainer, ...cableScope.minimapCableScope.$el('.glow-cable')];

		var anim = this.animPlayer;
		if(anim === void 0){
			anim = this.animPlayer = Timeplate.parallel(1000);
			anim.el = new WeakMap();
		}

		function r(a, b){return Math.round(Math.random()*(b-a)*1000)/1000+a}

		var offsetPath = `path('${this.pathEl.getAttribute('d')}')`;
		var first = {offset:0, offsetPath, offsetDistance:'1%'};
		var last = {offset: 1, translate: 0, offsetPath, scale: 1, offsetDistance: '100%'};

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
		var that = this;
		anim.once('finish', function(){
			that.animating = false;

			for (var i = 0; i < els.length; i++)
				els[i].remove();
		});
	}

	cableHeadClicked(ev, isCreating){
		ev.stopPropagation();

		var container = this._scope('container');
		var cablesModel = this._scope('cables');

		var Ofst = ev.target.closest('sf-space').getBoundingClientRect();
		var cable = this;

		function moveCableHead(ev){
			// Let's make a magnet sensation (fixed position when hovering node port)
			if(cablesModel.hoverPort !== false){
				var center = cablesModel.hoverPort.rect.width/2;
				cable.head2 = [
					(cablesModel.hoverPort.rect.x+center - container.pos.x - Ofst.x) / container.scale,
					(cablesModel.hoverPort.rect.y+center - container.pos.y - Ofst.y) / container.scale
				];
			}

			// Follow pointer
			else cable.head2 = [
				(ev.clientX - container.pos.x - Ofst.x) / container.scale,
				(ev.clientY - container.pos.y - Ofst.y) / container.scale
			];
		}

		var elem = cablesModel.list.getElement(cable);

		// Let the pointer pass thru the current svg group
		if(elem !== void 0){
			elem = $(elem);
			elem.css('pointer-events', 'none');
		}

		// Save current cable for referencing when cable connected into node's port
		cablesModel.currentCable = cable;

		var space = $(ev.target.closest('sf-space'));
		space.on('pointermove', moveCableHead).once('pointerup', function(ev){
			space.off('pointermove', moveCableHead);

			// Add delay because it may be used for connecting port
			setTimeout(function(){
				cablesModel.currentCable = void 0;
			}, 100);

			if(elem !== void 0)
				elem.css('pointer-events', '');
		});

		if(isCreating){
			cable.head2 = [
				(ev.clientX - container.pos.x - Ofst.x) / container.scale,
				(ev.clientY - container.pos.y - Ofst.y) / container.scale
			];
		}
	}

	cableMenu(ev){
		ev.stopPropagation();

		this._scope('dropdown').show([{
			title:this.target ? "Disconnect" : "Delete",
			context:this,
			callback:Cable.prototype.destroy,
			hover(){
				this.owner.iface.$el.addClass('highlight');

				if(this.target)
					this.target.iface.$el.addClass('highlight');
			},
			unhover(){
				this.owner.iface.$el.removeClass('highlight');

				if(this.target)
					this.target.iface.$el.removeClass('highlight');
			}
		}], {x: ev.clientX, y: ev.clientY});
	}

	destroy(){
		var list = this._scope('cables').list;

		// Remove from cable list
		list.splice(list.indexOf(this), 1);
		Blackprint.Engine.Cable.prototype.destroy.call(this);

		// console.log('A cable was removed', this);
	}
}