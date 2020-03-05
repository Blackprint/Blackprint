process.stdout.write("Loading scarletsframe-compiler\r");

require("scarletsframe-compiler")({
	// Start the server
	browserSync:{
		// proxy:'http://myjs.sandbox',
		port:6789, // Accessible-> http://localhost:6789
		ghostMode: false, // Use synchronization between browser?

		// Standalone server with BrowserSync
		server:{
			baseDir:'docs/',
			index:'index.html',
		}
	},

	// Optional if you want to remove source map on production mode
	includeSourceMap: process.env.production || true,

	// ===== Modify me, add slash as last character if it's directory =====
	path:{
		// Use `default` if you're not exporting project as library/module
		default:{
			versioning:'docs/index.html',
			stripURL:'docs/',

			js:{
				file:'docs/assets/myjs.min.js',

				// Will be processed from the top to bottom
				combine:[
					//'src/startup_init/_variable.js',
					'src/**/*.js',
				],
			},
			scss:{
				file:'docs/assets/mycss.min.css',
				combine:'src/**/*.scss',
			},
			html:{
				file:'docs/assets/myhtml.html.js',
				combine:'src/**/*.html',

				// Watch changes and apply changes directly without combine to one file
				// static:['resources/plate/**/*.php', 'resources/views/**/*.php'],
			}
		},

		// You can specify other property if you exporting something
		blackprint:{
			versioning:'docs/index.html',
			stripURL:'docs/',

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