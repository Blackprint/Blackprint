class Cable{
	constructor(obj){
		var container = Blackprint.space.scope('container');
		var Ofst = container.offset;

		this.head1 = [
			(obj.x - container.pos.x) / container.scale + (Ofst.x + -Ofst.x/container.scale),
			(obj.y - container.pos.y) / container.scale + (Ofst.y + -Ofst.y/container.scale)
		];

		this.head2 = [
			(obj.x - container.pos.x) / container.scale + (Ofst.x + -Ofst.x/container.scale),
			(obj.y - container.pos.y) / container.scale + (Ofst.y + -Ofst.y/container.scale)
		];

		this.type = obj.type;
		this.source = obj.source;
		this.valid = true;
		this.linePath = '0 0 0 0';

		// Cable connection, this will save the port
		this.owner = void 0; // head1
		this.target = void 0; // head2

		// Push to cable list
		Blackprint.space.scope('cables').list.push(this);
	}

	static visualizeFlow(cable){
		var el = Blackprint.space.scope('cables').list.getElement(cable);
		var className;

		if(cable.owner.source === 'outputs'){
			if(cable.head1[0] < cable.head2[0])
				className = 'line-flow';
			else className = 'line-flow-reverse';
		}
		else if(cable.owner.source === 'inputs'){
			if(cable.head1[0] > cable.head2[0])
				className = 'line-flow';
			else className = 'line-flow-reverse';
		}

		el.classList.add(className);
		setTimeout(function(){
			el.classList.remove(className);
		}, 1000);
	}

	destroy(){
		// Remove from cable owner
		if(this.owner){
			var i = this.owner.cables.indexOf(this);
			if(i !== -1)
				this.owner.cables.splice(i, 1);

			this.owner.node._trigger('cable.disconnect', this.target);
		}

		// Remove from connected target
		if(this.target){
			var i = this.target.cables.indexOf(this);
			if(i !== -1)
				this.target.cables.splice(i, 1);

			this.target.node._trigger('cable.disconnect', this.owner);
		}

		var list = Blackprint.space.scope('cables').list;

		// Remove from cable list
		list.splice(list.indexOf(this), 1);
		console.log('A cable was removed', this);
	}
}