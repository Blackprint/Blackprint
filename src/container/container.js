Space.model('container', function(My, include){
	My.cableScope = include('cables');
	My.nodeScope = include('nodes');

	function onlyNegative(now){
		if(now > 0) return 0;
	}

	My.pos = {x:0, y:0,
		// Because origin is top left, viewport height and width are increased on bottom right
		// Force to zero if there are no more space to be panned on left side
		on$x: onlyNegative, on$y: onlyNegative
	};

	My.scale = 1;
	My.size = {w:0, h:0};
	My.origSize = {w:0, h:0};
	My.offset;

	My.init = async function(){
		await My.resetOffset();
		My.size.w = My.offset.width;
		My.size.h = My.offset.height;
	}

	My.resetOffset = async function(){
		My.$el.css({
			width:'100%',
			height:'100%'
		});

		await $.afterRepaint();
		My.offset = My.$el[0].getBoundingClientRect();
		My.origSize.w = My.offset.width;
		My.origSize.h = My.offset.height;
	}

	function moveContainer(ev){
		if(!(My.pos.x >= 0 && ev.movementX > 0)){
			My.size.w -= ev.movementX;
			My.pos.x += ev.movementX;
		}

		if(!(My.pos.y >= 0 && ev.movementY > 0)){
			My.size.h -= ev.movementY;
			My.pos.y += ev.movementY;
		}
	}

	My.moveContainer = function(ev){
		My.$el.on('pointermove', moveContainer);

		$(sf.Window).once('pointerup', function(){
			My.$el.off('pointermove', moveContainer);
		});
	}

	// My.onScale = callback

	My.scaleContainer = function(ev){
		if(ev.deltaY > 0 && My.scale < 0.21)
			return;

		if(ev.deltaY < 0 && My.scale > 1.98)
			return;

		var delta = ev.deltaY/100 * 0.08;
		My.scale -= delta;

		// ToDo: fix scaling, should scale with cursor as the middle scaling position
		My.pos.x += Math.round(ev.clientX * delta);
		My.pos.y += Math.round(ev.clientY * delta);

		// My.pos will always negative or zero value
		// hint on the object declaration

		My.size.w = My.origSize.w / My.scale - My.pos.x;
		My.size.h = My.origSize.h / My.scale - My.pos.y;

		My.onScale && My.onScale(My.scale);
	}
});