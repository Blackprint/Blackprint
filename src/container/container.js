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
			if(e.type === "pointerup"){
				if(My.scale === 0) fixScaling();
				else recalculateScale();
			}
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

	let fixScaling = My.fixScaling = async function(){
		My.$el.css({width: '100%', height: '100%', transform: 'scale(1)'});
		await $.afterRepaint();
		await My.resetOffset();
		My.size.w = My.offset.width;
		My.size.h = My.offset.height;

		if(My.isMinimap) recalculateScale();
	}

	My.init = async function(){
		await fixScaling();

		if(My.offset.width === 0)
			setTimeout(fixScaling, 1000);
		else if(My.isMinimap) recalculateScale();
	}

	My.resetOffset = async function(){
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

	let isMoved = false;
	function moveContainer(ev){
		isMoved = true;
		let {movementX, movementY} = ev;

		if(!(My.pos.x >= 0 && movementX > 0)){
			My.size.w -= movementX;
			My.pos.x += movementX;
		}

		if(!(My.pos.y >= 0 && movementY > 0)){
			My.size.h -= movementY;
			My.pos.y += movementY;
		}

		My.onMove && My.onMove(My.pos);
	}

	My.moveContainer = function(ev){
		if(My.config.move === false) return;
		if(ev.button === 0) return; // left click

		My.$el.on('pointermove', moveContainer);
		let cancelContextMenu = false;

		$(sf.Window)
		.once('contextmenu', {capture: true}, function(ev2){
			if(cancelContextMenu){
				ev2.stopPropagation();
				ev2.preventDefault();
			}
		})
		.once('pointerup', function(){
			My.$el.off('pointermove', moveContainer);

			if(ev.button === 2 && isMoved) // right click, disable context menu if moved
				cancelContextMenu = true;

			isMoved = false;

			// Fix incorrect scaling when the movement was too fast
			My.size.w = My.origSize.w / My.scale - My.pos.x;
			My.size.h = My.origSize.h / My.scale - My.pos.y;
		});
	}

	// My.onScale = callback

	My.scaleContainer = function(ev){
		if(ev.ctrlKey === false) return;
		if(My.config.scale === false) return;
		ev.preventDefault();

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