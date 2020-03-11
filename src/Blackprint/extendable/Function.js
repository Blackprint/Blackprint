;(function(){
var root = Blackprint.space.scope;

class Function extends Blackprint.Node{
	static init(){
	}

	run(){
		console.error("The trigger handler doesn't have `run` method");
	}
}

Blackprint.Function = Function;
})();