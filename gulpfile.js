process.stdout.write("Loading scarletsframe-compiler\r");
let compileEngineOnly = false;

let Gulp = require('gulp');
let os = require('os');
let notifier = os.platform() === 'win32'
	? new require('node-notifier/notifiers/balloon')() // For Windows
	: require('node-notifier'); // For other OS

// Engine for Node.js or Browser
let compileTargets = {
	// Compiler for Blackprint Engine
	'engine-js':{
		versioning:'example/index.html',
		// stripURL:'example/',

		js:{
			file:'dist/engine.min.js',
			wrapped: true,
			header:"/* Blackprint \n MIT Licensed */",
			combine:[
				// Start private wrapper
				'engine-js/src/_init.js',
				'engine-js/src/constructor/Port/_init.js',

				// Combine files from all directory recursively
				'engine-js/src/**/*.js',
			],
		}
	},
};

// Editor and Sketch library for Browser
if(!compileEngineOnly){
	Object.assign(compileTargets, {
		// Use `default` if you're not exporting project as library/module
		default:{
			versioning:'example/index.html',
			stripURL:'example/',

			js:{
				file:'example/assets/myjs.min.js',

				// Will be processed from the top to bottom
				combine:[
					// Combine files from all directory recursively
					'example/src/**/*.js',
				],
			},
			scss:{
				file:'example/assets/mycss.min.css',
				combine:'example/src/**/*.scss',
			},
			sf:{
				file:'example/assets/custom.sf',
				combine:'example/src/**/*.sf',
			},
		},

		// This needed if you want to maintain Blackprint's source code
		// You can specify other property if you exporting something
		blackprint:{
			versioning:'example/index.html',
			// stripURL:'example/',

			js:{
				file:'dist/blackprint.min.js',
				wrapped: true,
				header:"/* Blackprint \n MIT Licensed */",
				combine:[
					// Start private wrapper from here
					'src/_init.js',

					// Import classes first, or sf.component can't extend them
					'src/constructor/*.js',

					// Combine all files but not recursive
					'src/*.js',

					// Combine files from all directory recursively
					'src/**/*.js',
				],
			},
			sf:{
				file:'dist/blackprint.sf',
				wrapped: true,
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'Blackprint',
				combine:[
					// Start private wrapper from here
					'src/_init.sf',

					// Combine files from all directory recursively
					'src/**/*.sf'
				],
			}
		},
	});
}

let SFC = require("scarletsframe-compiler")({
	// Start the server
	browserSync:{
		// proxy:'http://myjs.sandbox',
		port: process.env.PORT || 6789, // Accessible-> http://localhost:6789
		ghostMode: false, // Use synchronization between browser?
		ui: false,
		open: false,

		// Standalone server with BrowserSync
		server:{
			baseDir:'example/',
			index:'index.html',
		}
	},

	// Recompile some files before being watched on startup
	// You may want to check if the git history was changed
	// And then set this to true with JavaScript
	startupCompile: false,

	// Choose your default editor
	// You must register "subl" or "code" to the PATH environment variable.
	// https://www.sublimetext.com/docs/command_line.html
	//
	// https://code.visualstudio.com/docs/editor/command-line#_code-is-not-recognized-as-an-internal-or-external-command
	editor: 'sublime', // only 'sublime' or 'vsc' that currently supported

	// Optional if you want to remove source map on production mode
	includeSourceMap: process.env.production || true,
	hotReload:{
		html: true,
		sf: true,
		js: true,
		scss: true
	},

	onCompiled(which){
		notifier.notify({
			title: 'Gulp Compilation',
			message: which+' was finished!',
			timeout: 4, time: 4,
		});
	},

	onInit(){
		if(!compileEngineOnly)
			require('./blackprint-config-loader.js')(SFC, Gulp);
	},
	beforeInit(){
		if(!compileEngineOnly)
			SFC.clearGenerateImport('example/index.html');
	},

	// ===== Modify me, add slash as last character if it's directory =====
	path: compileTargets
}, Gulp);