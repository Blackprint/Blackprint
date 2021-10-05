# 0.3.0

### Bug Fix
- Fix minimap and the cloned window
- Fix DropDown position based on current window size and spawn position
- Fix JSON exporter for current version

### Feature
- Add options to prettify the JSON export
- Minimap will keep it's position and auto scaled when the sketch getting larger
- Add Blackprint event listener and output any error message to console if no listener
- Add icon feature for the drop down
- Interfaces now can be accessed from `instance.iface[id]`
- Add custom environment data
- Load module from URL

### Breaking Changes
This changes is supposed to improve efficiency, and reduce possible future breaking changes.

- `.outputs, .inputs, .properties` field is changed into `.output, .input, .property` for `node` and `iface`
- `outputs:[]` field is now changed to `output:[]` for JSON export
- `Instance.importJSON()` now returning promise and need to be `await`-ed before using `.getNode` or `.getNodes`
- `Blackprint.Engine.registerNode()` will now being merged and replaced with `Blackprint.registerNode()`
- `Blackprint.Addons` was changed to `Blackprint.getContext`
- `Blackprint.Node` was changed to `Blackprint.Interface`
- When constructing Node, `node.interface = '...'` now must be changed to `node.setInterface('...')` before accessing the target interface
- When using class for `Blackprint.registerNode`, the class must extends `Blackprint.Node`
- When using class for `Blackprint.registerInterface` or `Blackprint.Sketch.registerInterface`, the class must extends `Blackprint.Interface`
- `BPAO` must be changed to `BPIC`
- For sketch (browser only): `Blackprint.registerInterface()` will be renamed to `Blackprint.Sketch.registerInterface()`
- For non-sketch: `Blackprint.Engine.registerInterface()` will be renamed to `Blackprint.registerInterface()`
- `Blackprint.PortArrayOf` now changed to `Blackprint.Port.ArrayOf`
- `Blackprint.PortDefault` now changed to `Blackprint.Port.Default`
- `Blackprint.PortSwitch` now changed to `Blackprint.Port.Switch`
- `Blackprint.PortTrigger` now changed to `Blackprint.Port.Trigger`
- `Blackprint.PortUnion` now changed to `Blackprint.Port.Union`
- `Blackprint.PortValidator` now changed to `Blackprint.Port.Validator`

# 0.2.0

### Breaking Changes
- `Blackprint.Interpreter` is changed into `Blackprint.Engine`
- Package on NPM registry was moved to `@blackprint/...`
- `iface.options` now changed to `iface.data`, you will need to replace `options` from the exported JSON into `data`
- `iface.id` now changed to `iface.i`, you will need to replace `id` from the exported JSON into `i`
- `iface.id` now being used for named ID, and `iface.i` still being the generated index for the nodes

# [0.1.1](https://github.com/Blackprint/Blackprint/releases/tag/v0.1.1) (2020-10-17)

### Notes
- Still in development, any contribution welcome
- Please always specify the fixed version when using for your project
- Usually v0.\*.0 will have breaking changes, while v0.0.\* can have new feature or bug fixes