// RepeatedProperty: from node inputs, outputs, or properties list
function getPortRect(RP, name){
	if(RP.getElement === void 0)
		console.error("It seems the JSON was imported when sketch view haven't been loaded");

	return RP.getElement(name).querySelector('.port').getBoundingClientRect();
}