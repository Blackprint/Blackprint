Space.model('container', function(self, root){
	self.cableScope = root('cables');
	self.nodeScope = root('nodes');

	function onlyNegative(old, now){
		if(now > 0) return 0;
	}

	self.pos = {x:0, y:0,
		// Because origin is top left, viewport height and width are increased on bottom right
		// Force to zero if there are no more space to be panned on left side
		on$x: onlyNegative, on$y: onlyNegative
	};

	self.scale = 1;
	self.size = {w:0, h:0};
	self.origSize = {w:0, h:0};
	self.offset;

	self.init = function(){
		self.resetOffset();
		self.size.w = self.offset.width;
		self.size.h = self.offset.height;
	}

	self.resetOffset = function(){
		self.$el.css({
			width:'100%',
			height:'100%'
		});

		self.offset = self.$el[0].getBoundingClientRect();
		self.origSize.w = self.offset.width;
		self.origSize.h = self.offset.height;
	}

	function moveContainer(ev){
		if(!(self.pos.x >= 0 && ev.movementX > 0)){
			self.size.w -= ev.movementX;
			self.pos.x += ev.movementX;
		}

		if(!(self.pos.y >= 0 && ev.movementY > 0)){
			self.size.h -= ev.movementY;
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

		var delta = ev.deltaY/100 * 0.08;
		self.scale -= delta;

		// ToDo: fix scaling, should scale with cursor as the middle scaling position
		self.pos.x += ev.clientX * delta;
		self.pos.y += ev.clientY * delta;

		// self.pos will always negative or zero value
		// hint on the object declaration

		self.size.w = self.origSize.w / self.scale - self.pos.x;
		self.size.h = self.origSize.h / self.scale - self.pos.y;
	}
});