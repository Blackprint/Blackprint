process.stdout.write("Loading scarletsframe-compiler\r");

var os = require('os');
var notifier = os.platform() === 'win32'
	? new require('node-notifier/notifiers/balloon')() // For Windows
	: require('node-notifier'); // For other OS

require("scarletsframe-compiler")({
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

	onCompiled: function(which){
		notifier.notify({
			title: 'Gulp Compilation',
			message: which+' was finished!',
			timeout: 4, time: 4,
		});
	},

	// ===== Modify me, add slash as last character if it's directory =====
	path:{
		// Use `default` if you're not exporting project as library/module
		default:{
			versioning:'example/index.html',
			stripURL:'example/',

			js:{
				file:'example/assets/myjs.min.js',

				// Will be processed from the top to bottom
				combine:[
					// Start private wrapper from here
					'example/src/init/init.js',

					// Combine files from all directory recursively
					'example/src/**/*.js',

					// Remove this end wrapper from /**/* matches
					'!example/src/init/end.js',

					// End of wrapper
					'example/src/init/end.js',
				],
			},
			scss:{
				file:'example/assets/mycss.min.css',
				combine:'example/src/**/*.scss',
			},
			html:{
				file:'example/assets/myhtml.html.js',
				combine:'example/src/**/*.html',

				// Watch changes and apply changes directly without combine to one file
				// static:['resources/plate/**/*.php', 'resources/views/**/*.php'],
			}
		},

		// This needed if you want to maintain Blackprint's source code
		// You can specify other property if you exporting something
		blackprint:{
			versioning:'example/index.html',
			stripURL:'example/',

			js:{
				file:'dist/blackprint.min.js',
				header:"/* Blackprint \n MIT Licensed */",
				combine:[
					// Start private wrapper from here
					'src/init/Blackprint.js',

					// Import classes first, or sf.component can't extend them
					'src/constructor/Node.js',
					'src/constructor/*.js',

					// Combine all files but not recursive
					'src/*.js',

					// Combine files from all directory recursively
					'src/**/*.js',

					// Remove this end wrapper from /**/* matches
					'!src/init/end.js',

					// End private wrapper for Blackprint
					'src/init/end.js',
				],
			},
			scss:{
				file:'dist/blackprint.min.css',
				header:"/* Blackprint, MIT Licensed */",
				combine:'src/**/*.scss',
			},
			html:{
				file:'dist/blackprint.html.js',
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'Blackprint',
				combine:'src/**/*.html',
			},
			sf:{
				file:'dist/blackprint.sf',
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'Blackprint',
				combine:'src/**/*.sf',
			}
		},

		// Compiler for Blackprint Interpreter
		'interpreter-js':{
			versioning:'example/index.html',
			stripURL:'example/',

			js:{
				file:'dist/interpreter.min.js',
				header:"/* Blackprint \n MIT Licensed */",
				combine:[
					// Start private wrapper
					'interpreter-js/src/init/begin.js',

					// Combine files from all directory recursively
					'interpreter-js/src/**/*.js',

					// Remove this end wrapper from /**/* matches
					'!interpreter-js/src/init/end.js',

					// End private wrapper
					'interpreter-js/src/init/end.js',
				],
			}
		},

		// Compiler for Input Addons
		'nodes-input':{
			versioning:'example/index.html',
			stripURL:'example/',

			js:{
				file:'dist/nodes-input.min.js',
				header:"/* Blackprint \n MIT Licensed */",
				combine:[
					'nodes/input/_wrapper/begin.js',
					'nodes/input/**/*.js',
					'!nodes/input/_wrapper/end.js',
					'nodes/input/_wrapper/end.js',
				],
			},
			scss:{
				file:'dist/nodes-input.min.css',
				header:"/* Blackprint, MIT Licensed */",
				combine:'nodes/input/**/*.scss',
			},
			html:{
				file:'dist/nodes-input.html.js',
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'BPAO/Input',
				combine:'nodes/input/**/*.html',
			},
			sf:{
				file:'dist/nodes-input.sf',
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'BPAO/Input',
				combine:'nodes/input/**/*.sf',
			}
		},

		// Compiler for WebAudio Addons
		'nodes-webaudio':{
			versioning:'example/index.html',
			stripURL:'example/',

			js:{
				file:'dist/nodes-webaudio.min.js',
				header:"/* Blackprint \n MIT Licensed */",
				combine:[
					'nodes/webaudio/_wrapper/begin.js',
					'nodes/webaudio/**/*.js',
					'!nodes/webaudio/_wrapper/end.js',
					'nodes/webaudio/_wrapper/end.js',
				],
			},
			scss:{
				file:'dist/nodes-webaudio.min.css',
				header:"/* Blackprint, MIT Licensed */",
				combine:'nodes/webaudio/**/*.scss',
			},
			html:{
				file:'dist/nodes-webaudio.html.js',
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'BPAO/WebAudio',
				combine:'nodes/webaudio/**/*.html',
			},
			sf:{
				file:'dist/nodes-webaudio.sf',
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'BPAO/WebAudio',
				combine:'nodes/webaudio/**/*.sf',
			}
		},

		// Compiler for WebAnimation Addons
		'nodes-webanimation':{
			versioning:'example/index.html',
			stripURL:'example/',

			js:{
				file:'dist/nodes-webanimation.min.js',
				header:"/* Blackprint \n MIT Licensed */",
				combine:[
					'nodes/webanimation/_wrapper/begin.js',
					'nodes/webanimation/**/*.js',
					'!nodes/webanimation/_wrapper/end.js',
					'nodes/webanimation/_wrapper/end.js',
				],
			},
			scss:{
				file:'dist/nodes-webanimation.min.css',
				header:"/* Blackprint, MIT Licensed */",
				combine:'nodes/webanimation/**/*.scss',
			},
			html:{
				file:'dist/nodes-webanimation.html.js',
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'BPAO/WebAnimation',
				combine:'nodes/webanimation/**/*.html',
			},
			sf:{
				file:'dist/nodes-webanimation.sf',
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'BPAO/WebAnimation',
				combine:'nodes/webanimation/**/*.sf',
			}
		},

		// Compiler for WebAnimation Addons
		'nodes-graphics':{
			versioning:'example/index.html',
			stripURL:'example/',

			js:{
				file:'dist/nodes-graphics.min.js',
				header:"/* Blackprint \n MIT Licensed */",
				combine:[
					'nodes/graphics/_wrapper/begin.js',
					'nodes/graphics/**/*.js',
					'!nodes/graphics/_wrapper/end.js',
					'nodes/graphics/_wrapper/end.js',
				],
			},
			scss:{
				file:'dist/nodes-graphics.min.css',
				header:"/* Blackprint, MIT Licensed */",
				combine:'nodes/graphics/**/*.scss',
			},
			html:{
				file:'dist/nodes-graphics.html.js',
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'BPAO/Graphics',
				combine:'nodes/graphics/**/*.html',
			},
			sf:{
				file:'dist/nodes-graphics.sf',
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'BPAO/Graphics',
				combine:'nodes/graphics/**/*.sf',
			}
		},

		// Compiler for WebAnimation Addons
		'nodes-decoration':{
			versioning:'example/index.html',
			stripURL:'example/',

			js:{
				file:'dist/nodes-decoration.min.js',
				header:"/* Blackprint \n MIT Licensed */",
				combine:[
					'nodes/decoration/_wrapper/begin.js',
					'nodes/decoration/**/*.js',
					'!nodes/decoration/_wrapper/end.js',
					'nodes/decoration/_wrapper/end.js',
				],
			},
			scss:{
				file:'dist/nodes-decoration.min.css',
				header:"/* Blackprint, MIT Licensed */",
				combine:'nodes/decoration/**/*.scss',
			},
			html:{
				file:'dist/nodes-decoration.html.js',
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'BPAO/Decoration',
				combine:'nodes/decoration/**/*.html',
			},
			sf:{
				file:'dist/nodes-decoration.sf',
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'BPAO/Decoration',
				combine:'nodes/decoration/**/*.sf',
			}
		},
	},
}, require('gulp'));