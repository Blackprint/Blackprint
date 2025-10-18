Blackprint.Tools ??= {};
Blackprint.Tools.importSkeleton = function(data, { skipIfExist = true, clearAll = false } = {}){
	if(data.constructor === String) data = JSON.parse(data);
	Blackprint._docs = data.docs;
	let vtContext = { __virtualTypes: {} };

	if(clearAll){
		for (let key in Blackprint.nodes) {
			sf.Obj.delete(Blackprint.nodes, key)
		}
	}

	function deep(nest, exist, namespace){
		for (let key in nest) {
			let ref = nest[key];
			if(ref.$input || ref.$output){
				let input = ref.$input && {};
				let output = ref.$output && {};

				convertType(input, ref.$input, 'input');
				convertType(output, ref.$output, 'output');

				Blackprint.registerNode(namespace + key, class extends Blackprint.Node {
					static input = input;
					static output = output;
					static _isSkeleton = true;

					constructor(instance){
						super(instance);

						let iface = this.setInterface();
						if(!iface.title || iface.title === 'No Title') iface.title = key;

						if(!iface.description) {
							let temp = namespace.slice(0, -1).split('/');
							let first = temp[0];
							let last = temp[temp.length - 1];
							iface.description = first === last ? first : `${first}/${last}`;
						}
					}
				});
				continue;
			}

			if(ref.constructor === Object){
				deep(ref, exist[key] ??= {}, namespace + key + '/');
				continue;
			}
		}
	}

	let DummyType = class DoNotConnectToAnything{};
	function convertType(target, ref, which){
		for (let name in ref) {
			let type = ref[name];

			if(typeTemp[type]) target[name] = typeTemp[type];
			else if(type === 'BP.Trigger') {
				if(which === 'input')
					target[name] = Blackprint.Port.Trigger(()=>{});
				else target[name] = Blackprint.Types.Trigger;
			}
			else if(type === 'BP.Route') target[name] = Blackprint.Types.Route;
			else if(type.startsWith('BP.ArrayOf<')) {
				target[name] = Blackprint.Port.ArrayOf(vTypeParse(type)[0]);
			}
			else if(type.startsWith('BP.StructOf<')) {
				target[name] = Blackprint.Port.StructOf(vTypeParse(type)[0], {
					"NotSupported": { type: DummyType, field: '_' }
				});
			}
			else if(type.startsWith('BP.Union<')) {
				target[name] = Blackprint.Port.Union(vTypeParse(type));
			}
			else if(type.startsWith('VirtualType<')) {
				target[name] = Blackprint.Port.VirtualType(Object, vTypeParse(type, true), vtContext);
			}
			else target[name] = vTypeParse(type);
		}
	}

	let typeTemp = {
		'Number': Number,
		'String': String,
		'Object': Object,
		'Array': Array,
		'Boolean': Boolean,
		'BP.Any': Blackprint.Types.Any,
	};
	function vTypeParse(typeStr, returnName){
		if(typeTemp[typeStr]) return typeTemp[typeStr];

		let wrapIndex = typeStr.indexOf('<');
		if(wrapIndex !== -1){
			if(returnName)
				return typeStr.slice(wrapIndex + 1, -1).split(',');
			return typeStr.slice(wrapIndex + 1, -1).split(',').map(vTypeParse);
		}

		return typeTemp[typeStr] = Blackprint.Port.VirtualType(Object, typeStr, vtContext);
	}

	deep(data.nodes, Blackprint.nodes, '');
	Blackprint.nodes.refresh?.();
}