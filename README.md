<p align="center"><a href="#" target="_blank" rel="noopener noreferrer"><img width="150" src="https://avatars2.githubusercontent.com/u/61224306?s=150&v=4" alt="Blackprint"></a></p>

<h1 align="center">Blackprint</h1>
<p align="center">A general purpose node to node visual scripting interface for lowering programming language's steep learning curve, and introduce an easy way to experimenting with your beautiful project for other developer.</p>

<p align="center">
    <a href='https://github.com/Blackprint/Blackprint/blob/master/LICENSE'><img src='https://img.shields.io/badge/License-MIT-brightgreen.svg' height='20'></a>
    <a href='https://discord.gg/cNrBnCFy7q'><img src='https://img.shields.io/discord/840593315157245972.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2' height='20'></a>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/11073373/82104644-e9d5e900-9741-11ea-9689-fc01ddfa81ab.gif">
</p>

<p align="center">
    Blackprint Editor is built using ScarletsFrame to deliver better <a href="https://krausest.github.io/js-framework-benchmark/current.html">performance</a> and <a href="https://github.com/ScarletsFiction/ScarletsFrame/wiki#advanced-example">features</a>. Blackprint Engine is distributed separately. Please use WebKit based browser like Chromium or Safari for better Blackprint Editor's performance.
</p>

## Documentation
> Warning: This project haven't reach it stable version<br>
> Please share this project with your friend.<br>
> Maybe someone skilled like you interested to improve this open source project.<br>
> And because of their contribution, you can enjoy the improved Blackprint :)

Please visit the [Wiki](https://github.com/Blackprint/Blackprint/wiki) for the documentation.

## Blackprint Roadmap
Engine = Blackprint's engine

- [ ] Javascript Engine
  - [ ] Browser
  - [ ] Node.js
  - [ ] Deno
- [ ] Blackprint Editor
  - [ ] Importable editor for different project
- [ ] PHP Engine
- [ ] Marketplace or Package Manager (to make it easier for developer to import their nodes to another available engine).
- [ ] Engine's performance benchmark

---

The JS and PHP engine is already usable. JavaScript engine and the editor for browser currently is the main focus. PHP, Node.js, and Deno engine could have some changes on the future.

When you're using Blackprint, make sure you specify the fixed version on your packages.json or CDN link to avoid breaking changes.

Blackprint will follow semantic versioning after reach v1.0.0. Currently if the version number **v0.\*.0** have increased it may have **breaking changes**, while **v0.0.\*** increment may have **new feature or bug fixes**.

## Blackprint Engine
- [JavaScript Engine](https://github.com/Blackprint/engine-js)
- [PHP Engine](https://github.com/Blackprint/engine-php)
- Python Engine

Blackprint Engine that being considered:
- C#
- Java
- Rust

Planned Code Generation:
- Dockerfile

## Some Note
Each engine may have different node compatibilities.<br>
For the example:
 - WebAudio is **only compatible** in the browser.
 - Web server is **not compatible** in the browser.

---

Currently Blackprint will act as an interface for each engine. You will need to write code on how to handle Blackprint node with your library in different programming language.

To use it on NodeJS, Deno, or other JavaScript runtime, you can export it to JSON and use [engine-js](https://github.com/Blackprint/engine-js#example). But it doesn't mean exporting is just like a magic, you also need to write `registerNode` and `registerInterface` on the target engine. Except if someone already write the interface on target engine you can easily plug and play.

## Motivation
<details>
  <summary>Personal story</summary>
  FYI, I have used UE4 Blueprint since 2021. Developing a visual script by connecting nodes was my unfinished project since 2014 with ActionScript3 (Adobe Flash). It was very tough because I almost know nothing how to make curve for the cable. Well, it's not professional to tell a story about my very young age with programming. But the time was passed and I have a feeling like I can continue my old project with my current skill. Thank you Apple for bringing WebKit and Google for V8 engine, and also for some other people who bringing the advanced web technologies.
</details>

The main target of the project is to help developers to modify their program's logic while the program is still running. With proper custom script it can be used to manage IoT, Docker container connections, or virtual cable for electrical stuff. Well, it may feel like a dream but it can be turned into the reality.

Some of the interface design is inpired by UE4 Blueprint, it was designed and could be modified with CSS. I will redesign it after the project reach final stage. Currently this haven't being developed with ES6 modules because the hot node reload mechanism is little different.

## License
MIT

### Note
This project is free to use, because I bring this for our future.<br>
If you use this for commercial project, please consider sponsoring<br>
the people who work behind the Blackprint project.

But if you use Blackprint for creating another free open source project<br>
it may be awesome (๑˃ᴗ˂)ﻭ