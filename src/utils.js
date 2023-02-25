// RepeatedProperty: from node input, output, or property list
function getPortRect(RP, name){
	if(Blackprint.settings.windowless){ // Use fake data
		let temp = {bottom:90,height:90,left:90,right:90,top:90,width:90,x:90,y:90};
		Object.setPrototypeOf(temp, DOMRect.prototype);
		return temp;
	}

	let _list = RP._portList;
	if(_list.getElement === void 0)
		console.error("It seems the JSON was imported when sketch view haven't been loaded");

	return _list.getElement(RP[name]).querySelector('.port').getBoundingClientRect();
}

// setDeepProperty(obj, path, value, onCreate)
let setDeepProperty = Blackprint._utils.setDeepProperty;
// getDeepProperty(obj, path, reduceLen)
let getDeepProperty = Blackprint._utils.getDeepProperty;

function deepCopy(target, source){
	for(var key in source){
		// Skip any character that contain $ or _
		// Because it's marked as private property
		if(key.includes('$') || key.includes('_'))
			continue;

		if(typeof source[key] === 'object'){
			if(source[key] instanceof Array)
				target[key] = [];
			else
				target[key] = {};

			deepCopy(target[key], source[key]);
			continue;
		}

		target[key] = source[key];
	}
}

function deepMerge(target, source){
	for(var key in source){
		// Skip any character that contain $ or _
		// Because it's marked as private property
		if(key.includes('$') || key.includes('_'))
			continue;

		if(typeof target[key] === 'object'){
			deepMerge(target[key], source[key]);
			continue;
		}

		target[key] = source[key];
	}
}

const isClass = Blackprint._utils.isClass;

function isTouchDevice(){
	return navigator.maxTouchPoints !== 0;
}

function createNodesMenu(list, sketch, ev, pos, opt){
	var menu = [];
	var strArr = [];
	function deep(obj, target){
		let nodePath = strArr.join('/');
		for(var name in obj){
			let that = obj[name];
			if(that == null || that.hidden || that.disabled)
				continue;

			if(that.constructor === Function){
				let doc = getDeepProperty(Blackprint._docs, (nodePath+'/'+name).split('/'));
				target.push({
					title: name,
					description: doc?.description || doc?.tags?.summary,
					args: [strArr.length !== 0 ? strArr.join('/')+'/'+name : name],
					callback: createNode
				});
				continue;
			}

			var newMenu = [];

			strArr.push(name);
			deep(that, newMenu);
			strArr.pop();

			newMenu = newMenu.sort((a, b) => a.title < b.title ? -1 : 1);
			target.push({title: name, deep: newMenu});
		}
	}

	let container = sketch.scope('container');
	let position = {
		x: (pos ? pos.x : ev.clientX),
		y: (pos ? pos.y : ev.clientY),
	};
	let coordinate = {
		x: (position.x - container.offset.x - container.pos.x) / container.scale,
		y: (position.y - container.offset.y - container.pos.y) / container.scale,
	};

	function createNode(namespace){
		let iface = sketch.createNode(namespace, coordinate);
		opt.onCreated?.(iface);
	}

	menu = menu.sort((a, b) => a.title < b.title ? -1 : 1);
	menu.event = ev;

	deep(list, menu);

	let cancelMenu = false;
	Blackprint.emit('menu.create.node', { 
		list, menu, sketch, position, coordinate, event: ev, options: opt, isSuggestion: opt.suggest ?? false, 
		preventDefault(){
			cancelMenu = true;
		}
	});

	if(cancelMenu) return false;
	return menu;
}

// original and replace parameter must be a class, classes = Array<Class>
function prototypeReplacer(classes, original, replace){
	let protoA = original.prototype;
	let protoB = replace.prototype;

	for (let key in classes) {
		let obj = classes[key];
		diveAndReplace(classes[key].prototype, obj);
	}

	function diveAndReplace(proto, obj){
		if(proto == null) return;
		if(proto === protoA){
			Object.setPrototypeOf(obj, protoB);
			return;
		}

		diveAndReplace(Object.getPrototypeOf(proto), proto);
	}
}