Space.model('container', function(My, include){
	let spaceID = My.$space.id;

	if(My.isMinimap = spaceID.includes('+mini')){
		let mainSpace = Blackprint.space.list[spaceID.replace('+mini', '')];
		My.minimapSource = mainSpace('container');
	}

	My.cableScope = include('cables');
	My.nodeScope = include('nodes');
	My._isImporting = false;

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

	My.config = {
		move: true,
		scale: true
	};

	// Check if this categorized as minimap from the sf.Space id
	// If yes, then make it auto scale on width/height changes
	if(My.isMinimap){
		My.minimapSource.cableScope.minimapCableScope = My.cableScope;
		My.minimapSource.onNodeMove = function(e){
			if(e.type === "pointerup")
				recalculateScale();
		};

		My.config.move = false;
		My.config.scale = false;
	}

	function recalculateScale(){
		let nodes = My.nodeScope.list;
		let maxX = 0, maxY = 0;
		let W = 0, H = 0;

		for (var i = 0; i < nodes.length; i++) {
			let node = nodes[i];
			if(maxX < node.x){
				maxX = node.x;
				W = node.w;
			}

			if(maxY < node.y){
				maxY = node.y;
				H = node.h;
			}
		}

		maxX += W + 50;
		maxY += H + 50;

		My.size.w = maxX;
		My.size.h = maxY;

		let A = My.origSize.w / maxX;
		let B = My.origSize.h / maxY;

		My.scale = A < B ? A : B;
	}

	let reinit = false;
	My.init = async function(){
		await My.resetOffset();
		My.size.w = My.offset.width;
		My.size.h = My.offset.height;

		if(My.offset.width === 0 && reinit === false){
			My.scale = 1;
			setTimeout(async function(){
				await $.afterRepaint();

				reinit = true;
				await My.init();

				reinit = false;
				recalculateScale();
			});
		}
	}

	My.resetOffset = async function(){
		My.$el.css({
			width:'100%',
			height:'100%'
		});

		await $.afterRepaint();

		let w = 0, h = 0;
		let elements = My.$el;
		My.offset = elements[0].getBoundingClientRect();

		for (var i = 0; i < elements.length; i++) {
			let rect = elements[i].getBoundingClientRect();

			if(rect.width > w)
				w = rect.width;
			if(rect.height > h)
				h = rect.height;
		}

		My.origSize.w = w;
		My.origSize.h = h;
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
		if(My.config.move === false) return;
		My.$el.on('pointermove', moveContainer);

		$(sf.Window).once('pointerup', function(){
			My.$el.off('pointermove', moveContainer);

			// Fix incorrect scaling when the movement was too fast
			My.size.w = My.origSize.w / My.scale - My.pos.x;
			My.size.h = My.origSize.h / My.scale - My.pos.y;
		});
	}

	// My.onScale = callback

	My.scaleContainer = function(ev){
		if(My.config.scale === false) return;
		if(ev.deltaY > 0 && My.scale < 0.21)
			return;

		if(ev.deltaY < 0 && My.scale > 1.98)
			return;

		var delta = ev.deltaY/100 * 0.05;
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