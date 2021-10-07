let BlackprintEventFallback = {
	error(error){
		BlackprintEventFallback.error.types[error.type](error.data || error);
	},
	cable_wrong_pair({ port, cable }){
		console.log(`The cable is not suitable (${cable.source}, ${port.source})`);
	},
	cable_wrong_type({ cable, iface, source, target }){
		console.log(iface.title+"> Port from '"+source.iface.title + " - " + source.name+"' was not an "+target.type.name);
	},
	cable_wrong_type_pair({ cable, target }){
		console.log(`The cable type is not suitable (${cable.owner.type.name}, ${target.type.name})`);
	},
	cable_duplicate_removed({ cable, target }){
		console.log("Duplicated cable removed");
	},
	cable_replaced({ cable, target }){
		console.log("Cable was replaced because input doesn't support array");
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