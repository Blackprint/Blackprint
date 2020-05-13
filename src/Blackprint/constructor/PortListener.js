Blackprint.PortListener = function(type, func){
	if(func === void 0){
		type.portFeature = Blackprint.PortListener;
		return type;
	}

	func.portFeature = Blackprint.PortListener;
	func.portType = type;
	return func;
}