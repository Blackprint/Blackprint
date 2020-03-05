var ground = sf.views('vw-ground', 'ground');
ground.addRoute([
	{
	    path:'/',
	    template:'vw-ground/blackprint',

	    // Nested router for vw-sketch
	    'vw-sketch':[{
	    	path:'/page/:pageIndex',
	    	template:'Blackprint/page', // Import blackprint page
	    }]
	}, {
	    path:'/getting-started',
	    template:'vw-ground/getting-started'
	},
]);

// Increase views limit from 3 into 100
ground.maxCache = 100;

ground.on('routeFinish routeCached', function(){
	animatePageTransition(ground);
});

ground.on('routeError', function(e){
	console.warn(e);
});