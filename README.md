<p align="center"><a href="#" target="_blank" rel="noopener noreferrer"><img width="150" src="https://user-images.githubusercontent.com/11073373/141421213-5decd773-a870-4324-8324-e175e83b0f55.png" alt="Blackprint"></a></p>

<h1 align="center">Blackprint</h1>
<p align="center">A general purpose node to node visual programming interface for lowering programming language's steep learning curve, and introduce an easy way to experimenting with your beautiful project for other developer.</p>

<p align="center">
  <a href='https://github.com/Blackprint/Blackprint/blob/master/LICENSE'><img src='https://img.shields.io/badge/License-MIT-brightgreen.svg' height='20'></a>
  <a href='https://github.com/Blackprint/Blackprint/actions/workflows/build.yml'><img src='https://github.com/Blackprint/Blackprint/actions/workflows/build.yml/badge.svg?branch=master' height='20'></a>
  <a href='https://www.npmjs.com/package/@blackprint/sketch'><img src='https://img.shields.io/npm/v/@blackprint/sketch.svg' height='20'></a>
  <a href='https://discord.gg/cz9rh3a7d6'><img src='https://img.shields.io/discord/915881655921704971.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2' height='20'></a>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/11073373/82104644-e9d5e900-9741-11ea-9689-fc01ddfa81ab.gif">
</p>

<p align="center">
  <b>Blackprint Sketch</b> is built using ScarletsFrame (<a href="https://krausest.github.io/js-framework-benchmark/current.html">performance</a> and <a href="https://github.com/ScarletsFiction/ScarletsFrame/wiki#advanced-example">features</a>).
  <br><b>Blackprint Engine</b> is distributed separately for different runtime environment.
  <br><b>Blackprint Editor</b> is created as a <a href="https://github.com/Blackprint/blackprint.github.io">online IDE</a> for browser.
</p>

## Note
Please use Chromium based browser for better rendering performance.

Default Node's UI design was inspired by UE4 Blueprint and can be modified with HTML/CSS. If you're using Blackprint Editor you can choose different theme on the settings, and here's the <a href="https://github.com/Blackprint/blackprint.github.io/blob/ed9cb35fdd0fb79acf2bede4d007e3afd2b40399/src/node-design.scss#L47-L67">code</a> for reference if you want to create your own theme.

## Documentation
> Warning: This project haven't reach it stable version<br>
> Please share this project with your friend.<br>
> Maybe someone skilled like you interested to improve this open source project.<br>
> And because of their contribution, you can enjoy the improved Blackprint :)

The documentation haven't been finished, but there are inline documentation on [the template](https://github.com/Blackprint/template-js) and some information on [CONTRIBUTING.md](https://github.com/Blackprint/Blackprint/blob/master/.github/CONTRIBUTING.md#version-conventions) if you want to use Blackprint before reaching v1.0.0.

## Example

