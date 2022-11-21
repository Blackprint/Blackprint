Blackprint.registerNode("BP/Skeleton", class extends Blackprint.Node {
	static input = {};
	static output = {};

	constructor(instance){
		super(instance);
		this.setInterface();
	}

	imported(data){
		let temp = data.namespace.split('/');
		this.iface.title = temp.slice(-2).join(' ');
		this.iface.namespace = data.namespace;
		this.iface.description = temp.join(' / ');
		this.iface.type = 'bp-skeleton';
	}
});