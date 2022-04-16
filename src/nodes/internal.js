let BPVar = {html: `<div class="node {{ type }}" style="transform:translate({{ x }}px,{{ y }}px)">
  <div class="content">
  	<div class="center"
		@contextmenu.stopAll.prevent="nodeMenu(event)"
		@dragmove="moveNode(event)"
		@pointerdown="swapZIndex(event)"
		@pointerover="nodeHovered(event)"
	  	@pointerout="nodeUnhovered(event)"
	>{{ title }}</div>

    <div class="left-port">
      <sf-template path="Blackprint/nodes/template/input-port.sf"></sf-template>
    </div>

    <div class="right-port">
      <sf-template path="Blackprint/nodes/template/output-port.sf"></sf-template>
    </div>
  </div>
</div>`};

let BPFn = {template: 'Blackprint/nodes/default.sf'};

$(function(){
	Blackprint.Sketch.registerInterface('BPIC/BP/Var/Get', BPVar, Blackprint._iface['BPIC/BP/Var/Get']);
	Blackprint.Sketch.registerInterface('BPIC/BP/Var/Set', BPVar, Blackprint._iface['BPIC/BP/Var/Set']);
	Blackprint.Sketch.registerInterface('BPIC/BP/Fn/Main', BPFn, Blackprint._iface['BPIC/BP/Fn/Main']);
	Blackprint.Sketch.registerInterface('BPIC/BP/Fn/Input', BPFn, Blackprint._iface['BPIC/BP/Fn/Input']);
	Blackprint.Sketch.registerInterface('BPIC/BP/Fn/Output', BPFn, Blackprint._iface['BPIC/BP/Fn/Output']);
});