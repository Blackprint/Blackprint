process.stdout.write("Loading scarletsframe-compiler\r");

require("scarletsframe-compiler")({
	// Start the server
	browserSync:{
		// proxy:'http://myjs.sandbox',
		port:6789, // Accessible-> http://localhost:6789
		ghostMode: false, // Use synchronization between browser?
		open:false,

		// Standalone server with BrowserSync
		server:{
			baseDir:'example/',
			index:'index.html',
		}
	},

	// Optional if you want to remove source map on production mode
	includeSourceMap: process.env.production || true,
	timestampSourceMap: false,

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
					'src/Blackprint/init/Blackprint.js',

					// Import classes first, or sf.component can't extend them
					'src/Blackprint/nodes/extendable/Node.js',
					'src/Blackprint/nodes/extendable/*.js',
					'src/Blackprint/constructor/*.js',

					// Combine all files but not recursive
					'src/Blackprint/*.js',

					// Combine files from all directory recursively
					'src/Blackprint/**/*.js',

					// Remove this end wrapper from /**/* matches
					'!src/Blackprint/init/end.js',

					// End private wrapper for Blackprint
					'src/Blackprint/init/end.js',
				],
			},
			scss:{
				file:'dist/blackprint.min.css',
				header:"/* Blackprint, MIT Licensed */",
				combine:['src/Blackprint/**/*.scss'],
			},
			html:{
				file:'dist/blackprint.html.js',
				header:"/* Blackprint \n MIT Licensed */",
				prefix:'Blackprint',
				combine:['src/Blackprint/**/*.html'],
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
		}
	},
}, require('gulp'));