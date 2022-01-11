let _portFunc = new RegExp(`\\.(${Object.keys(Blackprint.Port).join('|')})\\((.*?)\\)`, 'g');

function _constructorCleaner(claz){
	let str = claz.toString();
	let proto = claz.prototype;
	let _proto = Object.getOwnPropertyDescriptors(proto);

	for(let prop in _proto){
		if(prop !== 'constructor' && proto[prop] instanceof Function){
			str = str.split(proto[prop].toString())[0];
			break;
		}
	}

	return str.replace(/\s/g, '');
}

// This is just feature to suggest, may not 100% accurate
Blackprint.Sketch.suggestNode = function(portType, typeData, fromList){
	let any = false;

	if(typeData !== null){
		if(!typeData.name) throw new Error("Class name is required");
		if(typeData === void 0) throw new Error("typeData can't be undefined");
		if(typeData.constructor === Object && typeData.name === 'Any'){
			any = true;
		}
	}
	else{
		any = true;
		typeData = {};
	}

	let name = typeData.name.split(' ');
	let _name = name.join('|');
	let regex = new RegExp(`:(null|(?:${_name})|[a-zA-Z_0-9.]+?\.(?:${_name}))\\b`, 'g');
	let deep = fromList || Blackprint.nodes;

	let temp = {};
	function dive(nodes, obj){
		let found = false;

		for(let key in nodes){
			let ref = nodes[key];

			if(ref.constructor === Object){
				obj[key] = {};

				if(!dive(nodes[key], obj[key]))
					delete obj[key];
				else found = true;
			}
			else{
				let str = _constructorCleaner(ref);
				if(any && str.includes(portType + '={')){
					obj[key] = ref;
					found = true;
					continue;
				}

				str = str.split(portType + '={')[1];
				if(str === void 0) continue;

				if(portType === 'input')
					str = str.split('output={')[0];
				else str = str.split('input={')[0];

				let match = false;

				// Blackprint.Port.*(.*?)
				str.replace(_portFunc, function(full, func, args){
					if(name.includes('Function') && func === 'Trigger')
						match = true;

					if(!match){
						match = args.includes('null');

						if(!match){
							for (var i = 0; i < name.length; i++) {
								match = args.includes(name[i]);
								if(match) break;
							}
						}
					}
				});

				if(!match){
					str.replace(regex, function(full){
						if(!match) match = true;
					});
				}

				if(match){
					obj[key] = ref;
					found = true;
				}
			}
		}

		return found;
	}

	if(dive(deep, temp))
		return temp;
	else return {};
}

// This is just feature to suggest, may not 100% accurate
Blackprint.Sketch.suggestFromPort = function(port){
	let source = port.source === 'input' ? 'output' : 'input';

	if(port.type.name.length >= 3)
		return Blackprint.Sketch.suggestNode(source, port.type);
	// else try find the unminified class name

	let str = _constructorCleaner(port.iface.node.constructor);
	str = str.split(port.source + '={')[1];

	if(port.source === 'input')
		str = str.split('output={')[0];
	else str = str.split('input={')[0];

	let match = str.match(new RegExp(`${port.name}:([a-zA-Z_0-9.\\[\\]\\(\\), ]+)[,}]`));

	if(match === null) throw new Error("Failed to get type name");
	str = match[1];

	let match2 = str.match(_portFunc);
	if(match2 !== null){
		str = match2 = match2[1];

		if(match2.slice(0, 1) === '[') // array/union
			str = match2.slice(1, -1).split(',').join(' ');
	}

	let A = Blackprint.Sketch.suggestNode(source, {name: str});
	if(port.type.constructor === Object)
		return A;

	let B = Blackprint.Sketch.suggestByRef(source, port.type);
	return Object.assign(A, B);
}

Blackprint.Sketch.suggestByRef = function(source, clazz, fromList){
	let temp = {};
	function dive(nodes, obj){
		let found = false;

		for(let key in nodes){
			let ref = nodes[key];

			if(ref.constructor === Object){
				obj[key] = {};

				if(!dive(nodes[key], obj[key]))
					delete obj[key];
				else found = true;
			}
			else{
				let metadata = ref[`$${source}`];
				if(metadata === void 0) continue;

				let match = false;
				for(let prop in metadata){
					if(metadata[prop] === clazz){
						match = true;
						break;
					}
				}

				if(match){
					obj[key] = ref;
					found = true;
				}
			}
		}

		return found;
	}

	let deep = fromList || Blackprint.nodes;
	if(dive(deep, temp))
		return temp;
	else return {};
}