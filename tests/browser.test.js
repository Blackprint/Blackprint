require("../dist/engine.min.js");
window.sf = require("scarletsframe/dist/scarletsframe.min.js");
window.ResizeObserver = class{};
require("../dist/blackprint.min.js");
require("../dist/blackprint.sf.js");

test('Blackprint.Sketch does exist on window', () => {
	expect(window.Blackprint.Sketch).toBeDefined();

	// We want to use Blackprint.Sketch but with no window
	// let's set windowless to true
	Blackprint.settings('windowless', true);
});

let sketch, engine, cable_status;
describe("Create new instance of:", () => {
	test('Blackprint.Sketch', () => {
		sketch = new Blackprint.Sketch();
		expect(sketch.constructor).toBe(Blackprint.Sketch);

		sketch.on('cable.wrong_pair', function(){
			cable_status = "wrong_pair";
		})
		.on('cable.wrong_type', function(){
			cable_status = "wrong_type";
		})
		.on('cable.wrong_type_pair', function(){
			cable_status = "wrong_type_pair";
		})
		.on('cable.duplicate_removed', function(){
			cable_status = "duplicate_removed";
		})
		.on('cable.replaced', function(){
			cable_status = "replaced";
		});
	});

	test('Blackprint.Engine', () => {
		engine = new Blackprint.Engine();
		expect(engine.constructor).toBe(Blackprint.Engine);
	});
});

describe("Blackprint register", () => {
	test('Node', () => {
		// With default interface
		class Node1 extends Blackprint.Node {
			static input = { In: String }
			static output = { Out: Number }

			constructor(instance){
				super(instance);

				let iface = this.setInterface();
				expect(this.iface).toBe(iface);

				this.iface.title = "Test-Node";
				this.iface.data = {
					get foo(){return this._foo},
					set foo(v){
						this._foo = v + ' ok';
					}
				};
			}

			_imported = jest.fn();
			imported(data){
				this._imported(data);
				Object.assign(this.iface.data, data);

				let {Input, IInput, Output, IOutput} = this.ref;

				// test('Node1: check port references')
				expect(Input === this.input).toBe(true);
				expect(Output === this.output).toBe(true);

				expect(IInput === this.iface.input).toBe(true);
				expect(IOutput === this.iface.output).toBe(true);

				// test('Node1: check default port value')
				expect(Input.In).toBe("");
				expect(Output.Out).toBe(undefined);
			}
		}
		Blackprint.registerNode("Test/Node1", Node1);

		// With BPIC/Test/Node2 interface
		class Node2 extends Blackprint.Node {
			static input = {
				In: Number,
				Dummy: String,
			}
			static output = { Out: String }

			constructor(instance){
				super(instance);

				this._node2 = true;

				let iface = this.setInterface("BPIC/Test/Node2");
				expect(this.iface).toBe(iface);

				this.iface.title = "Test-Node2";
			}

			_imported = jest.fn();
			imported(data){
				this._imported(data);
				// Object.assign(this.iface.data, data);

				let {Input, IInput, Output, IOutput} = this.ref;

				// test('Node2: check port references')
				expect(Input === this.input).toBe(true);
				expect(Output === this.output).toBe(true);

				expect(IInput === this.iface.input).toBe(true);
				expect(IOutput === this.iface.output).toBe(true);

				// test('Node2: check default port value')
				expect(Input.In).toBe(0);
				expect(Output.Out).toBe(undefined);
			}

			_destroyed = false;
			destroy(){
				this._destroyed = true;
			}
		}
		Blackprint.registerNode("Test/Node2", Node2);
		// jest.(Node2, "imported")
	});

	test('Interface', () => {
		// For non-sketch
		Blackprint.registerInterface("BPIC/Test/Node2", class extends Blackprint.Interface {
			isSketch = false;
			constructor(node){
				super(node);
				expect(node._node2).toBe(true);
			}

			_imported = jest.fn();
			imported(data){
				this._imported(data);
				let {Input, IInput, Output, IOutput} = this.ref;

				// test('Iface2: check port references')
				expect(Input === this.node.input).toBe(true);
				expect(Output === this.node.output).toBe(true);

				expect(IInput === this.input).toBe(true);
				expect(IOutput === this.output).toBe(true);

				// test('Iface2: check default port value')
				expect(Input.In).toBe(0);
				expect(Output.Out).toBe(undefined);
			}
		});

		// For sketch
		Blackprint.Sketch.registerInterface("BPIC/Test/Node2", {
			template: 'Blackprint/nodes/default.sf', // need to be specified if not using .sf
		}, class extends Blackprint.Interface {
			isSketch = true;
			constructor(node){
				super(node);
				expect(node._node2).toBe(true);
			}

			_imported = jest.fn();
			imported(data){
				this._imported(data);
				let {Input, IInput, Output, IOutput} = this.ref;

				// test('Iface2: check port references')
				expect(Input === this.node.input).toBe(true);
				expect(Output === this.node.output).toBe(true);

				expect(IInput === this.input).toBe(true);
				expect(IOutput === this.output).toBe(true);

				// test('Iface2: check default port value')
				expect(Input.In).toBe(0);
				expect(Output.Out).toBe(undefined);
			}
		});
	});
});

