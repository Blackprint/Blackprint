Space.component('comp-port-input', {
	template: 'Blackprint/component/port-input.html'
}, function(self, root){
	var whichBind = self.which;
	self.default = self.obj[whichBind];

	self.v2m$default = self.whenChanged || function(now){
		self.obj[whichBind] = now;
	}

	self.click = function(ev){
		ev.stopPropagation();
	}
});