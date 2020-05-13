Space.component('drop-down', {template:"Blackprint/container/drop-down.html"}, function(self, root, $item){
	self.visible = false;

	self.options = $item;
	self.x = $item.x;
	self.y = $item.y;

	var currentDeepLevel;
	self.init = function(){
		var elem = self.$el[0].firstElementChild;

		if(self.x + elem.offsetWidth > window.innerWidth)
			self.x -= elem.offsetWidth;

		if(self.y + elem.offsetHeight > window.innerHeight)
			self.y -= elem.offsetHeight;

		self.visible = true;

		// Find nested options and add event listener on mouse hover
		var options = self.options;
		for (let i = 0; i < options.length; i++) {
			if(options[i].deep !== void 0){
				$(options.getElement(i)).on('mouseover', function(ev){
					if(currentDeepLevel !== void 0)
						self.deepRemove();

					if(options[i].hover !== void 0)
						options[i].hover.apply(options[i].context, options[i].args);

					var deep = options[i].deep;

					// Use the cache instead
					if(deep.el !== void 0){
						currentDeepLevel = deep.el;
						self.$el.append(deep.el);
						return;
					}

					// Initialize position once
					var rect = ev.target.getBoundingClientRect();
					deep.x = rect.left + rect.width;
					deep.y = rect.top - rect.height/2 + 7;

					deep.el = currentDeepLevel = new $DropDown(deep, Blackprint.space);
					self.$el.append(currentDeepLevel);
				});

				continue;
			}

			var elem = $(options.getElement(i));

			if(options[i].callback){
				elem.on('click', function(ev){
					if(options[i].unhover !== void 0)
						options[i].unhover.apply(options[i].context, options[i].args);

					options[i].callback.apply(options[i].context, options[i].args);
					root('dropdown').hide();
				});
			}

			if(options[i].hover){
				elem.on('mouseover', function(ev){
					options[i].hover.apply(options[i].context, options[i].args);
				});
			}

			if(options[i].unhover){
				elem.on('mouseout', function(ev){
					options[i].unhover.apply(options[i].context, options[i].args);
				});
			}
		}
	}

	self.deepRemove = function(){
		if(currentDeepLevel === void 0)
			return;

		currentDeepLevel.remove();
		currentDeepLevel.model.deepRemove();
	}
});