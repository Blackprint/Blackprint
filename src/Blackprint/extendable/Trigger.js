;(function(){
var root = Blackprint.space.scope;

class Trigger extends Blackprint.Node{
	static init(){
		root('nodes').trigger.push(this);
	}

	run(){
		console.error("The trigger handler doesn't have `run` method");
	}
}

Blackprint.Trigger = Trigger;
})();