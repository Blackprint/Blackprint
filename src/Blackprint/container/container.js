Space.model('container', function(self, root){
	self.cableScope = root('cables');
	self.nodeScope = root('nodes');

	self.multiplier = 1;
	self.scale = 1;

	self.pos = {x:0, y:0};
	self.size = {w:window.innerWidth, h:window.innerHeight};
	self.origSize = {w:self.size.w, h:self.size.h};

	function moveContainer(ev){
		if(!(self.pos.x >= 0 && ev.movementX > 0)){
			self.size.w -= ev.movementX;
			self.origSize.w = self.size.w;
			self.pos.x += ev.movementX;
		}

		if(!(self.pos.y >= 0 && ev.movementY > 0)){
			self.size.h -= ev.movementY;
			self.origSize.h = self.size.h;
			self.pos.y += ev.movementY;
		}
	}

	self.moveContainer = function(ev){
		self.$el.on('pointermove', moveContainer).on('pointerup', function(){
			self.$el.off('pointermove', moveContainer);
		});
	}

	self.scaleContainer = function(ev){
		if(ev.deltaY > 0 && self.scale <= 0.2)
			return;

		if(ev.deltaY < 0 && self.scale >= 2)
			return;

		var delta = ev.deltaY/1000;
		self.scale -= delta;

		// ToDo: fix movement speed when moving nodes
		self.multiplier += delta;

		if(ev.deltaY < 0 && self.size <= 100)
			return;

		self.size.w = self.origSize.w / self.scale;
		self.size.h = self.origSize.h / self.scale;
	}
});