<p align="center"><a href="#" target="_blank" rel="noopener noreferrer"><img width="150" src="https://user-images.githubusercontent.com/11073373/141421213-5decd773-a870-4324-8324-e175e83b0f55.png" alt="Blackprint"></a></p>

<h1 align="center">Blackprint</h1>
<p align="center">A general-purpose visual programming interface designed to reduce the learning curve of programming languages and provide an intuitive way to experiment with your projects for other developers.</p>

<p align="center">
  <a href='https://github.com/Blackprint/Blackprint/blob/master/LICENSE'><img src='https://img.shields.io/badge/License-MIT-brightgreen.svg' height='20'></a>
  <a href='https://github.com/Blackprint/Blackprint/actions/workflows/build.yml'><img src='https://github.com/Blackprint/Blackprint/actions/workflows/build.yml/badge.svg?branch=master' height='20'></a>
  <a href='https://www.npmjs.com/package/@blackprint/sketch'><img src='https://img.shields.io/npm/v/@blackprint/sketch.svg' height='20'></a>
  <a href='https://www.jsdelivr.com/package/npm/@blackprint/sketch'><img src='https://data.jsdelivr.com/v1/package/npm/@blackprint/sketch/badge?style=rounded' height='20'></a>
  <a href='https://www.jsdelivr.com/package/npm/@blackprint/sketch'><img src='https://img.shields.io/bundlephobia/minzip/%40blackprint/sketch' height='20'></a>
  <a href='https://discord.gg/cz9rh3a7d6'><img src='https://img.shields.io/discord/915881655921704971.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2' height='20'></a>
</p>

https://user-images.githubusercontent.com/11073373/185776245-e883cadb-631e-497c-9fec-1de60098d4b1.mp4

<p align="center">
  <b>Blackprint Sketch</b> is built using ScarletsFrame (<a href="https://krausest.github.io/js-framework-benchmark/current.html">performance</a> and <a href="https://github.com/ScarletsFiction/ScarletsFrame/wiki#advanced-example">features</a>).
  <br><b>Blackprint Engine</b> is distributed separately for different runtime environments.
  <br><b>Blackprint Editor</b> is available as an <a href="https://github.com/Blackprint/blackprint.github.io">online IDE</a> for web browsers.
</p>

## Browser Requirements
For optimal rendering performance, please use a Chromium-based browser.

## Customization
The default node UI design is inspired by UE4 Blueprint and can be customized using HTML/CSS. In the Blackprint Editor, you can select different themes from the settings. For creating your own theme, refer to the <a href="https://github.com/Blackprint/blackprint.github.io/blob/ed9cb35fdd0fb79acf2bede4d007e3afd2b40399/src/node-design.scss#L47-L67">theme code</a>.

