<p align="center"><a href="#" target="_blank" rel="noopener noreferrer"><img width="150" src="https://user-images.githubusercontent.com/11073373/141421213-5decd773-a870-4324-8324-e175e83b0f55.png" alt="Blackprint"></a></p>

<h1 align="center">Blackprint</h1>
<p align="center">A general purpose node to node visual programming interface for lowering programming language's steep learning curve, and introduce an easy way to experimenting with your beautiful project for other developer.</p>

<p align="center">
  <a href='https://github.com/Blackprint/Blackprint/blob/master/LICENSE'><img src='https://img.shields.io/badge/License-MIT-brightgreen.svg' height='20'></a>
  <a href='https://discord.gg/cNrBnCFy7q'><img src='https://img.shields.io/discord/840593315157245972.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2' height='20'></a>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/11073373/82104644-e9d5e900-9741-11ea-9689-fc01ddfa81ab.gif">
</p>

<p align="center">
  <b>Blackprint Editor</b> is built using ScarletsFrame (<a href="https://krausest.github.io/js-framework-benchmark/current.html">performance</a> and <a href="https://github.com/ScarletsFiction/ScarletsFrame/wiki#advanced-example">features</a>).
  <br><b>Blackprint Engine</b> is distributed separately for different runtime environment.
</p>

<p align="center">
  When using the editor/sketch library, please use WebKit based browser like Chromium or Safari for better rendering performance.
</p>

## Documentation
> Warning: This project haven't reach it stable version<br>
> Please share this project with your friend.<br>
> Maybe someone skilled like you interested to improve this open source project.<br>
> And because of their contribution, you can enjoy the improved Blackprint :)

Please go to this [link](http://stefansarya.gitbook.io/blackprint) for the documentation and version conventions on [CONTRIBUTING.md](https://github.com/Blackprint/Blackprint/blob/master/.github/CONTRIBUTING.md#version-conventions) if you want to use Blackprint before reaching v1.0.0.

Feel free to open new discussion when your custom nodes was breaking on the new updates 😁

## Blackprint Roadmap
This roadmap could be changed on the future, feel free to request feature or report an issue.
Blackprint Engine
| Name | JS (Browser) | JS (Node.js / Deno) | PHP | Go | Python | C# |
| --- | --- | --- | --- | --- | --- | --- |
| Blackprint Engine | ✔️ [Link](https://github.com/Blackprint/engine-js) | ✔️ [Link](https://github.com/Blackprint/engine-js) | ✔️ [Link](https://github.com/Blackprint/engine-php) | ✔️ [Link](https://github.com/Blackprint/engine-go) | - | - |
| Minimal example | ✔️ [Link](https://github.com/Blackprint/blackprint.github.io/blob/master/src/js/register-handler.js) | ✔️ [Link](https://github.com/Blackprint/engine-js/tree/master/example) | ✔️ [Link](https://github.com/Blackprint/engine-php/tree/master/example) | ✔️ [Link](https://github.com/Blackprint/engine-go/tree/main/example) | - | - |
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
  - [ ] Create addons for VS Code for previewing exported Blackprint
  - [ ] Select and move multiple nodes at once
    - [ ] Add feature to put nodes into a group
  - [ ] Clicked nodes should be moved on front of the other nodes (z-index)
- [ ] Blackprint Editor ([repository](https://github.com/Blackprint/blackprint.github.io))
  - [x] [Demo](https://blackprint.github.io)
  - [x] Basic nodes editor
  - [x] Detachable window (with ScarletsFrame)
  - [x] Add Environment Variables editor
  - [x] Import sketch from URL
  - [ ] Move current sketch with minimap
  - [ ] Auto attach cable to first suitable port
  - [ ] Add hint for beginner guide
  - [ ] Node list editor (currently with right click)
  - [ ] Error/log popup or overlay
  - [x] Show overview or notice when importing nodes from URL
  - [ ] Multiple sketch workspaces or tabs
    - [ ] Export multiple sketch workspaces to JSON
- [ ] Simplify node development for new developer
  - [x] Auto `blackprint.config.js` import
  - [ ] Add example for using ES6 modules importing system
    - It's possible to use SkyPack or something else, but it currently can't compile `.sf`
- [ ] Better documentation or website
- [ ] Tutorial and samples
- [ ] Blackprint Nodes Package Manager or Marketplace
- [ ] Engine's performance benchmark

---

Currently the main focus is Blackprint for browser. PHP, Node.js, and Deno engine could have some changes on the future.

## Other possible plan
Blackprint Engine:
- **Lua** (because it's embeddable language)
- **Java** (or maybe Kotlin)
- **Rust** (may get removed from this list)
- **C++** (for Arduino if possible)

Planned Code Generation:
- **Dockerfile** (for networks/container relations)

If you're looking for AST, currently you can use the exported Blackprint JSON.

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
