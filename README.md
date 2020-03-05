# Blackprint
A node to node visual scripting.

## Contributing
Before we're getting started, let's clone this repository.
```sh
$ git clone --depth 1 https://github.com/Blackprint/Blackprint.git

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
The `/public` folder have default `index.html` for getting started, and your `css` and `js` should be written into `/src` folder to get the live reload from browser-sync.
The compiler already have versioning, so you don't need to press CTRL+F5 every time you modify your code in `/src`.
But usually you want to modify some parameter on the `/gulpfile.js` for customize it.

## Compiling the code
The compilation process will minify your code and also run Babel transpiler to support low end browser.
```sh
$ gulp compile
```