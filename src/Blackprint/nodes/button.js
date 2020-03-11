Space.component('button-node', {
	extend: Blackprint.Trigger,
	template: 'Blackprint/nodes/button.html'
}, function(self, root){
	// Property of this scope
	/* self == {
		x: 0,
		y: 0,
		inputs: [],
		outputs: [],
		properties: [],
	} */

	self.run = function(){
		console.log('yosh');
	}
});