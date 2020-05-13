Blackprint.PortValidator = function(type, func){
	if(func === void 0){
		type.portFeature = Blackprint.PortValidator;
		return type;
	}

	func.portFeature = Blackprint.PortValidator;
	func.portType = type;
	return func;
}