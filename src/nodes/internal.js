Blackprint.registerNode("BP/Skeleton", class extends Blackprint.Node {
	static input = {};
	static output = {};

	constructor(instance){
		super(instance);
		this.setInterface();
	}

	imported(data){
		this.iface.title = data.namespace.split('/').slice(-2).join(' ');
		this.iface.namespace = data.namespace;
		this.iface.type = 'bp-skeleton';
	}
});