## Documentation
Documentation is available within [the editor](https://blackprint.github.io/#;bpdocs:Home). If you'd like to contribute or make modifications, you can fork the editor and edit files in the [documentation directory](https://github.com/Blackprint/blackprint.github.io/tree/master/docs). Blackprint Engine and Sketch include TypeScript definition files, providing code suggestions in TypeScript-compatible editors like Visual Studio Code.

## Getting Started

### Quick Examples
To get started with integrating Blackprint into your project, check out these minimal sketch examples:

- [JSBin (CDN)](https://jsbin.com/bakulux/edit?html,js,output)
- [StackBlitz (with Vite)](https://stackblitz.com/edit/blackprint-vite?file=vite.config.js,src%2Fmain.ts&terminal=dev)

### Framework Integration Examples
If you want to see how Blackprint works with different frontend frameworks, here are some simple examples:

- [Multiply - Event Listener](https://jsbin.com/gaxisop/edit?html,js,output)
- [Multiply - ScarletsFrame](https://jsbin.com/nigarib/edit?html,js,output)
- [Multiply - Vue](https://jsbin.com/bocehax/edit?html,js,output)
- [Multiply - React](https://jsbin.com/watogus/edit?js,output)

### Using the Engine
If you just want to execute exported Blackprint JSON files, you can use the Blackprint Engine directly. For non-browser engines, examples are available in their respective repositories. You can copy and paste JSON into the [Blackprint Editor](https://blackprint.github.io/) to visualize the node arrangement. The examples above use this [sample arrangement](https://blackprint.github.io/#page/sketch/1#;importSketch:tZHLTsMwEEX_ZdZpnCciXkGrLorohooVqpCJrdatH1HsVClV_h3HSaQWlsAm8ozu3HtmcoF3wBeQmjaCPW0Av8He2spghEqqwoOhTPBTHSpmkaokevgQpDxWNVeu1pSZhyjMEeVmLGelVkYLFsqDgeCXXlxVjf0TJ9YSWY1U2y6AxUCJnvXOrXwBDjgKoAWc53cBnAHHURHAp-9yChiE3u1YDd02gFVPhV5XaCM4ZfVct5NF7C3uR4c88w7x6GC8OnarUGJJf_So_5yIaBjgJADJFeBZHLlISdoewb2MZZWjCOPOUevGuuhxdIh0c4pIZwCPDs6JfDe7ASlSD5LcgCT_BjL3IO5Qy-HoaE3sHq0bYXklzld6Z50mA2MRecR0RJST-DrqhRnXvvpd0-Lq_D1x3lirFdrwvpomUp-YFT4wz31gdh2wELw8Mvpzo2XLyiGi-wI).

---
### Video Example
1. Build Telegram bot with Blackprint

https://github.com/Blackprint/Blackprint/assets/11073373/fe3d767b-e340-4371-8685-ef7a12709e0f

## Available Shortcut for Blackprint Sketch
| Mouse + Keyboard | Touchscreen | Target | Description |
| --- | --- | --- | --- |
| `LeftClick + move` | `1 touch + move` | Container | Select nodes and cable<br>branch |
| `Middle/Right click + move` | `2 touch + move` | Container | Move the container |
| `Ctrl + MouseWheel`<br>`RightClick + MouseWheel` | `3 touch + move` | Container | Zoom the container |
| `RightClick` | `tap hold 1 sec` | Node, Cable, Container | Context menu |
| `Ctrl + LeftClick` | - | Cable | Create cable branch |
| `Ctrl + RightClick` | - | Port, Cable | Node suggestion |
| `Shift + LeftClick` | - | Port | Detach last connected cable |

## Available Shortcut for Blackprint Editor
| Mouse + Keyboard | Touchscreen | Target | Description |
| --- | --- | --- | --- |
| `Ctrl + C` | - | Selected Node | Copy nodes |
| `Ctrl + V` | - | Selected Node | Paste copied nodes |
| `Delete` | - | Selected Node | Delete node |
| `Ctrl + Alt + LeftClick` | - | Anything | ScarletsFrame's element<br>inspector (dev mode) |

---

## Blackprint Roadmap
This roadmap may changed in the future. Feel free to request features or report issues.

> **Important Note**: Each Blackprint node must be rewritten and reimplemented for each programming language. While basic nodes may be available across all languages, some language-specific nodes may not be available to different language.

<table>
<thead>
  <tr>
    <th rowspan="2">Name</th>
    <th colspan="2">JavaScript</th>
    <th rowspan="2">PHP</th>
    <th rowspan="2" title="Please request on Discord if you want this updated">Golang</th>
    <th rowspan="2">Python</th>
    <th rowspan="2">Lua</th>
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
    <td><a href="https://pypi.org/project/blackprint-engine/"><img src='https://img.shields.io/pypi/v/blackprint-engine' height='20'></a></td>
    <!--td><a href="https://github.com/Blackprint/engine-lua"><img src='https://img.shields.io/luarocks/v/blackprint/engine-lua' height='20'></a></td-->
    <td><a href="https://github.com/Blackprint/engine-lua"><img src='https://img.shields.io/badge/gh-0.10-orange' height='20'></a></td>
    <td>-</td>
  </tr>
  <tr>
    <td>Minimal example</td>
    <td><a href='https://github.com/Blackprint/blackprint.github.io/blob/master/src/global/sampleList.js'>✔️ Link</a></td>
    <td><a href='https://github.com/Blackprint/engine-js/tree/master/example'>✔️ Link</a></td>
    <td><a href='https://github.com/Blackprint/engine-php/tree/master/example'>✔️ Link</a></td>
    <td><a href='https://github.com/Blackprint/engine-go/tree/main/example'>✔️ Link</a></td>
    <td><a href='https://github.com/Blackprint/engine-python/tree/main/example'>✔️ Link</a></td>
    <td><a href='https://github.com/Blackprint/engine-lua/tree/main/example'>✔️ Link</a></td>
    <td>-</td>
  </tr>
  <tr>
    <td>Environment variables</td>
    <td>✔️</td>
    <td>✔️</td>
    <td>✔️</td>
    <td><a href="https://github.com/Blackprint/engine-go/pull/1">🚧</a></td>
    <td>✔️</td>
    <td>🧪</td>
    <td>-</td>
  </tr>
  <tr>
    <td>Import modules from URL</td>
    <td>✔️</td>
    <td>✔️</td>
    <td title="You need to use package manager to install node modules">✖</td>
    <td title="You need to manually import the node module">✖</td>
    <td title="You need to manually import the node module">✖</td>
    <td title="You need to use package manager to install the node module">✖</td>
    <td>-</td>
  </tr>
  <tr>
    <td>Pausable and routable data flow</td>
    <td>✔️</td>
    <td>✔️</td>
    <td>🧪</td>
    <td><a href="https://github.com/Blackprint/engine-go/pull/1">🚧</a></td>
    <td>🧪</td>
    <td>🧪</td>
    <td>-</td>
  </tr>
  <tr>
    <td>Remote control</td>
    <td>🧪</td>
    <td>🧪</td>
    <td>✖</td>
    <td>-</td>
    <td>🧪</td>
    <td>🚧</td>
    <td>-</td>
  </tr>
  <tr>
    <td>Code generation</td>
    <td>🧪</td>
    <td>🧪</td>
    <td>🚧</td>
    <td>🚧</td>
    <td>🧪</td>
    <td>🚧</td>
    <td>-</td>
  </tr>
</tbody>
</table>

> 🚧 = Under development (In the current working plan)<br>
> 🧪 = Experimental/Alpha stage (Being tested and may have rapid changes)<br>
> ✖  = Not supported (Either it can't be implemented or it has better solution)<br>
> ❔  = Should we add the feature? (Please start a discussion if you need it)<br>
> \-   = Haven't been decided<br>

---

## Remote Control
Blackprint's remote control feature allows you to easily manage connections to target environments (Node.js, Python, etc.) directly from your browser. For security reasons, please always run your application within an isolated container (like Docker) when allowing remote control access.

Example case where you may need remote control:
- **Discord.js Bots**: Create Discord bots (some library may not work in the browser if the endpoint has CORS)
- **Collaboration**: Work together with team members in real-time
- **Remote Development**: Modify and debug your running applications during runtime

---

## Development Status

- [ ] Blackprint Sketch (this repository)
  - [x] Mirrored sketch on detachable window
  - [x] Mini sketch for preview
  - [x] Hot Reload
  - [x] Export single sketch to JSON
  - [x] Importable minimal sketch for different projects
  - [x] Select and move multiple nodes at once
    - [x] Bulk delete
    - [x] Add feature to put nodes into a group
  - [x] Clicked nodes should be moved to front of other nodes (z-index)
  - [x] Automatically place cables on suitable ports when dropped on nodes
  - [x] Cable arrangement feature (cable branching)
  - [x] Variable nodes
  - [x] Hide unused ports on nodes
  - [x] Import node skeleton feature (use default node, no execution)
  - [ ] VS Code addons for previewing exported Blackprint
    - [ ] JSON preview for Visual Studio Code
  - [x] TypeScript definition file

- [ ] Blackprint Editor ([repository](https://github.com/Blackprint/blackprint.github.io))
  - [x] [Online editor](https://blackprint.github.io)
  - [x] Basic nodes editor
  - [x] Detachable window and minimap
  - [x] Environment Variables editor
  - [x] Import sketch from URL
  - [ ] Move current sketch with minimap
  - [x] Node list editor (right-click and side panel)
  - [x] Error/log popup or overlay
  - [x] Show overview/notice when importing nodes from URL
  - [x] Multiple sketch workspaces or tabs
- [x] Auto `blackprint.config.js` import
- [x] Enhanced documentation
  - [x] In-editor node documentation tooltips
  - [x] Node documentation generator
  - [x] TypeScript definition file
- [x] Blackprint Nodes Package Manager
  - [x] NPM registry support for Node.js/Deno/Browser

---

## Current Focus
The primary development focus is on Blackprint for JavaScript. Support for other languages (PHP, Python, Golang, etc.) will follow the JavaScript implementation roadmap.

## Future Language Support
Potential plans for additional Blackprint Engine implementations:
- **Java** (or Kotlin for Android development)
- **Rust** (for IO and high performance application)
- **Zig** (for Arduino)
- **C++** (for Arduino)

---

## Architecture
Blackprint engine serves as an execution layer for each engine implementation. To use it with Node.js, Deno, or other JavaScript runtimes, you can export your visual programs to JSON and use the [engine-js](https://github.com/Blackprint/engine-js#example).

**Important**: Exporting to JSON is not a complete solution by itself. You'll need to write `registerNode` and `registerInterface` functions for your target engine. However, if someone has already created Blackprint modules (nodes and interfaces) for your target engine, you can easily plug and play those modules.

## Contributing
For getting started, please start from the [Contributing Guide](https://github.com/Blackprint/Blackprint/blob/master/.github/CONTRIBUTING.md) before creating issues or pull request.

### Development Setup
To compile and start the editor's web server locally:

```sh
$ cd /your/project/folder
$ git clone --depth 1 --recurse-submodules https://github.com/Blackprint/Blackprint.git .

# You can also use npm or yarn instead of pnpm
$ pnpm i
$ npm start
 >> [Browsersync] Access URLs:
 >> -----------------------------------
 >> Local: http://localhost:6789
 >> -----------------------------------
```

### Running Tests
To run the unit tests:

```sh
$ cd /your/project/folder
$ git clone --depth 1 --recurse-submodules https://github.com/Blackprint/Blackprint.git .

# You can also use npm or yarn instead of pnpm
$ pnpm i
$ npm run compile
$ npm test
```

## Version Stability
- **Breaking changes** may occur with each `v0.x.0` increment
- **v0.0.x** versions typically include new features and bug fixes
- After **v1.0.0**, new feature additions may experience longer delays before being merged

We welcome any feature requests and feedback at this stage of development.

## License
Blackprint is an **MIT-licensed** open source project, completely free to use.

### Support the Project
Please consider sponsoring the developers who contribute significant effort to maintaining and enhancing this project. Without their contributions, development may slow down or potentially pause.

Your support helps ensure the continued growth and active improvement for Blackprint!
