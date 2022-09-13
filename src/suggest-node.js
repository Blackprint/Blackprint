Blackprint.Sketch.suggestNode = function(source, clazz, fromList, virtualType){
	let BP_Port = Blackprint.Port;
	if(clazz._bpRoute) return {}; // cable for route only

	let skipInternal = Blackprint.nodes.BP;

	let temp = {};
	function dive(nodes, obj){
		let found = false;

		for(let key in nodes){
			let ref = nodes[key];
			if(ref === skipInternal) continue;

			if(ref.constructor === Object){
				obj[key] = {};

				if(!dive(nodes[key], obj[key]))
					delete obj[key];
				else found = true;
			}
			else{
				let metadata = ref[source]; // the target port (source= input/output)
				if(metadata === void 0) continue;

				let match = false;
				that: for(let prop in metadata){
					let temp = metadata[prop];

					if(virtualType != null){ // virtualType = Port
						if(BP_Port.VirtualType.validate(temp, virtualType))
							match = true;

						continue;
					}

					if(temp === Blackprint.Types.Any){
						if(clazz === Function)
							continue;

						if(ref.skipSuggestTypeAny) continue;

						match = true;
						continue;
					}

					// console.log(31, temp);

					if(temp.constructor === Object){
						if(temp.portFeature !== void 0){
							if(temp.portFeature === BP_Port.Trigger){
								if(clazz === Function)
									match = true;

								continue;
							}

							if(temp.portType === Blackprint.Types.Any){
								if(ref.skipSuggestTypeAny) continue;

								if(clazz !== Function)
									match = true;

								continue;
							}

							if(temp.portFeature === BP_Port.Union){
								match = checkTypeInstance(source, clazz, temp.portType, ref);
								if(match) break;

								continue;
							}
							else temp = temp.portType;
						}
					}

					// Skip if not matching with BP_Port.Trigger
					if(source === 'input' && clazz === Function)
						continue;

					if(clazz.any != null){
						if(temp === Function || ref.skipSuggestTypeAny) continue;

						match = true;
						break;
					}

					match = checkTypeInstance(source, clazz, temp, ref);
					if(match) break;
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

function checkTypeInstance(source, clazz, target, nodeClass){
	if(target === clazz)
		return true;

	if(source === 'output'){
		if(clazz === Object) return false;
		if(clazz.any || target.any){
			if(nodeClass.skipSuggestTypeAny) return false;
			return true;
		}

		if(clazz.constructor === Array){
			for (var i = 0; i < clazz.length; i++) {
				if(checkTypeInstance(source, clazz[i], target, nodeClass))
					return true;
			}

			return false;
		}

		if(target.prototype instanceof clazz)
			return true;
	}

	if(source === 'input'){
		if(target === Object) return false;
		if(clazz.any || target.any){
			if(nodeClass.skipSuggestTypeAny) return false;
			return true;
		}

		if(target.constructor === Array){
			for (var i = 0; i < target.length; i++) {
				if(checkTypeInstance(source, target[i], clazz, nodeClass))
					return true;
			}

			return false;
		}

		if(clazz.prototype instanceof target)
			return true;
	}

	return false;
}

Blackprint.Sketch.suggestNodeForPort = function(port){
	return Blackprint.Sketch.suggestNode(port.source === 'input' ? 'output' : 'input', port.type, null, port.virtualType ? port : null);
}