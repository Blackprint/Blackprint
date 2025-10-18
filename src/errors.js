let BlackprintEventFallback = {
	error(error){
		BlackprintEventFallback.error.types[error.type](error.data || error);
	},
	'cable.wrong_pair'({ port, cable }){
		console.log(`The cable is not suitable (${cable.source}, ${port.source})`);
	},
	'cable.wrong_type'({ cable, iface, port, target }){
		console.log(iface.title+"> Port from '"+port.iface.title + " - " + port.name+"' was not an "+target.type.name);
	},
	'cable.wrong_type_pair'({ port, target }){
		console.log(`The cable type is not suitable (${port.type.name} != ${target.type.name})`);
	},
	'cable.virtual_type_mismatch'({ port, target }){
		let A = port.virtualType?.map(v => v.name).join("|") ?? port.type.name;
		let B = target.virtualType?.map(v => v.name).join("|") ?? target.type.name;
		console.log(`No virtual type that matched each other (${A} != ${B})`);
	},
	'cable.duplicate_removed'({ cable, target }){
		console.log("Duplicated cable removed");
	},
	'cable.replaced'({ cable, target }){
		console.log("Cable was replaced because input doesn't support array");
	},
	'cable.unsupported_dynamic_port'({ cable, target }){
		console.log("Connecting cable between dynamically generated port is not supported");
	}
};

BlackprintEventFallback.error.types = {
	node_port_not_found({ iface, portName }){
		console.error("Node port not found for", iface, "with name:", portName);
	},
	node_not_found({ namespace }){
		console.error('Node for', namespace, "was not found, maybe .registerNode() haven't being called?")
	},
	node_delete_not_found({ iface }){
		console.error("Node was not found on the list", iface);
	},
	node_template_not_found({ tagName, element }){
		console.error("It seems '"+tagName+"' HTML haven't been registered as component or can't be loaded", element);
	},
};