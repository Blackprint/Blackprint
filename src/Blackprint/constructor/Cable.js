class Cable extends Blackprint.Interpreter.Cable{
	connected = false;
	valid = true;
	linePath = '0 0 0 0';

	#scope;
	constructor(obj, port){
		super(port);
		this.#scope = port._scope;

		var container = port._scope('container');
		var Ofst = container.offset;

		this.head1 = [
			(obj.x - container.pos.x) / container.scale + (Ofst.x + -Ofst.x/container.scale),
			(obj.y - container.pos.y) / container.scale + (Ofst.y + -Ofst.y/container.scale)
		];

		this.head2 = [
			(obj.x - container.pos.x) / container.scale + (Ofst.x + -Ofst.x/container.scale),
			(obj.y - container.pos.y) / container.scale + (Ofst.y + -Ofst.y/container.scale)
		];

		this.type = !port.type ? 'Any' : port.type.name
		this.source = port.source;

		// Push to cable list
		port._scope('cables').list.push(this);
	}

	visualizeFlow(){
		var el = $(this.#scope('cables').list.getElement(this));
		var className;

		if(this.owner.source === 'outputs'){
			if(this.head1[0] < this.head2[0])
				className = 'line-flow';
			else className = 'line-flow-reverse';
		}
		else if(this.owner.source === 'inputs'){
			if(this.head1[0] > this.head2[0])
				className = 'line-flow';
			else className = 'line-flow-reverse';
		}

		if(this._timer === void 0)
			this.#scope('container').showCableAnim();

		el.addClass(className);
		clearTimeout(this._timer);

		var that = this;
		this._timer = setTimeout(function(){
			that._timer = void 0;

			el.removeClass(className);
			that.#scope('container').hideCableAnim();
		}, 1000);
	}

	cableHeadClicked(ev){
		var container = this.#scope('container');
		var cablesModel = this.#scope('cables');

		var Ofst = container.offset;
		var cable = this;

		function moveCableHead(ev){
			// Let's make a magnet sensation (fixed position when hovering node port)
			if(cablesModel.hoverPort !== false){
				var center = cablesModel.hoverPort.rect.width/2;
				cable.head2 = [
					(cablesModel.hoverPort.rect.x+center - container.pos.x) / container.scale + (Ofst.x + -Ofst.x/container.scale),
					(cablesModel.hoverPort.rect.y+center - container.pos.y) / container.scale + (Ofst.y + -Ofst.y/container.scale)
				];
			}

			// Follow pointer
			else cable.head2 = [
				(ev.clientX - container.pos.x) / container.scale + (Ofst.x + -Ofst.x/container.scale),
				(ev.clientY - container.pos.y) / container.scale + (Ofst.y + -Ofst.y/container.scale)
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

		var space = $(elem).parent('sf-space');
		space.on('pointermove', moveCableHead).once('pointerup', function(ev){
			space.off('pointermove', moveCableHead);

			// Add delay because it may be used for connecting port
			setTimeout(function(){
				cablesModel.currentCable = void 0;
			}, 100);

			if(elem !== void 0)
				elem.css('pointer-events', '');
		});
	}

	cableMenu(ev){
		ev.stopPropagation();

		this.#scope('dropdown').show([{
			title:this.target ? "Disconnect" : "Delete",
			context:this,
			callback:Cable.prototype.destroy,
			hover:function(){
				this.owner.iface.$el.addClass('highlight');

				if(this.target)
					this.target.iface.$el.addClass('highlight');
			},
			unhover:function(){
				this.owner.iface.$el.removeClass('highlight');

				if(this.target)
					this.target.iface.$el.removeClass('highlight');
			}
		}], ev.clientX, ev.clientY);
	}

	destroy(){
		var list = this.#scope('cables').list;

		// Remove from cable list
		list.splice(list.indexOf(this), 1);
		// console.log('A cable was removed', this);

		Blackprint.Interpreter.Cable.prototype.destroy.call(this);
	}
}