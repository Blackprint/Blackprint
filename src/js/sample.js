$(function(){
	var sketch = window.sketch = new Blackprint();

	sketch.registerNode('math/multiply', function(self){
		window.self = self; // debug test

		self.title = "Multiply";
		var inputs = self.inputs = {
			A:Number,
			B:function(val){
				console.log('node B got input:', val);
				return Number(val);
			}
		};

		var outputs = self.outputs = {
			Result:Number
		};

		// When executing node
		self.run = function(){
			console.log('processing', inputs.A, inputs.B);
			outputs.Result = inputs.A * inputs.B;
		}
	});

	sketch.registerNode('math/random', function(self){
		self.title = "Random";
		self.description = "Number (0-100)";
		self.dynamic = true; // Reexecute when doing loop somewhere

		var outputs = self.outputs = {
			Out:Number
		};

		// When executing node
		self.run = function(){
			console.log('processing', inputs.A, inputs.B);
			outputs.Result = inputs.A * inputs.B;
		}
	});

	sketch.registerNode('console/logger', function(self){
		self.title = "Logger";

		var inputs = self.inputs = {
			Log:console.log,
			Warn:console.warn,
			Error:console.error
		};
	});

	sketch.registerNode('dummy/test', function(self){
		self.title = "Test 1";

		var inputs = self.inputs = {
			"Input 1":Boolean,
			"Input 2":String
		};

		var outputs = self.outputs = {
			"Output 1":Object,
			"Output 2":Number
		};

		var properties = self.properties = {
			"Property 1":Boolean,
			"Property 2":Number
		};
	});

	$(function(){
		setTimeout(function(){
			sketch.createNode('dummy/test', {x:252, y:103});
			sketch.createNode('math/random', {x:530, y:122});
			sketch.createNode('math/multiply', {x:730, y:110});
			sketch.createNode('console/logger', {x:531, y:237});
		}, 500);
	});
});