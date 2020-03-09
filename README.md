# Blackprint
A node to node visual scripting.

This library built using ScarletsFrame to maintain it's [performance](https://krausest.github.io/js-framework-benchmark/current.html) and [simplicity](https://www.npmjs.com/package/scarletsframe#example). If you want to start new project it's better to use the [template](https://github.com/StefansArya/scarletsframe-default) because it also have the [compiler](https://github.com/StefansArya/scarletsframe-compiler).

## Using on your project
This library is depend on ScarletsFrame to control every elements, template, and event listener. Please follow [this link](https://www.npmjs.com/package/scarletsframe#install-with-cdn-link) to get the minified js link.

### Load Blackprint required files
There are styles, template, and scripts that need to be loaded.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/blackprint/blackprint/dist/blackprint.min.css">
<script src="https://cdn.jsdelivr.net/gh/blackprint/blackprint/dist/blackprint.html.js"></script>
<script src="https://cdn.jsdelivr.net/gh/blackprint/blackprint/dist/blackprint.min.js"></script>
```

### Simple example on how to use
```js
// Create Blackprint
var sketch = new Blackprint();

// Get the container and attach it into the DOM (If you're not using sf-views for routing)
document.body.appendChild(sketch.cloneContainer());

// Register a new node
sketch.registerNode('math/multiply', function(handle, node){
    // Give it a title
    node.title = "Random";

    // Give it a description
    node.description = "Multiply something";

    // Is this node should be re-executed when running loop?
    node.dynamic = true;

    // ========= Port Format ==========
    // ... = { PortName: DataType }
    // Data type can be custom function

    // Output port
    // Let's declare as variable too for easy access
    var outputs = handle.outputs = {
        Result : Number
    };

    // Input port
    var inputs = handle.inputs = {
        A : Number,
        B : function(data){
        	// data is the value the output port of connected node
        	return Number(data) + 12;
        },
    };

    // Property port
    // This port will syncronize it's value with other node
    var properties = handle.properties = {
    	"Always Zero?":Boolean
    }

    // Run function when all inputs port are collected
    node.run = function(){
    	console.log('Processing', inputs.A, inputs.B);

    	if(properties['Always Zero?']){
    		outputs.Result = 0;
    		return;
    	}

    	// The port property is handled by the framework for it's reactiveness
    	outputs.Result = inputs.A * inputs.B;

    	// Just output it to the console it you're not use any node for debugging
    	console.log("Result:", outputs.Result);
    }
});

// Create the node to the view
sketch.createNode('math/multiply', {x:20, y:20});
```

### Get created node list
Blackprint does expose model and components through `sketch.scope('modelName')`.
```js
var nodeHandler = sketch.scope('nodes'); // Get model
var nodeList = sketch.scope('a-node'); // Get components list
var cablesHandler = sketch.scope('cables'); // Get model
var cableList = cablesHandler.list; // Get list from model
```

## Contributing
Before we're getting started, let's clone this repository.
```sh
$ git clone --depth 1 https://github.com/Blackprint/Blackprint.git .
$ git clone --depth 1 https://github.com/Blackprint/blackprint.github.io.git ./example

# Create symbolic link to Blackprint's dist folder
# (Windows: need administrator privileges)
$ mklink /D ".\example\dist" "..\dist"

# For linux
$ ln -s dist ./example

# If you have these package on global you can skip this step
$ npm i -g scarletsframe-compiler gulp

# It could be installed locally without `-g`
```

## Starting the server
```sh
$ gulp
```

After starting gulp, you will being redirected to your browser automatically.

## Modifying the code
The `/example/public` folder have default `index.html` for getting started, and your `css` and `js` should be written into `/example/src` or `/src` folder and your browser should being refreshed automatically.
The compiler already have versioning, so you don't need to press CTRL+F5 every time you modify your code in `/src`.
But usually you want to modify some parameter on the `/gulpfile.js` for customize it.

## Compiling the code
The compilation process will minify your code and also run Babel transpiler to support low end browser.
```sh
$ gulp compile
```