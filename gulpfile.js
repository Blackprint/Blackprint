process.stdout.write("Loading scarletsframe-compiler\r");
let compileEngineOnly = false;
let isCI = process.env.CI;
let editorOnly = false;
let withNodes = !editorOnly && true;

let Gulp = require('gulp');
let os = require('os');
let notifier = os.platform() === 'win32'
	? new require('node-notifier/notifiers/balloon')() // For Windows
	: require('node-notifier'); // For other OS

// Engine for Node.js or Browser
let compileTargets = editorOnly ? {} : {
	// Compiler for Blackprint Engine
	'engine-js':{
		versioning: !isCI && 'editor/dev.html',
		// stripURL:'editor/',

		js:{
			file:'dist/engine.min.js',
			wrapped: true,
			header:"/* Blackprint \n MIT Licensed */",
			combine:[
				'engine-js/src/constructor/CustomEvent.js',
				'engine-js/src/_init.js',
				'engine-js/src/constructor/Port/_init.js',

				// Combine files from all directory recursively
				'engine-js/src/**/*.js',
			],
		}
	},
	// Compiler for Blackprint Remote Engine
	'remote-control-js':{
		versioning: !isCI && 'editor/dev.html',
		// stripURL:'editor/',

		js:{
			file:'dist/remote-control.min.js',
			wrapped: true,
			header:"/* Blackprint \n MIT Licensed */",
			combine:[
				'remote-control/js/src/_init.js',

				// Combine files from all directory recursively
				'remote-control/js/src/**/*.js',
			],
		}
	},
};

// Editor and Sketch library for Browser
if(!compileEngineOnly){
	// Use `default` if you're not exporting project as library/module
	if(!isCI){
		compileTargets.default = {
			versioning: 'editor/dev.html',
			stripURL: 'editor/',

			js:{
				file:'editor/assets/myjs.min.js',

				// Will be processed from the top to bottom
				combine:[
					// Combine files from all directory recursively
					'editor/src/**/*.js',
				],
			},
			scss:{
				file:'editor/assets/mycss.min.css',
				combine:'editor/src/**/*.scss',
			},
			sf:{
				file:'editor/assets/custom.sf',
				combine:'editor/src/**/*.sf',
			},
		};
	}

	if(!editorOnly){
		// This needed if you want to maintain Blackprint's source code
		// You can specify other property if you exporting something
		compileTargets.blackprint = {
			versioning: !isCI && 'editor/dev.html',
			// stripURL:'editor/',

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
		};
	}
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
			baseDir:'editor/',
			index:'index.html',
		    routes: {
		        "/dist": "dist"
		    }
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
		if(withNodes && !compileEngineOnly)
			require('./blackprint-config-loader.js')(SFC, Gulp);
	},
	beforeInit(){
		if(withNodes && !compileEngineOnly && !isCI)
			SFC.clearGenerateImport('editor/dev.html');
	},

	// ===== Modify me, add slash as last character if it's directory =====
	path: compileTargets
}, Gulp);