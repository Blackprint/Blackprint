Space.model('dropdown', function(self){
	self.menus = [];
	self.onCancel = void 0;

	// options: [{title, callback}, {title, deep:[{...}]}, ...]
	self.show = function(options, x, y){
		// Remove last dropdown if haven't been closed
		if(self.menus.length !== 0)
			self.menus.splice(0);
		else
			manageBackdrop(true);

		// options.event == currentEvent

		options.x = x;
		options.y = y;
		self.menus.push(options);

		return self;
	}

	self.hide = function(){
		for (var i = 0; i < self.menus.length; i++)
			self.menus.getElement(i).model.deepRemove();

		self.menus.splice(0);
	}

	var backdropCreated = false;
	function backdropListener(ev){
		if($(ev.target).parent('sf-m')[0] === self.$el[0])
			return;

		backdropCreated = false;

		self.hide();
		$(sf.window).off('click', backdropListener);
		self.onCancel && self.onCancel();
	}

	function manageBackdrop(isAdd){
		setTimeout(function(){
			if(isAdd){
				if(!backdropCreated){
					$(sf.window).on('click', backdropListener);
					backdropCreated = true;
				}
			}
			else{
				$(sf.window).off('click', backdropListener);
				backdropCreated = false;
			}
		}, 10);
	}
});