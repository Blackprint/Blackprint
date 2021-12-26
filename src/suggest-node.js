let _portFunc = new RegExp(`\\.(${Object.keys(Blackprint.Port).join('|')})\\((.*?)\\)`, 'g');

Blackprint.Sketch.suggestNode = function(portType, typeData){
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

	let name = typeData.name;
	let regex = new RegExp(`:(null|${name}|[a-zA-Z_0-9.]+?\.${name})\\b`, 'g');
	let deep = Blackprint.nodes;

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
				let str = ref.toString();
				let proto = ref.prototype;
				let _proto = Object.getOwnPropertyDescriptors(proto);

				for(let prop in _proto){
					if(prop !== 'constructor' && proto[prop] instanceof Function){
						str = str.split(proto[prop].toString())[0];
						break;
					}
				}

				str = str.replace(/\s/g, '');
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
					if(name === 'Function' && func === 'Trigger')
						match = true;

					if(!match) match = args.includes(name) || args.includes('null');
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