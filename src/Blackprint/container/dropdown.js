Space.model('dropdown', function(self){
	self.visible_ = false;
	self.posX = 0;
	self.posY = 0;
	self.options = []; // {i:, title:}

	var callback = [];
	self.content = function(obj){ // [[{title, callback}, {title, callback}, ...], ...]
		callback.length = 0;
		self.options.splice(0);

		if(obj[0].constructor === Object)
			obj = [obj];

		for (var i = 0; i < obj.length; i++) {
			var temp = obj[i];

			for (var a = 0; a < temp.length; a++) {
				self.options.push({i:callback.length, title:temp[a].title});
				callback.push(temp[a]);
			}
		}

		return self;
	}

	function backdropListener(ev){
		if($(ev.target).parent('sf-m')[0] === self.$el[0]){
			try{
				self.clicked(sf.model.index(ev.target));
			}catch(e){
				console.log(e, ev.target, ev);
			}

			if($(ev.target).hasClass('.divider'))
				return;
		}

		self.visible_ = false;
		backdropCreated = false;
		callback.length = 0;

		self.onCancel && self.onCancel();
	}

	self.show = function(x, y){
		var elem = self.$el[0].firstElementChild;

		self.visible(true);

		if(x + elem.offsetWidth > window.innerWidth)
			x -= elem.offsetWidth;

		if(y + elem.offsetHeight > window.innerHeight)
			y -= elem.offsetHeight;

		// subtract the margin/padding
		self.posX = x - 2;
		self.posY = y - 9;
	}

	var backdropCreated = false;
	self.visible = function(condition){
		setTimeout(function(){
			if(condition){
				if(!backdropCreated){
					$('body').once('click', backdropListener);
					backdropCreated = true;
				}
			}
			else{
				$('body').off('click', backdropListener);
				backdropCreated = false;
			}
		}, 10);

		self.visible_ = condition;
	}

	self.clicked = function(i){
		callback[i].callback && callback[i].callback(callback[i].ref);
		callback.length = 0;
	}
});