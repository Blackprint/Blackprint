# 0.6.3

### Bug Fix
- Fix error when not using development mode
- Fix incorrect position when trying to create node with dropdown menu
- Fix incorrect location for some features when the container get scaled
- Cancel selection when moving container for touchscreen
- Fix scale and movement for different screen ratio
- Fix some issue with container scaling

# 0.6.2

### Bug Fix
- Fix error on unit test
- Fix incorrect dropdown position
- Fix some error when Sketch is being run on Jest environment
- Fix some bug and some minor modification

### Features
- Add options to skip some import data
- Add bulk delete feature for nodes
- Add `moduleAdded` event

# 0.6.1

### Bug Fix
- Fix `registerNode` and `registerInterface` to be used for decorator
- Fix and improve performance for cable position
- Add support for engine's ghost port

# 0.6.0

### Features
- Improved node suggestion
- Edit node description and title
- Select nodes with left click
- Move selected nodes and branch cable together
- Add node comment

### Breaking Changes
- Blackprint Engine v0.6 is required (for more information please see the changelog)
- `Blackprint.Sketch.suggestFromPort` is now changed to `Blackprint.Sketch.suggestNodeForPort`
- `Blackprint.Sketch.suggestByRef` is now removed, please use `suggestNode` instead

# 0.5.2

### Features
- Add support for touch devices
- Double click the path will create new cable branch

### Bug Fix
- Improve rendering performance
- Fix cable branch arrangement
- Fix some low impact bugs

# 0.5.1

### Features
- Add `node.destroy` as an alternative for `iface.destroy`, this will be called by the engine and shouldn't be manually called
- Add `instance.deleteNode` to delete node manually by using code
- Add cable branching feature for output port
- Add feature to create branch on connected cable
- Add merge branch for single cable
- Add options for `importJSON`
- Clicked nodes will be moved on front of the other nodes (z-index)
- Add decoration on small header template
- Automatically put cable on suitable port when it's dropped on top of a node

### Breaking Changes
- Blackprint Engine v0.5 is required (for more information please see the changelog)
- Moving the container with left click is removed, please use right/middle click instead
- `importJSON` now will clear the instance first

### Bug Fix
- Fix batch load when being loaded from CDN

# 0.4.4

- Tidy up
- Improve some element style

# 0.4.3

### Feature
- Add `suggestNode` and `suggestFromPort` for suggesting possible related node (may not 100% accurate)
- CTRL + right clicking on port and detached cable will use `suggestNode` feature
- Add options to disable export for environment and module URL
- Add header menu for creating similar node

### Bug Fix
- Fix error when right clicking cable
- Fix DropDown when being called after a delay
- Fix cable deletion for disconnected cable

# 0.4.2

### Bug Fix
- Fix incorrect default value
- Move `iface.imported` call order near `node.imported`

### Feature
- `Blackprint.Engine` is now using `CustomEvent`
- You can now connect cable with script

# 0.4.1

### Bug Fix
- Fix race condition when importing module from the URL

# 0.4.0

### Bug Fix
- Fix default node styles
- Avoid multiple constructor call

### Feature
- Simplify JSON export by removing empty field
- Sort DropDown menu by name

### Breaking Changes
- Blackprint Engine v0.4 is required
- Zoom now using CTRL + Mouse Scroll

# 0.3.0

### Bug Fix
- Fix minimap and the cloned window
- Fix DropDown position based on current window size and spawn position
- Fix JSON exporter for current version
- Fix node highlight when being hovered from menu

### Feature
- Add options to prettify the JSON export
- Minimap will keep it's position and auto scaled when the sketch getting larger
- Add Blackprint event listener and output any error message to console if no listener
- Add icon feature for the drop down
- Interfaces now can be accessed from `instance.iface[id]`
- Add custom environment data
- Load module from URL (default to disabled)
- Add support for using Decorator when registering node/interface
- Add support for listening to all event with "\*"
- Add SmallNotif (Toast) on the top right of the screen
- Add headmarks and other additional header element for nodes

### Breaking Changes
Because the implementation will be similar with [engine-php](https://github.com/Blackprint/engine-php) and [engine-go](https://github.com/Blackprint/engine-go).
This changes is supposed to improve efficiency, and reduce possible future breaking changes.<br>

- For sketch (browser only): `Blackprint.registerInterface()` was renamed to `Blackprint.Sketch.registerInterface()`
- For non-sketch: `Blackprint.Engine.registerInterface()` was renamed to `Blackprint.registerInterface()`
- When using class for `Blackprint.registerInterface` or `Blackprint.Sketch.registerInterface`, the class must extends `Blackprint.Interface`

Please see engine-js's [breaking changes](https://github.com/Blackprint/engine-js/releases) for `v0.3.0` for additional information.

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