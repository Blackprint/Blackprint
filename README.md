<p align="center"><a href="#" target="_blank" rel="noopener noreferrer"><img width="150" src="https://avatars2.githubusercontent.com/u/61224306?s=150&v=4" alt="Blackprint"></a></p>

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
| Name | JS (Browser) | JS (Node.js / Deno) | PHP | Python |
| --- | --- | --- | --- | ---|
| Blackprint Engine | ✔️ [Link](https://github.com/Blackprint/engine-js) | ✔️ [Link](https://github.com/Blackprint/engine-js) | ✔️ [Link](https://github.com/Blackprint/engine-php) | - |
| Minimal example | ✔️ [Link](https://github.com/Blackprint/blackprint.github.io/blob/master/src/js/register-handler.js) | ✔️ [Link](https://github.com/Blackprint/engine-js/tree/master/example) | ✔️ [Link](https://github.com/Blackprint/engine-php/tree/master/example) | - |
| Environment variables | ✔️ | ✔️ | - | - |
| Import addons from URL | ✔️ | ✔️ | - | - |

---

- [ ] Blackprint Editor
  - [x] Basic nodes editor
  - [x] Hot Reload
  - [x] Detachable window (with ScarletsFrame)
  - [x] [Demo](https://blackprint.github.io) ([Repository](https://github.com/Blackprint/blackprint.github.io))
  - [x] Add support for Environment Variables
  - [ ] Add hint for beginner guide
  - [ ] Node list editor (currently with right click)
  - [ ] Error/log popup or overlay
  - [ ] Multiple workspaces
  - [ ] Importable minimal editor for different project
  - [ ] Pausable node execution
- [ ] Simplify node development for new developer
  - [x] Auto `blackprint.config.js` import
  - [ ] Support ES6 modules importing system
- [ ] Better documentation or website
- [ ] Tutorial and samples
- [ ] Blackprint Nodes Package Manager or Marketplace
- [ ] Engine's performance benchmark

---

Currently the main focus is Blackprint engine and sketch for browser. PHP, Node.js, and Deno engine could have some changes on the future.

## Other possible plan
Blackprint Engine:
- C#
- Lua
- Java (or maybe Kotlin)
- Rust
- Go
- C++

Planned Code Generation:
- Dockerfile
- Create a compiler for compiling 1 Blackprint file into different engine easily

If you're looking for AST, currently you can use the exported Blackprint JSON.

## Some Note
Each engine may have different node compatibilities.<br>
For the example:
 - WebAudio is **only compatible** in the browser.
 - Web server is **not compatible** in the browser.

---

Currently Blackprint will act as an interface for each engine. You will need to write code on how to handle Blackprint node with your library on different programming language.

To use it on NodeJS, Deno, or other JavaScript runtime, you can export it to JSON and use [engine-js](https://github.com/Blackprint/engine-js#example). But it doesn't mean exporting is just like a magic, you also need to write `registerNode` and `registerInterface` on the target engine. Except if someone already write the Addons (node and interface) on target engine, you can easily plug and play.

## Motivation
<details>
  <summary>Personal story</summary>
  FYI, I have used UE4 Blueprint since 2021. Developing a visual script by connecting nodes was my unfinished project since 2014 with ActionScript3 (Adobe Flash). It was very tough because I almost know nothing how to make curve for the cable on AS3. Well, it's not professional to tell a story about my very young age with programming. But the time was passed and I have a feeling like I can continue my old project with my current skill. Thank you Apple for bringing WebKit and Google for V8 engine, and also for everyone who bringing the advanced web technologies.
</details>

The main target of the project is to help developers to modify their program's logic while the program is still running. You can create a custom node so it can be used to manage IoT, Docker container connections, or maybe like virtual cable for electrical stuff. Well, it may feel like a dream but it can be turned into the reality if the community getting bigger.

## Contributing
To make things easier, please make sure to read the [Contributing Guide](https://github.com/Blackprint/Blackprint/blob/master/.github/CONTRIBUTING.md) before creating a issue/request.

## License
Blackprint is a **MIT licensed** open source project and completely free to use.

But please consider sponsoring the people who work and contribute amount of effort to maintain and develop new features for this project. Because without their contribution, this project may get slowed down or possible to getting paused.
