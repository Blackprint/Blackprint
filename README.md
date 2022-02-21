<p align="center"><a href="#" target="_blank" rel="noopener noreferrer"><img width="150" src="https://user-images.githubusercontent.com/11073373/141421213-5decd773-a870-4324-8324-e175e83b0f55.png" alt="Blackprint"></a></p>

<h1 align="center">Blackprint</h1>
<p align="center">A general purpose visual programming interface for lowering programming language's steep learning curve, and introduce an easy way to experimenting with your beautiful project for other developer.</p>

<p align="center">
  <a href='https://github.com/Blackprint/Blackprint/blob/master/LICENSE'><img src='https://img.shields.io/badge/License-MIT-brightgreen.svg' height='20'></a>
  <a href='https://github.com/Blackprint/Blackprint/actions/workflows/build.yml'><img src='https://github.com/Blackprint/Blackprint/actions/workflows/build.yml/badge.svg?branch=master' height='20'></a>
  <a href='https://www.npmjs.com/package/@blackprint/sketch'><img src='https://img.shields.io/npm/v/@blackprint/sketch.svg' height='20'></a>
  <a href='https://www.jsdelivr.com/package/npm/@blackprint/sketch'><img src='https://data.jsdelivr.com/v1/package/npm/@blackprint/sketch/badge?style=rounded' height='20'></a>
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
> Warning: This project haven't reach it stable version

The documentation haven't been finished, but there are inline documentation on [the template](https://github.com/Blackprint/template-js) and some information on [CONTRIBUTING.md](https://github.com/Blackprint/Blackprint/blob/master/.github/CONTRIBUTING.md#version-conventions) if you want to use Blackprint before reaching v1.0.0.

## Example

