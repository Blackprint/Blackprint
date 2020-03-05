// https://www.npmjs.com/package/scarletsframe#initializedefine-model
sf.model.for('header', function(self, root){
	self.message = "Hello";
	self.description = "Developers! ";

	self.init = function(){
		setTimeout(function(){
			if(sf.url.hashes.ground === '/')
				textAnimation("Let's getting started!");
			else{
				self.description = '';
				textAnimation("Welcome to the workspace!");
			}
		}, 2000);
	}

	self.toWorkspace = function(){
		ground.goto('/page/1');

		self.description = '';
		textAnimation("Welcome to the workspace!");
	}

	function textAnimation(text){
		var description = text.split('');

		// Text animation
		var interval = setInterval(function(){
			self.description += description.shift();

			if(description.length === 0)
				clearInterval(interval);
		}, 50);
	}
});