describe("Blackprint create node with JavaScript", () => {
	describe("For Sketch", () => {
		let iface1, iface2;
		test('Create "Test/Node1" for sketch', async () => {
			iface1 = sketch.createNode('Test/Node1', {data: {foo: 'bar'}});
			expect(iface1.data.foo).toBe('bar ok');
			expect(iface1.node._imported).toHaveBeenCalledTimes(1);

			expect(sketch.getNodes('Test/Node1')[0].iface === iface1).toBe(true);
			iface1.node.update = jest.fn();
		});

		test('Create "Test/Node2" for sketch', async () => {
			iface2 = sketch.createNode('Test/Node2', {x: 121, y: 242, id: 'helloSketch'});
			expect(iface2.isSketch).toBe(true);
			expect(iface2.x).toBe(121);
			expect(iface2.y).toBe(242);
			expect(iface2._imported).toHaveBeenCalledTimes(1);
			expect(iface2.node._imported).toHaveBeenCalledTimes(1);

			expect(sketch.iface.helloSketch === iface2).toBe(true);
			iface2.node.update = jest.fn();
		});

		describe("Cable connection", () => {
			let portEv = new Set(['connect', 'disconnect', 'connecting']);
			let ifaceEv = new Set(['cable.disconnect', 'cable.cancel', 'cable.connect']);

			let iface3;
			test('Connecting Node1 with Node2 for sketch', async () => {
				iface3 = sketch.createNode('Test/Node1');

				iface2.input.In.on('*', function(ev){
					portEv.delete(ev.eventName);
				});
				iface2.on('*', function(ev){
					ifaceEv.delete(ev.eventName);
				});

				// Connect to dummy
				expect(iface3.output.Out.connectPort(iface2.input.In)).toBe(true);
				expect(iface1.output.Out.connectPort(iface2.input.Dummy)).toBe(false); // wrong_type

				// Replace connection
				iface1.output.Out.connectPort(iface2.input.In);
			});

			test('Has correct cable length', async () => {
				expect(iface1.output.Out.cables.length).toBe(1);
				expect(iface2.input.In.cables.length).toBe(1);
				expect(iface3.output.Out.cables.length).toBe(0);
			});

			test('Correctly connected to target node', async () => {
				expect(iface2.input.In.cables[0].output === iface1.output.Out).toBe(true);
			});

			test('Event was triggered', async () => {
				expect([...portEv].join(' ')).toBe('');
				expect([...ifaceEv].join(' ')).toBe('');
			});
		});

		describe("Check data flow", () => {
			let A, B, fn1, fn2;
			test('Cable connected to each other', async () => {
				A = sketch.getNodes('Test/Node1')[0]; // node, iface1
				B = sketch.iface.helloSketch; // iface, iface2

				expect(A === iface1.node).toBe(true);
				expect(B === iface2).toBe(true);

				expect(A.ref.IOutput.Out.cables[0].input.iface === B).toBe(true);
			});

			test('Return correct value', async () => {
				fn1 = jest.fn();
				B.on('port.value', function(ev){
					expect(ev.cable.value).toBe(12);
					fn1();
				});

				fn2 = jest.fn();
				B.input.In.on('value', function(ev){
					expect(ev.cable.value).toBe(12);
					fn2();
				});

				expect(()=>A.output.Out = "12").toThrow();
				A.output.Out = 12;
				expect(A.output.Out).toBe(12);
				expect(B.node.input.In).toBe(12);
			});

			test('Event was triggered', async () => {
				expect(iface1.node.update).toHaveBeenCalledTimes(0);
				expect(iface2.node.update).toHaveBeenCalledTimes(1);

				expect(fn1).toHaveBeenCalledTimes(1);
				expect(fn2).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe("For Non-Sketch", () => {
		let iface1, iface2;
		test('Create "Test/Node1" for non-sketch', async () => {
			iface1 = engine.createNode('Test/Node1', {data: {foo: 'bar'}});
			expect(iface1.data.foo).toBe('bar ok');
			expect(iface1.node._imported).toHaveBeenCalledTimes(1);

			expect(engine.getNodes('Test/Node1')[0].iface === iface1).toBe(true);
			iface1.node.update = jest.fn();
		});

		test('Create "Test/Node2" for non-sketch', async () => {
			iface2 = engine.createNode('Test/Node2', {id: 'helloEngine'});
			expect(iface2.isSketch).toBe(false);
			expect(iface2._imported).toHaveBeenCalledTimes(1);
			expect(iface2.node._imported).toHaveBeenCalledTimes(1);

			expect(engine.iface.helloEngine === iface2).toBe(true);
			iface2.node.update = jest.fn();
		});

		describe("Cable connection", () => {
			let portEv = new Set(['connect', 'disconnect', 'connecting']);
			let ifaceEv = new Set(['cable.disconnect', 'cable.cancel', 'cable.connect']);

			let iface3;
			test('Connecting Node1 with Node2 for sketch', async () => {
				iface3 = engine.createNode('Test/Node1');

				iface2.input.In.on('*', function(ev){
					portEv.delete(ev.eventName);
				});
				iface2.on('*', function(ev){
					ifaceEv.delete(ev.eventName);
				});

				// Connect to dummy
				expect(iface3.output.Out.connectPort(iface2.input.In)).toBe(true);
				expect(iface1.output.Out.connectPort(iface2.input.Dummy)).toBe(false); // wrong_type

				// Replace connection
				iface1.output.Out.connectPort(iface2.input.In);
			});

			test('Has correct cable length', async () => {
				expect(iface1.output.Out.cables.length).toBe(1);
				expect(iface2.input.In.cables.length).toBe(1);
				expect(iface3.output.Out.cables.length).toBe(0);
			});

			test('Correctly connected to target node', async () => {
				expect(iface2.input.In.cables[0].output === iface1.output.Out).toBe(true);
			});

			test('Event was triggered', async () => {
				expect([...portEv].join(' ')).toBe('');
				expect([...ifaceEv].join(' ')).toBe('');
			});
		});

		describe("Check data flow", () => {
			let A, B, fn1, fn2;
			test('Cable connected to each other', async () => {
				A = engine.getNodes('Test/Node1')[0]; // node, iface1
				B = engine.iface.helloEngine; // iface, iface2

				expect(A === iface1.node).toBe(true);
				expect(B === iface2).toBe(true);

				expect(A.ref.IOutput.Out.cables[0].input.iface === B).toBe(true);
			});

			test('Return correct value', async () => {
				fn1 = jest.fn();
				B.on('port.value', function(ev){
					expect(ev.cable.value).toBe(12);
					fn1();
				});

				fn2 = jest.fn();
				B.input.In.on('value', function(ev){
					expect(ev.cable.value).toBe(12);
					fn2();
				});

				expect(()=>A.output.Out = "12").toThrow();
				A.output.Out = 12;
				expect(A.output.Out).toBe(12);
				expect(B.node.input.In).toBe(12);
			});

			test('Event was triggered', async () => {
				expect(iface1.node.update).toHaveBeenCalledTimes(0);
				expect(iface2.node.update).toHaveBeenCalledTimes(1);

				expect(fn1).toHaveBeenCalledTimes(1);
				expect(fn2).toHaveBeenCalledTimes(1);
			});
		});
	});

	test('Multiple instance must have different node references', async () => {
		// Different instance for sketch
		let dummySketch = new Blackprint.Sketch();
		dummySketch.createNode('Test/Node2', {id: 'dummySketch'});
		expect(dummySketch.iface.dummySketch).toBeDefined();
		expect(dummySketch.iface.helloSketch).not.toBeDefined();

		// Different instance for engine
		let dummyEngine = new Blackprint.Engine();
		dummyEngine.createNode('Test/Node2', {id: 'dummyEngine'});
		expect(dummyEngine.iface.dummyEngine).toBeDefined();
		expect(dummyEngine.iface.helloEngine).not.toBeDefined();

		// Instance 1
		expect(sketch.iface.helloSketch.id).toBe('helloSketch');
		expect(sketch.iface.dummySketch).not.toBeDefined();
		expect(sketch.iface.dummyEngine).not.toBeDefined();

		// Instance 2
		expect(engine.iface.helloEngine.id).toBe('helloEngine');
		expect(engine.iface.dummySketch).not.toBeDefined();
		expect(engine.iface.dummyEngine).not.toBeDefined();
	});

	describe('Export and import with JSON', () => {
		var json;
		var AA,A0,A1,A2,A3;
		test('For Sketch', async () => {
			A0 = sketch.iface.helloSketch.ref;
			A1 = sketch.iface.helloSketch.ref.IOutput;
			A2 = sketch.iface.helloSketch.ref.Output;
			A3 = sketch.iface.helloSketch.ref.IOutput.Out;

			json = sketch.exportJSON();
			AA = sketch.importJSON(json);
		});
		test('Reuse references for Sketch IFace', async () => {
			await AA;
			expect(A0 === sketch.iface.helloSketch.ref).toBe(true);
			expect(A1 === sketch.iface.helloSketch.ref.IOutput).toBe(true);
			expect(A2 === sketch.iface.helloSketch.ref.Output).toBe(true);
			expect(A3 === sketch.iface.helloSketch.ref.IOutput.Out).toBe(true);
		});

		var BB,B0,B1,B2,B3;
		test('For Engine', async () => {
			B0 = engine.iface.helloEngine.ref;
			B1 = engine.iface.helloEngine.ref.IOutput;
			B2 = engine.iface.helloEngine.ref.Output;
			B3 = engine.iface.helloEngine.ref.IOutput.Out;

			json = json.split('helloSketch').join('helloEngine');
			BB = engine.importJSON(json);
		});
		test('Reuse references for Engine IFace', async () => {
			await BB;
			expect(B0 === engine.iface.helloEngine.ref).toBe(true);
			expect(B1 === engine.iface.helloEngine.ref.IOutput).toBe(true);
			expect(B2 === engine.iface.helloEngine.ref.Output).toBe(true);
			expect(B3 === engine.iface.helloEngine.ref.IOutput.Out).toBe(true);
		});
	});

	function deleteNode(instance, prop){
		let temp = instance.iface[prop];
		instance.deleteNode(temp);

		expect(instance.iface[prop]).not.toBeDefined();
		expect(instance.ref[prop]).not.toBeDefined();
		expect(temp.node._destroyed).toBe(true);

		// Check if port still have a cable/connection
		for(let val of Object.values(temp.output)){
			if(val.cables === void 0) continue;
			expect(val.cables.length).toBe(0);
		}

		for(let val of Object.values(temp.input)){
			if(val.cables === void 0) continue;
			expect(val.cables.length).toBe(0);
		}


		let temp2 = instance.getNodes('Test/Node1')[0].iface;

		// Check if port still have a cable/connection
		for(let val of Object.values(temp2.output)){
			if(val.cables === void 0) continue;
			expect(val.cables.length).toBe(0);
		}

		for(let val of Object.values(temp2.input)){
			if(val.cables === void 0) continue;
			expect(val.cables.length).toBe(0);
		}
	}

	test('Delete "Test/Node2" for sketch', async () => {
		deleteNode(sketch, 'helloSketch');
	});

	test('Delete "Test/Node2" for engine', async () => {
		deleteNode(engine, 'helloEngine');
	});
});