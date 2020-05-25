<p align="center"><a href="#" target="_blank" rel="noopener noreferrer"><img width="150" src="https://avatars2.githubusercontent.com/u/61224306?s=150&v=4" alt="Blackprint"></a></p>

<h1 align="center">Blackprint</h1>
<p align="center">A node to node visual scripting.</p>

<p align="center">
    <a href='https://patreon.com/stefansarya'><img src='https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fstefansarya%2Fpledges&style=for-the-badge' height='20'></a>
    <a href='https://github.com/Blackprint/Blackprint/blob/master/LICENSE'><img src='https://img.shields.io/badge/License-MIT-brightgreen.svg' height='20'></a>
</p>

This library built using ScarletsFrame to maintain it's [performance](https://krausest.github.io/js-framework-benchmark/current.html) and [simplicity](https://github.com/ScarletsFiction/ScarletsFrame/wiki#advanced-example). If you want to start new project with the framework, it's better to use the [template](https://github.com/StefansArya/scarletsframe-default) because it also have the [compiler](https://github.com/StefansArya/scarletsframe-compiler).

<p align="center">
  <img src="https://user-images.githubusercontent.com/11073373/82104644-e9d5e900-9741-11ea-9689-fc01ddfa81ab.gif">
</p>

## Using on your project
This library is depend on ScarletsFrame to control every elements, template, namespace, and event listener. Please follow [this link](https://github.com/ScarletsFiction/ScarletsFrame/wiki/Installation) to get the minified js link.

To use it on NodeJS, Deno, or other JavaScript runtime, you can export it to JSON and use [interpreter-js](https://github.com/Blackprint/interpreter-js#example). But it doesn't mean exporting is just like a magic, you also need to write `registerNode` and `registerInterface` on the target interpreter. But if this project is still alive, Blackprint may have a package manager where developer can port their nodes to another available interpreter.

Below are the list of programming language where Blackprint can run.

- [JavaScript Interpreter](https://github.com/Blackprint/interpreter-js)
- [PHP Interpreter](https://github.com/Blackprint/interpreter-php)
- [C++ Interpreter](https://github.com/Blackprint/interpreter-cpp) `Unfinished`
- Rust Interpreter `Still being planned, waiting C++`
- Python Interpreter `Still being planned, waiting C++`
- Vlang Interpreter `Still being planned, waiting C++`
- C++ in PHP Interpreter `Still being planned, waiting C++`

Instead of using interpreter, the JavaScript version may be possible to be converted into the target language itself using [TypeScript Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API). But compiled and interpreted node will have different use cases, for the example if you compiled it into C you will need to recompile and restart your program to while interpreted node doesn't need to be compiled or restarted.

### Load Blackprint required files
There are styles, template, and scripts that need to be loaded.

```html
<!-- Must be loaded first -->
<script src="https://cdn.jsdelivr.net/npm/blackprint-interpreter@latest/dist/interpreter.min.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/blackprint/blackprint/dist/blackprint.min.css">
<script src="https://cdn.jsdelivr.net/npm/scarletsframe@0.28.5/dist/scarletsframe.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/blackprint/blackprint/dist/blackprint.html.js"></script>
<script src="https://cdn.jsdelivr.net/gh/blackprint/blackprint/dist/blackprint.min.js"></script>
```

## Documentation
> Warning: This project haven't reach it stable version<br>
> If you use this on your project please put a link or information to this repository.<br>
> Don't be too stingy to share..<br>
> Maybe someone skilled like you interested to improve this open source project.<br>
> And because of their contribution, you can enjoy the improved Blackprint :)

```js
// Create Blackprint, `sketch` in this documentation will refer to this
var sketch = new Blackprint.Sketch();

// Get the container and attach it into the DOM (If you're not using sf-views for routing)
document.body.appendChild(sketch.cloneContainer());
```

## Node element registration
[Default node](https://github.com/Blackprint/Blackprint/tree/master/src/Blackprint/nodes) type that was used by example above is distributed along this library. For other node type, we can create our implementation on how that node will control the HTML like [this example](https://github.com/Blackprint/blackprint.github.io/tree/master/src/nodes). So we use it like below:

### Register new node interface type
An interface is designed for communicate the node handler with the HTML elements. Blackprint is using ScarletsFrame to help control the element templating system.

```js
// -> (node identifier, options, callback)
Blackprint.registerInterface('button', {
    // `self` will extend from Blackprint.Node
    extend: Blackprint.Node,

    // Path in window.templates
    template:'Blackprint/nodes/default.html'
}, function(self){
    // self = ScarletsFrame component handler (that control the HTML element)

    // If the element would have value that can be exported to JSON
    // It must being set inside options object
    self.options = {};

    // Run after this component was initialized
    self.init = function(){
        // You can use it like jQuery
        self.$el('.button').on('click', function(ev){

            // We call the node handler that using this component
            // `handle` from sketch.registerNode('', (handle, node)=>{})
            self.handle.onclicked(ev);
        });
    }
});

// Small example for using registered element above
// -> (namespace, callback)
Blackprint.registerNode('myspace/button', function(handle, node){
    // Use node handler from sketch.registerInterface('button')
    node.type = 'button';
    node.title = "My simple button";

    // Called after `.button` have been clicked
    handle.onclicked = function(ev){
        console.log("Henlo", ev);
    }
});
```

## Node handler registration
This is where we register our logic with Blackprint.<br>
This supposed to run on NodeJS too, so don't control any HTML element inside this.<br>
And don't declare or use variable outside of function context/scope.<br>
Just let the `node` control your `handle`.

```js
// Register a new node
// -> (namespace, callback)
Blackprint.registerNode('math/multiply', function(handle, node){
    // handle = Blackprint flow handler
    // node = ScarletsFrame element handler

    // Give it a title
    node.title = "Random";

    // Give it a description
    node.description = "Multiply something";

    // If the node would have value that can be exported to JSON
    // It must being set inside options object
    node.options = {};

    //> We will use `default` node type, so let this empty or undefined
    // node.type = undefined;

    // ... Other information below ...
});
```

### Reserved handler property
`handle` here is the Blackprint flow handler from the example above.

|Property|Description|
|---|---|
|inputs|An array of input port registration|
|outputs|An array of output port registration|
|properties|An array of node property registration `Still draft feature`|
|importing|A boolean indicating if this node is being imported/created|

Below are reserved property that filled with function/callback

|Property|Arguments|Description|
|---|---|---|
|init|`()`|Callback function to be run after current handle and all node was initialized|
|request|`(targetPort, sourceNode)`|Callback when other node's input port are requesting current node's output value|
|update|`(Cable)`|Callback when current input value are updated from the other node's output port|
|imported|`(options)`|This is a callback after node was created, imported options should be handled here|

For the detailed example you can see from [this repository](https://github.com/Blackprint/blackprint.github.io/blob/master/src/js/register-handler.js).

## Node port registration
The port must be registered on the `handle` and Blackprint will create internal control with ScarletsFrame so the port can being used for sending or obtaining data from other node's port.

```js
// ========= Port Format ==========
// ... = { PortName: DataType }

// Output port
handle.outputs = {
    // Declare Result as a output with Number data type
    Result : Number,

    // Declare Finish for trigger to other connected port's input callback
    Finish : Function
};

// Input port
// Let's declare as `inputs` variable too, for easy access
var inputs = handle.inputs = {
    // Declare A and validate this input as Number data type
    A : Number,

    // Declare B that will being called if any value
    // on connected output port was updated
    B : Blackprint.PortListener(Number, function(Port){
        // Port.value
    }),

    // Declare Start as a callback to start the multiplication
    Start : function(/* arguments */){
        // arguments are passed from the caller/output port of connected node

        // Let's call declared function below
        startMultiply();
    },
};

function startMultiply(){
    handle.outputs.Result = inputs.A * inputs.B;

    handle.outputs.Finish("We can send", "arguments too");
}
```

## Node event
Node event can be registered after the handle was initialized.<br>
To register a callback for an event you need to call `node.on('event.name', function(args){})`.

|Event Name|Arguments|Description|
|---|---|---|
|cable.connect|`(Cable, isOwner)`|Trigger when a cable was connected to a port, isOwner is boolean indicating if it was created from current node|
|cable.disconnect|`(Cable)`|Trigger when a cable was disconnected from a port|
|cable.created|`(Cable)`|Trigger when a cable was created from a port|
|port.menu|`({port:Port, menu:DropDowns})`|Trigger when port menu is going to be created|
|node.menu|`(DropDowns)`|Trigger when node menu is going to be created|

Arguments on the table above with `{...}` is a single object.<br>
`DropDowns` is an array, and you can push a callback or nested menu inside it.

```js
node.on('port.menu', function(data){
    data.menu.push({
        title:"With callback",
        callback:function(){...}
    });

    data.menu.push({
        title:"Callback with arguments",
        args:[1, 2],
        callback:function(one, two){...}
    });

    data.menu.push({
        title:"Callback with context",
        context:data.port,
        callback:function(one, two){
            // this === data.port
        }
    });

    data.menu.push({
        title:"When mouse over the dropdown item",
        hover:function(){...},
        unhover:function(){...},
    });

    data.menu.push({
        title:"Deep level menu",
        deep:[{
            title:"Level 1",
            deep:[{
                title:"Level 2",
                deep:[{...}]
            }]
        }]
    });
})
```

## Import Blackprint nodes
If you have exported Blackprint into JSON, then you can easily import it like below:
```js
// After imported it will automatically appended into the DOM container
var nodes = sketch.importJSON('{...}');
// nodes = [node, node, ...]
```

### Create single Blackprint node
To create new node and put it on the DOM you can call<br>
`sketch.createNode(namespace, options)`<br>

Namespace is the registered node handler from `sketch.registerNode`.<br>
Options is a value for the registered node element from `sketch.registerInterface`.<br>

```js
// Create the node to the view
var node = sketch.createNode('math/multiply', {x:20, y:20});
// node = ScarletsFrame component
// node.handle == the node handler
```

### Get created node list
Blackprint does expose model and components through `sketch.scope('modelName')`.
```js
var nodeList = sketch.scope('nodes').list;
var connectionList = sketch.scope('cables').list;
```

### Blackprint options
Currently the available options still limited

|name|value|
|---|---|
|visualizeFlow|`true/false`|

```js
sketch.settings(name, value);
```

### Export Blackprint nodes
The nodes can be exported as JSON, but it's like the node namespace, position, value, and the connections.
```js
var str = sketch.exportJSON();
// {"math/multiply":[...], ...}
```

## Contributing
Before we're getting started, let's clone this repository.
```sh
$ git clone --depth 1 https://github.com/Blackprint/Blackprint.git .
$ git clone --depth 1 https://github.com/Blackprint/blackprint.github.io.git ./example
$ git clone --depth 1 https://github.com/Blackprint/interpreter-js.git ./interpreter-js

# Create symbolic link to Blackprint's dist folder
# (Windows: may need administrator privileges)
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

## Modifying the code
The `/example/public` folder have default `index.html` for getting started, and your `css` and `js` should be written into `/example/src` or `/src` folder and your browser should being refreshed automatically.
The compiler already have versioning, so you don't need to press CTRL+F5 every time you modify your code in `/src`.
But usually you want to modify some parameter on the `/gulpfile.js` for customize it.

## Compiling the code
The compilation process will minify your code and also run Babel transpiler to support low end browser.
```sh
$ gulp compile
```

### Note
Please support me or I will cry :(

<a href='https://patreon.com/stefansarya'><img src='https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fstefansarya%2Fpledges&style=for-the-badge' height='20'></a>