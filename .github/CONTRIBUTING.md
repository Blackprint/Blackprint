## Contributing to Blackprint
First of all, thanks for taking the time to contribute!<br>
To help you contribute to this project we have created some guidelines for our contributors.

### Table of Content
 - [Terms](#terms)
 - [What Contribution Do We Accept?](#what-contribution-do-we-accept)
 - [Requesting an Feature](#requesting-an-feature)
 - [Requesting Nodes](#requesting-nodes)
 - [The Build Script: how it works](#the-build-script-how-it-works)
 - [Bundled file location](#bundled-file-location)
 - [Blackprint Node and Interface Naming Conventions](#blackprint-node-and-interface-naming-conventions)
 - [Version Conventions](#version-conventions)
 - [Financial Contribution](#financial-contribution)

---

### Terms
Here are some terms that we will use in this repo:

1. "Technology" is used to describe a software, libraries, tool, framework, etc...
2. "Engine" refers to Blackprint Engine that run on some programming language.

---

### What Contribution Do We Accept?
Any well-intentioned contribution is welcomed, for the example:
1. Bug fixes
2. New feature (please create issue with the use case to be reviewed first)
3. Improve documentation or guidelines
4. Financial contribution
5. Promote and spread the words about Blackprint
6. Joining the community and help other people

---

### Requesting an Feature
To request an feature, you can create an issue in the repository. Please follow these simple guidelines:

1. Search for other issues already requesting the feature
2. If an issue doesn't exist, create an issue with the template on GitHub Issue
3. Please create separate issues for each feature

---

### Requesting Nodes
Blackprint Engine is available on some programming language. If you want to request Blackprint nodes for other technology (like library that developed by someone else) please create issue on their repository instead or ask the community.

---

### The Build Script: how it works
`npm start`: Run development server for Blackprint (Sketch + Editor + Nodes + Engine).<br>
This will only compile `.js, .html, .scss, .sf` file extension.
 - Sketch library: `/src`
 - Engine library: `/engine-js`
   - If you want to only focus on this engine, please set `compileEngineOnly` on `gulpfile.js` to `true`
 - Editor: `/example`
 - Nodes: `/nodes`
   - Any folder with `blackprint.config.js` will be considered as Blackprint Addons and will be added to Editor automatically if it's not disabled

`npm run compile`: Compile, minify files, and run Babel for Blackprint (Sketch + Editor + Nodes + Engine).<br>
This will only compile `.js, .html, .scss, .sf` file extension, similar with `npm start`.

---

#### Bundled file location
When you run the build script above you may get these files.
 - Sketch library: `/dist/*.js` and `/dist/*.css`
 - Engine library: `/engine-js/dist/engine.js` and `/engine-js/dist/engine.es6.js`
 - Editor: `/example/assets/*.js` and `/example/assets/*.css`
 - Nodes: `/dist/*.min.js`, `/dist/*.es6.js`, `/dist/*.sf.js`, `/dist/*.sf.css`

The file names that has different export target:
 - `*.sf.js` and `*.sf.js` can only being imported/run on Browser
 - `*.es6.js` is ES6 module that can be imported for Deno

---

### Blackprint Node and Interface Naming Conventions
> Currently this is for JavaScript nodes.

The node and interface should be registered with capitalized letter with slash with following format:
 - Node: `LibraryName/[Category or Feature name]/NodeName`
 - Interface: `BPAO/LibraryName/[Category or Feature name]/NodeName`

> BPAO: Blackprint Addons.

The example below
```js
// ------ Node ------
Blackprint.registerNode('Graphics/Converter/GIF', ...);
// You can easily find and create from the Blackprint Editor from the node list.
// Create from the editor menu: Graphics -> Converter -> GIF

// Create with JS
instance.createNode('Graphics/Converter/GIF'); // instance = sketch/engine object

// ------ IFace ------
Blackprint.registerInterface('BPAO/Graphics/Converter/GIF', ...);
// Blackprint will create the DOM Element with lowercased tag name: <bpao-graphics-converter-gif>

// Get the iface from the DOM
let iface = $('bpao-graphics-converter-gif')[0].model;
let node = iface.node;
```

---

### Version Conventions
Blackprint haven't follow semantic versioning before v1.0.0, you will need to specify the fixed version when using Blackprint Engine or Sketch library to avoid breaking changes.

The version naming follows the rules of given a version number v**MAJOR.MINOR.PATCH**, increment the:

**MAJOR version** will stay 0 until all roadmap has been completed.<br>
**MINOR version** may has new feature or possible breaking changes.<br>
**PATCH version** when you add functionality and bug fixes that backwards compatible.<br>

A new release will be published when new feature are added or a bug was fixed. If the minor version is updated, please see the [CHANGELOG.md](https://github.com/Blackprint/Blackprint/blob/master/CHANGELOG.md) to make sure the breaking changes doesn't affect your project.

---

### Financial Contribution
Blackprint is a MIT licensed open source project and completely free to use.<br>
However, the amount of effort needed to maintain and develop new features for the project is not sustainable without proper financial backing.

You can support Blackprint development financially from the link on repository's **Sponsor** button.