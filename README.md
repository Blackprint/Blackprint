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
  <video src="https://user-images.githubusercontent.com/11073373/185776245-e883cadb-631e-497c-9fec-1de60098d4b1.mp4">
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
Documentation is included in [the editor](https://blackprint.github.io/#;bpdocs:Home), if you want to help contributing or modify you can fork the editor and modify files in [this directory](https://github.com/Blackprint/blackprint.github.io/tree/master/docs). Blackprint Engine and Sketch does have a TypeScript definition files, so if you working with TypeScript you may see a code suggestion in your code editor like Visual Studio Code.

## Example

If you're looking for minimal sketch example to get started integrate for your editor project:
- [JSBin (CDN)](https://jsbin.com/bakulux/edit?html,js,output)
- [StackBlitz (with Vite)](https://stackblitz.com/edit/blackprint-vite?file=vite.config.js,src%2Fmain.ts&terminal=dev)

If you just want to execute exported Blackprint JSON, you can just use the engine. I also provide few simple example for different framework in case you want to use integrate to your frontend framework. For non-browser engine, there are example on it's repository. You can copy and paste the JSON to [Blackprint Editor](https://blackprint.github.io/) to see the nodes arrangement. The example below is using this [arrangement](https://blackprint.github.io/#page/sketch/1#;importSketch:tZHLTsMwEEX_ZdZpnCciXkGrLorohooVqpCJrdatH1HsVClV_h3HSaQWlsAm8ozu3HtmcoF3wBeQmjaCPW0Av8He2spghEqqwoOhTPBTHSpmkaokevgQpDxWNVeu1pSZhyjMEeVmLGelVkYLFsqDgeCXXlxVjf0TJ9YSWY1U2y6AxUCJnvXOrXwBDjgKoAWc53cBnAHHURHAp-9yChiE3u1YDd02gFVPhV5XaCM4ZfVct5NF7C3uR4c88w7x6GC8OnarUGJJf_So_5yIaBjgJADJFeBZHLlISdoewb2MZZWjCOPOUevGuuhxdIh0c4pIZwCPDs6JfDe7ASlSD5LcgCT_BjL3IO5Qy-HoaE3sHq0bYXklzld6Z50mA2MRecR0RJST-DrqhRnXvvpd0-Lq_D1x3lirFdrwvpomUp-YFT4wz31gdh2wELw8Mvpzo2XLyiGi-wI).
- [Multiply - Event Listener](https://jsbin.com/gaxisop/edit?html,js,output)
- [Multiply - ScarletsFrame](https://jsbin.com/nigarib/edit?html,js,output)
- [Multiply - Vue](https://jsbin.com/bocehax/edit?html,js,output)
- [Multiply - React](https://jsbin.com/watogus/edit?js,output)

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
This roadmap could be changed on the future, feel free to request feature or report an issue.

<table>
<thead>
  <tr>
    <th rowspan="2">Name</th>
    <th colspan="2">JavaScript</th>
    <th rowspan="2">PHP</th>
    <th rowspan="2" title="Please request on Discord if you want this updated">Golang</th>
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
    <td><a href="https://pypi.org/project/blackprint-engine/"><img src='https://img.shields.io/pypi/v/blackprint-engine' height='20'></a></td>
    <td>-</td>
  </tr>
  <tr>
    <td>Minimal example</td>
    <td><a href='https://github.com/Blackprint/blackprint.github.io/blob/master/src/global/sampleList.js'>✔️ Link</a></td>
    <td><a href='https://github.com/Blackprint/engine-js/tree/master/example'>✔️ Link</a></td>
    <td><a href='https://github.com/Blackprint/engine-php/tree/master/example'>✔️ Link</a></td>
    <td><a href='https://github.com/Blackprint/engine-go/tree/main/example'>✔️ Link</a></td>
    <td><a href='https://github.com/Blackprint/engine-python/tree/main/example'>✔️ Link</a></td>
    <td>-</td>
  </tr>
  <tr>
    <td>Environment variables</td>
    <td>✔️</td>  <td>✔️</td>  <td>✔️</td>  <td><a href="https://github.com/Blackprint/engine-go/pull/1">🚧</a></td>  <td>✔️</td>  <td>-</td>
  </tr>
  <tr>
    <td>Import modules from URL</td>
    <td>✔️</td>  <td>✔️</td>  <td title="You need to use package manager to install node modules">✖</td>  <td title="You need to manually import the node module">✖</td>  <td title="You need to manually import the node module">✖</td>  <td title="You need to use package manager to install the node module">✖</td>
  </tr>
  <tr>
    <td>Pausable and routable data flow</td>
    <td>🧪</td>  <td>🧪</td>  <td>🧪</td>  <td><a href="https://github.com/Blackprint/engine-go/pull/1">🚧</a></td>  <td>🧪</td>  <td>-</td>
  </tr>
  <tr>
    <td>Remote control</td>
    <td>🧪</td>  <td>🧪</td>  <td title="It may be useful for Socket application, but I think only useful for that">❔</td>  <td>-</td>  <td>🧪</td>  <td>-</td>
  </tr>
  <tr>
    <td>Code generation</td>
    <td>🧪</td>  <td>🧪</td>  <td>🚧</td>  <td>🚧</td>  <td>🧪</td>  <td>🚧</td>
  </tr>
</tbody>
</table>

> 🚧 = Under development (In the current working plan)<br>
> 🧪 = Experimental/Alpha stage (Being tested and may have rapid changes)<br>
> ✖  = Not supported (Either it can't be implemented or it has better solution)<br>
> ❔  = Should we add the feature? (Please start a discussion if you need it)<br>
> \-   = Haven't been decided<br>

---

With remote control you can easily manage connection to the target environment (Node.js/PHP/etc) from the browser. Please always run your app inside of isolated container (like Docker) if you allow someone to remote control your system.

Example case where you may need remote control:
 - Creating Discord.js bot (because the library doesn't have support for browser)
   - Support for browser was dropped due to CORS at the Discord endpoint
 - Collaboratively work with your friend
 - Remotely modify your running application in runtime

---

- [ ] Blackprint Sketch (this repository)
  - [x] Mirrored sketch on detachable window
  - [x] Mini sketch for preview
  - [x] Hot Reload
  - [x] Export single sketch to JSON
  - [x] Importable minimal sketch for different project
  - [x] Select and move multiple nodes at once
    - [x] Bulk delete
    - [x] Add feature to put nodes into a group
  - [x] Clicked nodes should be moved on front of the other nodes (z-index)
  - [x] Automatically put cable on suitable port when it's dropped on top of a node
  - [x] Add feature to arrange cable (cable branching)
  - [x] Add variable's node
  - [x] Add feature to hide some unused port on a node
  - [x] Add feature to import node skeleton (use default node, and no execution)
  - [ ] Create addons for VS Code for previewing exported Blackprint
    - [ ] Add JSON preview for Visual Studio Code
  - [x] Add TypeScript definition file
- [ ] Blackprint Editor ([repository](https://github.com/Blackprint/blackprint.github.io))
  - [x] [Online editor](https://blackprint.github.io)
  - [x] Basic nodes editor
  - [x] Detachable window and minimap
  - [x] Add Environment Variables editor
  - [x] Import sketch from URL
  - [ ] Move current sketch with minimap
  - [x] Node list editor (right click and from side panel)
  - [x] Error/log popup or overlay
  - [x] Show overview or notice when importing nodes from URL
  - [ ] Multiple sketch workspaces or tabs
    - [ ] Export multiple sketch workspaces to JSON
- [x] Auto `blackprint.config.js` import
- [x] Better documentation
  - [x] Add in-editor node documentation in a tooltip
  - [x] Nodes docs generator
  - [x] Add TypeScript definition file
- [ ] Blackprint Nodes Package Manager
  - [x] Use NPM registry for Node.js/Deno/Browser

---

Currently the main focus is Blackprint for JavaScript. Some engine for PHP, and Golang could have some changes in the future.

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

If you want to compile and start the editor's web server on your machine, you can run the command below:

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

### Build and run the unit test
If you're trying to run the unit test, you can use `npm run compile` and then `npm test`.

```sh
$ cd /your/project/folder
$ git clone --depth 1 --recurse-submodules https://github.com/Blackprint/Blackprint.git .

# You can also use npm or yarn instead of pnpm
$ pnpm i
$ npm run compile
$ npm test
```

## Stability
Breaking changes may happen every increment of `v0.x.0`, while `v0.0.x` usually will have new feature or bug fixes.

After version v1.0.0 any feature addition may have long delay before actually being merged.<br>
Feel free to request a feature or give a feedback at this moment.

## License
Blackprint is a **MIT licensed** open source project and completely free to use.

But please consider sponsoring the people who work and contribute amount of effort to maintain and develop new features for this project. Because without their contribution, this project may get slowed down or possible to getting paused.
