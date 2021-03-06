// RepeatedProperty: from node inputs, outputs, or properties list
function getPortRect(RP, name){
	if(RP.getElement === void 0)
		console.error("It seems the JSON was imported when sketch view haven't been loaded");

	return RP.getElement(name).querySelector('.port').getBoundingClientRect();
}

function deepProperty(obj, path, value){
	if(value !== void 0){
		for(var i = 0, n = path.length-1; i < n; i++){
			if(obj[path[i]] === void 0)
				obj[path[i]] = {};

			obj = obj[path[i]];
		}

		obj[path[i]] = value;
		return;
	}

	for(var i = 0; i < path.length; i++){
		obj = obj[path[i]];

		if(obj === void 0)
			return;
	}

	return obj;
}

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