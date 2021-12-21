require("../dist/engine.min.js");
window.sf = require("scarletsframe/dist/scarletsframe.min.js");
window.ResizeObserver = class{};
require("../dist/blackprint.min.js");
require("../dist/blackprint.sf.js");

test('Blackprint.Sketch does exist on window', () => {
  expect(window.Blackprint.Sketch).toBeDefined();
});

function jestFn(){ // alternative for jest.fn
	function temp(){
		temp.args = arguments;
		temp.called++;
	}

	temp.called = 0;
	return temp;
}

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
			input = {
				In: String,
			}
			output = {
				Out: Number,
			}
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

			_imported = jestFn();
			imported(data){
				this._imported(data);
				Object.assign(this.iface.data, data);

				let {Input, IInput, Output, IOutput} = this.const;

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
			input = {
				In: Number,
				Dummy: String,
			}
			output = {
				Out: String,
			}
			constructor(instance){
				super(instance);

				this._node2 = true;

				let iface = this.setInterface("BPIC/Test/Node2");
				expect(this.iface).toBe(iface);

				this.iface.title = "Test-Node2";
			}

			_imported = jestFn();
			imported(data){
				this._imported(data);
				// Object.assign(this.iface.data, data);

				let {Input, IInput, Output, IOutput} = this.const;

				// test('Node2: check port references')
				expect(Input === this.input).toBe(true);
				expect(Output === this.output).toBe(true);

				expect(IInput === this.iface.input).toBe(true);
				expect(IOutput === this.iface.output).toBe(true);

				// test('Node2: check default port value')
				expect(Input.In).toBe(0);
				expect(Output.Out).toBe(undefined);
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

			_imported = jestFn();
			imported(data){
				this._imported(data);
				let {Input, IInput, Output, IOutput} = this.const;

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

			_imported = jestFn();
			imported(data){
				this._imported(data);
				let {Input, IInput, Output, IOutput} = this.const;

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
			expect(iface1.node._imported.called).toBe(1);

			expect(sketch.getNodes('Test/Node1')[0].iface === iface1).toBe(true);
			iface1.node.update = jestFn();
		});

		test('Create "Test/Node2" for sketch', async () => {
			iface2 = sketch.createNode('Test/Node2', {x: 121, y: 242, id: 'helloSketch'});
			expect(iface2.isSketch).toBe(true);
			expect(iface2.x).toBe(121);
			expect(iface2.y).toBe(242);
			expect(iface2._imported.called).toBe(1);
			expect(iface2.node._imported.called).toBe(1);

			expect(sketch.iface.helloSketch === iface2).toBe(true);
			iface2.node.update = jestFn();
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

				expect(A.const.IOutput.Out.cables[0].input.iface === B).toBe(true);
			});

			test('Return correct value', async () => {
				fn1 = jestFn();
				B.on('port.value', function(ev){
					expect(ev.cable.value).toBe(12);
					fn1();
				});

				fn2 = jestFn();
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
				expect(iface1.node.update.called).toBe(0);
				expect(iface2.node.update.called).toBe(1);

				expect(fn1.called).toBe(1);
				expect(fn2.called).toBe(1);
			});
		});
	});

	describe("For Non-Sketch", () => {
		let iface1, iface2;
		test('Create "Test/Node1" for non-sketch', async () => {
			iface1 = engine.createNode('Test/Node1', {data: {foo: 'bar'}});
			expect(iface1.data.foo).toBe('bar ok');
			expect(iface1.node._imported.called).toBe(1);

			expect(engine.getNodes('Test/Node1')[0].iface === iface1).toBe(true);
			iface1.node.update = jestFn();
		});

		test('Create "Test/Node2" for non-sketch', async () => {
			iface2 = engine.createNode('Test/Node2', {id: 'helloEngine'});
			expect(iface2.isSketch).toBe(false);
			expect(iface2._imported.called).toBe(1);
			expect(iface2.node._imported.called).toBe(1);

			expect(engine.iface.helloEngine === iface2).toBe(true);
			iface2.node.update = jestFn();
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

				expect(A.const.IOutput.Out.cables[0].input.iface === B).toBe(true);
			});

			test('Return correct value', async () => {
				fn1 = jestFn();
				B.on('port.value', function(ev){
					expect(ev.cable.value).toBe(12);
					fn1();
				});

				fn2 = jestFn();
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
				expect(iface1.node.update.called).toBe(0);
				expect(iface2.node.update.called).toBe(1);

				expect(fn1.called).toBe(1);
				expect(fn2.called).toBe(1);
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
});