process.stdout.write("Loading scarletsframe-compiler\r");

require("scarletsframe-compiler")({
	// Start the server
	browserSync:{
		// proxy:'http://myjs.sandbox',
		port:6789, // Accessible-> http://localhost:6789
		ghostMode: false, // Use synchronization between browser?

		// Standalone server with BrowserSync
		server:{
			baseDir:'example/public/',
			index:'index.html',
		}
	},

	// Optional if you want to remove source map on production mode
	includeSourceMap: process.env.production || true,

	// ===== Modify me, add slash as last character if it's directory =====
	path:{
		// Use `default` if you're not exporting project as library/module
		default:{
			versioning:'example/public/index.html',
			stripURL:'example/public/',

			js:{
				file:'example/public/assets/myjs.min.js',

				// Will be processed from the top to bottom
				combine:[
					'example/src/**/*.js',
				],
			},
			scss:{
				file:'example/public/assets/mycss.min.css',
				combine:'example/src/**/*.scss',
			},
			html:{
				file:'example/public/assets/myhtml.html.js',
				combine:'example/src/**/*.html',

				// Watch changes and apply changes directly without combine to one file
				// static:['resources/plate/**/*.php', 'resources/views/**/*.php'],
			}
		},

		// This needed if you want to maintain Blackprint's source code
		// You can specify other property if you exporting something
		blackprint:{
			versioning:'example/public/index.html',
			stripURL:'example/public/',

			js:{
				file:'dist/blackprint.min.js',
				header:"/* Blackprint \n MIT Licensed */",
				combine:[
					'src/Blackprint/Blackprint.js', // Start private scope from here
					'src/Blackprint/**/*.js',
					'src/Blackprint/z_end.js', // End private scope for Blackprint
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
		}
	},
}, require('gulp'));