If you're looking for minimal sketch example to get started integrate for your editor project:
- [JSBin](https://jsbin.com/bakulux/edit?html,js,output)
- [StackBlitz](https://stackblitz.com/edit/minimal-blackprint?file=index.js)

If you just want to execute exported Blackprint JSON, you can just use the engine. I also provide few simple example for different framework in case you want to use integrate to your frontend framework. For non-browser engine, there are example on it's repository. You can copy and paste the JSON to [Blackprint Editor](https://blackprint.github.io/) to see the nodes arrangement. The example below is using this [arrangement](https://blackprint.github.io/#page/sketch/1#;importSketch:tZHLTsMwEEX_ZdZunEeDiFelVRcguqFLVCETW6lbP6LYqVJV-Xecl5TCEthY9mjuvWfGN_gAcgNlWC35yx7IOxydKy3BOGc6OFnGpbhUgeYO61Lh1aek-bmshPZvw7hdhUESRJgJOxYWudHWSB6okwX0azehy9r9kRdvqCpHskOLYDOQ4ldT-MFvIICECBogafqA4AokCjMEggEBaYqCV9AeEDx3RHgvBePV2jSTMuqVj6MwXY5C2_dFnp5RR7tdh91xobLmQGIESmggiyj0yYo2Xaa_WcdLDxNErcc0tfOJo3QISxBoqrwBPHkm39RX4zuELLlDiP8NYd0j-M1sh_3iHXVHvKulE6W8zvq9dRIPdFk4wqmpbR7yxq0vz_5kGlZfv2eta-eMxnvRvSbFss9aZn1Ums6tN1LkZ85-TrFteD6Yt18).
- [Multiply - Event Listener](https://jsbin.com/gaxisop/edit?html,js,output)
- [Multiply - ScarletsFrame](https://jsbin.com/nigarib/edit?html,js,output)
- [Multiply - Vue](https://jsbin.com/bocehax/edit?html,js,output)
- [Multiply - React](https://jsbin.com/watogus/edit?js,output)

## Available Shortcut for Blackprint Sketch
| <div style="width:300px">Mouse + Keyboard</div> | <div style="width:300px">Touchscreen</div> | Target | Description |
| --- | --- | --- | --- |
| `LeftClick + move` | `1 touch + move` | Container | Select nodes and cable branch |
| `Middle/Right click + move` | `2 touch + move` | Container | Move the container |
| `Ctrl + MouseWheel` | - | Container | Zoom the container |
| `RightClick` | `tap hold 1 sec` | Node, Cable, Container | Context menu |
| `Ctrl + LeftClick` | - | Cable | Create cable branch |
| `Ctrl + RightClick` | - | Port, Cable | Node suggestion |
| `Ctrl + Alt + LeftClick` | - | Anything | ScarletsFrame's element inspector (development mode) |

---

## Blackprint Roadmap
This roadmap could be changed on the future, feel free to request feature or report an issue.

Blackprint Engine
<table>
<thead>
  <tr>
    <th rowspan="2">Name</th>
    <th colspan="2">JavaScript</th>
    <th rowspan="2">PHP</th>
    <th rowspan="2">Golang</th>
    <th rowspan="2">Python</th>
    <th rowspan="2">C#</th>
  </tr>
  <tr>
    <th>Browser</th>
    <th>Deno/Node.js</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>Blackprint Engine</td>
    <td><a href='https://www.npmjs.com/package/@blackprint/engine'><img src='https://img.shields.io/npm/v/@blackprint/engine.svg?include_prereleases' height='20'></a></td>
    <td><a href='https://www.npmjs.com/package/@blackprint/engine'><img src='https://img.shields.io/npm/v/@blackprint/engine.svg?include_prereleases' height='20'></a></td>
    <td><a href='https://packagist.org/packages/blackprint/engine'><img src='https://img.shields.io/github/v/release/blackprint/engine-php?include_prereleases' height='20'></a></td>
    <td><a href='https://github.com/Blackprint/engine-go'><img src='https://img.shields.io/github/v/release/blackprint/engine-go?include_prereleases' height='20'></a></td>
    <td>-</td>
    <td>-</td>
  </tr>
  <tr>
    <td>Minimal example</td>
    <td><a href='https://github.com/Blackprint/blackprint.github.io/blob/master/src/global/sampleList.js'>✔️ Link</a></td>
    <td><a href='https://github.com/Blackprint/engine-js/tree/master/example'>✔️ Link</a></td>
    <td><a href='https://github.com/Blackprint/engine-php/tree/master/example'>✔️ Link</a></td>
    <td><a href='https://github.com/Blackprint/engine-go/tree/main/example'>✔️ Link</a></td>
    <td>-</td>
    <td>-</td>
  </tr>
  <tr>
    <td>Environment variables</td>
    <td>✔️</td>  <td>✔️</td>  <td>-</td>  <td>-</td>  <td>-</td>  <td>-</td>
  </tr>
  <tr>
    <td>Import modules from URL</td>
    <td>✔️</td>  <td>✔️</td>  <td>-</td>  <td>-</td>  <td>-</td>  <td>-</td>
  </tr>
  <tr>
    <td>Pausable node data flow</td>
    <td>-</td>  <td>-</td>  <td>-</td>  <td>-</td>  <td>-</td>  <td>-</td>
  </tr>
  <tr>
    <td>Remote control</td>
    <td>🚧</td>  <td>🚧</td>  <td>-</td>  <td>-</td>  <td>-</td>  <td>-</td>
  </tr>
</tbody>
</table>

> 🚧 = Under development

With remote control you can easily manage connection to the target environment (Node.js/PHP/etc) from the browser. But currently I'm still considering the most efficient and secure way to sync the data remotely, and also which data will be synced. So this will take some time before it's really implemented. Please always run your app inside of container (like Docker) if you allow someone to remote control your system.

Example case where you may need remote control:
 - Creating Discord.js bot (because the library doesn't have support for browser)
   - Support for browser was dropped due to CORS at the Discord endpoint
 - Collaboratively work with your friend
 - Remotely modify your running application in realtime

---

- [ ] Blackprint Sketch (this repository)
  - [x] Mirrored sketch on detachable window
  - [x] Mini sketch for preview
  - [x] Hot Reload
  - [x] Export single sketch to JSON
  - [x] Importable minimal sketch for different project
  - [x] Select and move multiple nodes at once
    - [x] Bulk delete
    - [ ] Add feature to put nodes into a group
    - [ ] Create a function from nodes
  - [x] Clicked nodes should be moved on front of the other nodes (z-index)
  - [x] Automatically put cable on suitable port when it's dropped on top of a node
  - [x] Add feature to arrange cable (cable branching)
  - [ ] Add node for variables
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
    - It's possible to use Snowpack or something else, but it currently can't compile `.sf`
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
Each engine may have different compatibilities.<br>
For the example:
 - WebAudio is **only compatible** in the browser.
 - Web server is **not compatible** in the browser.

---

Blackprint will act as an interface for each engine. To use it on NodeJS, Deno, or other JavaScript runtime, you can export it to JSON and use [engine-js](https://github.com/Blackprint/engine-js#example). But it doesn't mean exporting is just like a magic, you also need to write `registerNode` and `registerInterface` on the target engine. Except if someone already write the Blackprint Module (node and interface) on target engine, you can easily plug and play the module.

## Contributing
To make things easier, please make sure to read the [Contributing Guide](https://github.com/Blackprint/Blackprint/blob/master/.github/CONTRIBUTING.md) before creating a issue/request.

## License
Blackprint is a **MIT licensed** open source project and completely free to use.

But please consider sponsoring the people who work and contribute amount of effort to maintain and develop new features for this project. Because without their contribution, this project may get slowed down or possible to getting paused.
