Space.component('logger-node', {
	extend: Blackprint.Function,
	template: 'Blackprint/nodes/logger.html'
}, function(self, root){
	// Property of this scope
	/* self == {
		x: 0,
		y: 0,
		inputs: [],
		outputs: [],
		properties: [],
	} */

	self.log = '...';
});