If you're looking for minimal sketch example to get started integrate for your editor project:
- [JSBin](https://jsbin.com/bakulux/edit?html,js,output)
- [StackBlitz](https://stackblitz.com/edit/minimal-blackprint?file=index.js)

If you just want to execute exported Blackprint JSON, you can just use the engine. I also provide few simple example for different framework in case you want to use integrate to your frontend framework. For non-browser engine, there are example on it's repository. You can copy and paste the JSON to [Blackprint Editor](https://blackprint.github.io/) to see the nodes arrangement. The example below is using this [arrangement](https://blackprint.github.io/#page/sketch/1#;importSketch:tZHLbsIwEEX_ZdYmTgKpGq8oiEWrsinLClVubIHBL8UOCkL59zovKbTLthvLHs2998z4Bh9AbqAMqyR_2QF5h6P31hGMC6ajk2NciksZae6xtgovPyUtzrYUOrwN424ZR0kUYybcUJgVRjsjeaRODtCv3YS2lf8jL15TZQeyfYNg3ZPiV3MIg99AAIkR1ECy7AHBFUgS5wgEAwLSHA68hGaP4LklwjspGC9Xph6VSad8HITZYhC6ri8J9Ix62u46bo8LlRUHkiJQQgOZJXFIVrRuM8PNeW4DTJQ0AdNUPiQO0j5sjkBTFQzgKTCFpq6a3iHk8zuE9N8QVh1C2Mym3y_eUn_E20p6YeV10h-s52lPl8cDnBrbpiFv3IXy5E_GYfX1e9aq8t5ovBPta1QsuqxF3kVl2dR6LUVx5uznFJuaF7158wU).
- [Multiply - Event Listener](https://jsbin.com/gaxisop/edit?html,js,output)
- [Multiply - ScarletsFrame](https://jsbin.com/nigarib/edit?html,js,output)
- [Multiply - Vue](https://jsbin.com/bocehax/edit?html,js,output)
- [Multiply - React](https://jsbin.com/watogus/edit?js,output)

## Blackprint Roadmap
This roadmap could be changed on the future, feel free to request feature or report an issue.
Blackprint Engine
| Name | JS (Browser) | JS (Node.js / Deno) | PHP | Go | Python | C# |
| --- | --- | --- | --- | --- | --- | --- |
| Blackprint Engine | [![JS](https://img.shields.io/npm/v/@blackprint/engine.svg?include_prereleases)](https://www.npmjs.com/package/@blackprint/sketch) | [![JS](https://img.shields.io/npm/v/@blackprint/engine.svg?include_prereleases)](https://www.npmjs.com/package/@blackprint/sketch) | [![PHP](https://img.shields.io/github/v/release/blackprint/engine-php?include_prereleases)](https://packagist.org/packages/blackprint/engine) | [![Go](https://img.shields.io/github/v/release/blackprint/engine-go?include_prereleases)](https://github.com/Blackprint/engine-go) | - | - |
| Minimal example | ✔️ [Link](https://github.com/Blackprint/blackprint.github.io/blob/master/src/global/sampleList.js) | ✔️ [Link](https://github.com/Blackprint/engine-js/tree/master/example) | ✔️ [Link](https://github.com/Blackprint/engine-php/tree/master/example) | ✔️ [Link](https://github.com/Blackprint/engine-go/tree/main/example) | - | - |
| Environment variables | ✔️ | ✔️ | - | - | - | - |
| Import modules from URL | ✔️ | ✔️ | - | - | - | - |
| Remote connection control | - | - | - | - | - | - |
| Pausable node execution | - | - | - | - | - | - |

---

- [ ] Blackprint Sketch (this repository)
  - [x] Mirrored sketch on detachable window
  - [x] Mini sketch for preview
    - [ ] Move the sketch container from mini sketch
  - [x] Hot Reload
  - [x] Export single sketch to JSON
  - [x] Importable minimal sketch for different project
  - [ ] Select and move multiple nodes at once
    - [ ] Add feature to put nodes into a group
  - [x] Clicked nodes should be moved on front of the other nodes (z-index)
  - [x] Automatically put cable on suitable port when it's dropped on top of a node
  - [x] Add feature to arrange cable (cable branching)
  - [ ] Add feature to hide some unused port on a node
  - [ ] Add feature to import node skeleton (use default node, and no execution)
    - [ ] Create addons for VS Code for previewing exported Blackprint
    - [ ] Add JSON preview for Visual Studio Code
- [ ] Blackprint Editor ([repository](https://github.com/Blackprint/blackprint.github.io))
  - [x] [Demo](https://blackprint.github.io)
  - [x] Basic nodes editor
  - [x] Detachable window (with ScarletsFrame)
  - [x] Add Environment Variables editor
  - [x] Import sketch from URL
  - [ ] Move current sketch with minimap
  - [ ] Node list editor (currently with right click)
  - [x] Error/log popup or overlay
  - [x] Show overview or notice when importing nodes from URL
  - [ ] Multiple sketch workspaces or tabs
    - [ ] Export multiple sketch workspaces to JSON
- [ ] Simplify node development for new developer
  - [x] Auto `blackprint.config.js` import
  - [ ] Add example for using ES6 modules importing system
    - It's possible to use SkyPack or something else, but it currently can't compile `.sf`
- [ ] Better documentation
- [ ] Nodes docs generator
- [ ] Blackprint Nodes Package Manager
  - [x] Use NPM registry for Node.js/Deno/Browser

---

Currently the main focus is Blackprint for JavaScript. PHP, and Golang engine could have some changes on the future.

## Other possible plan
Blackprint Engine:
- **Lua** (because it's embeddable language)
- **Java** (or maybe Kotlin)
- **Rust** (may get removed from this list)
- **C++** (for Arduino if possible)

## Some Note
Each engine may have different node compatibilities.<br>
For the example:
 - WebAudio is **only compatible** in the browser.
 - Web server is **not compatible** in the browser.

---

Currently Blackprint will act as an interface for each engine. To use it on NodeJS, Deno, or other JavaScript runtime, you can export it to JSON and use [engine-js](https://github.com/Blackprint/engine-js#example). But it doesn't mean exporting is just like a magic, you also need to write `registerNode` and `registerInterface` on the target engine. Except if someone already write the Blackprint Module (node and interface) on target engine, you can easily plug and play.

## Contributing
To make things easier, please make sure to read the [Contributing Guide](https://github.com/Blackprint/Blackprint/blob/master/.github/CONTRIBUTING.md) before creating a issue/request.

## License
Blackprint is a **MIT licensed** open source project and completely free to use.

But please consider sponsoring the people who work and contribute amount of effort to maintain and develop new features for this project. Because without their contribution, this project may get slowed down or possible to getting paused.
