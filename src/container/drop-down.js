Space.component('drop-down', {template:"Blackprint/container/drop-down.html"}, function(self, root, $item){
	self.visible = false;

	self.options = $item;
	self.x = $item.x;
	self.y = $item.y;

	var currentDeepLevel;
	self.init = function(){
		var el = sf.Window.source(self.$el, $item.event);
		if(el === null) return;
		var $el = $(el);

		// Check position when the element rendered
		requestAnimationFrame(function(){
			var elem = $el[0].firstElementChild;

			if(self.x + elem.offsetWidth > window.innerWidth)
				self.x -= elem.offsetWidth;

			if(self.y + elem.offsetHeight > window.innerHeight)
				self.y -= elem.offsetHeight;
		});

		self.visible = true;

		// Find nested options and add event listener on mouse hover
		var options = self.options;
		for (var i = 0; i < options.length; i++) {
			let opt = options[i];

			if(opt.deep !== void 0){
				$(options.getElements(i)).on('mouseover', function(ev){
					if(currentDeepLevel !== void 0)
						self.deepRemove();

					if(opt.hover !== void 0)
						opt.hover.apply(opt.context, opt.args);

					var deep = opt.deep;
					deep.event = ev;

					// Use the cache instead
					if(deep.el !== void 0){
						currentDeepLevel = deep.el;
						$el.append(deep.el);
						return;
					}

					// Initialize position once
					var rect = ev.target.getBoundingClientRect();
					deep.x = rect.left + rect.width;
					deep.y = rect.top - rect.height/2 + 7;

					deep.el = currentDeepLevel = new $DropDown(deep, Blackprint.space);
					$el.append(currentDeepLevel);
				});

				continue;
			}

			if(!opt.callback && !opt.hover && !opt.unhover)
				continue;

			var elem = $(options.getElements(i));
			if(opt.callback){
				elem.on('click', function(ev){
					if(opt.unhover !== void 0)
						opt.unhover.apply(opt.context, opt.args);

					opt.callback.apply(opt.context, opt.args);
					root('dropdown').hide();
				});
			}

			if(opt.hover){
				elem.on('mouseover', function(ev){
					opt.hover.apply(opt.context, opt.args);
				});
			}

			if(opt.unhover){
				elem.on('mouseout', function(ev){
					opt.unhover.apply(opt.context, opt.args);
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