Space.model('container', function(My, include){
	let spaceID = My.$space.id;

	if(My.isMinimap = spaceID.includes('+mini')){
		let mainSpace = Blackprint.space.list[spaceID.replace('+mini', '')];
		My.minimapSource = mainSpace('container');
	}

	My.cableScope = include('cables');
	My.nodeScope = include('nodes');
	My._isImporting = false;

	// function onlyNegative(now){
	// 	if(now > 0) return 0;
	// }

	My.pos = {x:0, y:0,
		// Because origin is top left, viewport height and width are increased on bottom right
		// Force to zero if there are no more space to be panned on left side
		// on$x: onlyNegative, on$y: onlyNegative
	};

	My.scale = 1;
	My.size = {w:0, h:0};
	My.origSize = {w:0, h:0};
	My.offset;
	My.select = {x:0, y:0, w:0, h:0, ix: false, iy: false, show: false};

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
	My._posNoScale = {x:0, y:0};
	function moveContainer(ev){
		isMoved = true;

		let movementX = ev.movementX / devicePixelRatio;
		let movementY = ev.movementY / devicePixelRatio;

		if(!(My.pos.x >= 0 && movementX > 0)){
			var temp = My.pos.x + movementX;

			if(temp > 0){
				temp = 0;
				if(My.scale === 1) My._posNoScale.x = 0;
			}
			else My._posNoScale.x += movementX;

			My.size.w = (My.origSize.w - temp) / My.scale;
			My.pos.x = temp;
		}

		if(!(My.pos.y >= 0 && movementY > 0)){
			var temp = My.pos.y + movementY;

			if(temp > 0){
				temp = 0;
				if(My.scale === 1) My._posNoScale.y = 0;
			}
			else My._posNoScale.y += movementY;

			My.size.h = (My.origSize.h - temp) / My.scale;
			My.pos.y = temp;
		}

		My.onMove && My.onMove(My.pos);
	}

	My.moveContainer = function(ev){
		if(My.config.move === false) return;
		if(ev.button === 0){ // left click
			My.beginSelecting(ev);
			return;
		}

		My.$el.on('pointermove', moveContainer);
		let cancelContextMenu = false;

		if(_stopSelect != null) _stopSelect();

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
		});
	}

	let cableSelect = My.cableScope.selected;
	let nodeSelect = My.nodeScope.selected;
	let cableList = My.cableScope.list;
	let nodeList = My.nodeScope.list;

	My.moveSelection = function(ev, skip){
		var scale = My.scale;

		for (var i = 0; i < cableSelect.length; i++) {
			let temp = cableSelect[i];
			if(skip === temp) continue;

			temp.moveCableHead(ev, true);
		}

		for (var i = 0; i < nodeSelect.length; i++) {
			let temp = nodeSelect[i];
			if(skip === temp) continue;

			temp.moveNode(ev, true);
		}
	}

	let selectPivotPoint = {x: 0, y: 0};
	function containerSelecting(ev){
		let dx = (ev.clientX - My.pos.x - My.offset.x) / My.scale - selectPivotPoint.x;
		let dy = (ev.clientY - My.pos.y - My.offset.y) / My.scale - selectPivotPoint.y;

		My.select.ix = dx < 0;
		My.select.iy = dy < 0;
		My.select.w = Math.abs(dx);
		My.select.h = Math.abs(dy);
	}

	let _stopSelect = null;
	My.beginSelecting = function(ev){
		My.select.show = true;

		My.select.x = selectPivotPoint.x = (ev.clientX - My.pos.x - My.offset.x) / My.scale;
		My.select.y = selectPivotPoint.y = (ev.clientY - My.pos.y - My.offset.y) / My.scale;

		$(document.body).css('user-select', 'none');

		My.$el.on('pointermove', containerSelecting);
		let winRef = $(sf.Window).once('pointerup', stopSelect);

		_stopSelect = stopSelect;
		function stopSelect(){
			_stopSelect = null;

			My.$el.off('pointermove', containerSelecting);
			winRef.off('pointerup', stopSelect);

			$(document.body).css('user-select', '');

			let obj = My.select;
			let sx, sy, ex, ey; // s = start, e = end; (X, Y position)

			if(obj.ix){
				sx = obj.x - obj.w;
				ex = obj.x;
			}
			else{
				sx = obj.x;
				ex = obj.x + obj.w;
			}

			if(obj.iy){
				sy = obj.y - obj.h;
				ey = obj.y;
			}
			else{
				sy = obj.y;
				ey = obj.y + obj.h;
			}


			let smallSelect = obj.w < 10 && obj.h < 10;

			// Reset
			My.select = {x:0, y:0, w:0, h:0, ix: false, iy: false, show: false};

			for (var i = 0; i < cableSelect.length; i++)
				cableSelect[i].selected = false;

			for (var i = 0; i < nodeSelect.length; i++)
				nodeSelect[i]._nodeSelected = false;

			cableSelect.length = 0;
			nodeSelect.length = 0;

			if(smallSelect) return;

			for (var i = 0; i < cableList.length; i++) {
				let temp = cableList[i];
				if(temp.hasBranch === false) continue;

				let [x, y] = temp.head2;
				if(x >= sx && x <= ex
				&& y >= sy && y <= ey){
					temp.selected = true;
					cableSelect.push(temp);
				}
			}

			for (var i = 0; i < nodeList.length; i++) {
				let temp = nodeList[i];
				let {x, y} = temp;
				let {offsetWidth, offsetHeight} = sf.Window.source(temp.$el, ev).firstElementChild;

				let ox = offsetWidth + x;
				let oy = offsetHeight + y;

				if(ox >= sx && x <= ex
				&& oy >= sy && y <= ey){
					temp._nodeSelected = true;
					nodeSelect.push(temp);
				}
			}
		};
	}

	My.checkTouch = function(ev){
		if(ev.touches.length === 2){
			if(_stopSelect != null) _stopSelect(); // disable selection

			ev.stopPropagation();
			ev.preventDefault();

			My.moveContainer({button: 1});

			// My.$el.on('touchmove', scaleContainer)
			// 	.off('touchend', scaleContainer);
		}
	}

	// My.onScale = callback

	My.scaleContainer = function(ev){
		if(ev.ctrlKey === false && ev.scale === void 0) return;
		if(My.config.scale === false) return;
		ev.preventDefault();

		if(ev.deltaY > 0 && My.scale < 0.21)
			return;

		if(ev.deltaY < 0 && My.scale > 4.98)
			return;

		// From touchGesture
		if(ev.scale !== void 0){
			// console.log(ev);

			// Mouse scroll delta Y
			var delta = ev.scale;
			var scale = My.scale + delta;
		}
		else{
			// Mouse scroll delta Y
			var delta = ev.deltaY/100 * (My.scale < 1 ? 0.05 : 0.1);
			var scale = My.scale - delta;
		}

		My.scale = scale;

		// ToDo: fix scaling, should scale with cursor as the middle scaling position
		let x = My.pos.x + Math.round((ev.clientX - My._posNoScale.x - My.offset.x) * delta);
		let y = My.pos.y + Math.round((ev.clientY - My._posNoScale.y - My.offset.y) * delta);

		if(x > 0) x = 0;
		if(y > 0) y = 0;

		My.pos.x = x;
		My.pos.y = y;

		My.size.w = (My.origSize.w - x) / scale;
		My.size.h = (My.origSize.h - y) / scale;

		My.onScale && My.onScale(scale);
		// My.onMove && My.onMove(My.pos);
	}

	// @gesture.capture="touchGesture(event)"
	My.touchGesture = function(ev){
		if(ev.pointerType === 'mouse') return;
		if(ev.type === "pointerup")
			return;

		if(_stopSelect != null) _stopSelect(); // disable selection
		ev.preventDefault();
		ev.stopPropagation();
		moveContainer(ev);

		// console.log(ev);

		// ToDo: enable after middle scaling position was fixed
		// My.scaleContainer(ev);
	}
});