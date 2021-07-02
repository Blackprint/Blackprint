process.stdout.write("Loading scarletsframe-compiler\r");

let Gulp = require('gulp');
let os = require('os');
let resolvePath = require('path').resolve;
let notifier = os.platform() === 'win32'
	? new require('node-notifier/notifiers/balloon')() // For Windows
	: require('node-notifier'); // For other OS

function onInit(){
	let configWatch = Gulp.watch("nodes/**/blackprint.config.js", {ignoreInitial: false});

	function convertCWD(paths, dirPath){
		dirPath += '/';

		if(paths.constructor === String){
			if(paths.includes('@cwd'))
				return paths.replace('@cwd', __dirname);
			if(paths.slice(0,1) === '!')
				return '!' + dirPath + paths.slice(1);
			return dirPath + paths;
		}
		else if(paths.constructor === Array){
			paths = JSON.parse(JSON.stringify(paths));

			for (var i = 0; i < paths.length; i++) {
				let temp = paths[i];
				if(temp.includes('@cwd'))
					paths[i] = temp.replace('@cwd', __dirname);
				else if(temp.slice(0,1) === '!')
					paths[i] =  '!' + dirPath + temp.slice(1);
				else
					paths[i] = dirPath + temp;
			}

			return paths;
		}
	}

	let oldConfig = {};
	configWatch.on('all', function(event, path){
		path = path.split('\\').join('/');
		if(path.includes('/_template/')) return;

		if(event !== 'add' && event !== 'change' && event !== 'removed')
			return;

		let dirPath = path.slice(0, path.lastIndexOf('/'));
		let _path = './'+path;
		let config = require(_path);
		delete require.cache[resolvePath(_path)];

		if(config.js && config.js.combine){
			let temp = config.js.combine;
			if(temp.constructor === String)
				config.js.combine = [temp, '!blackprint.config.js'];
			else
				temp.push('!blackprint.config.js');
		}

		['html', 'sf'].forEach(v => {
			let that = config[v];
			if(that){
				that.header = config.header;
				that.prefix = config.templatePrefix;
			}
		});

		['js', 'scss', 'html', 'sf'].forEach(v => {
			let that = config[v];
			if(that){
				that.header = config.header;
				that.file = convertCWD(that.file, dirPath);

				if(that.combine)
					that.combine = convertCWD(that.combine, dirPath);
			}
		});

		config.versioning = 'example/index.html';
		config.autoGenerate = 'url+"/dist/**",'
		// config.stripURL = 'example/';

		if(event === 'removed'){
			if(oldConfig[_path] === void 0) return;

			SFC.deleteConfig(oldConfig[_path]);
			console.log(`[Blackprint] "${config.name}" config was removed`);
			return;
		}
		// else => When config updated/created

		if(event === 'add'){
			if(config.disabled) return;

			SFC.importConfig(config.name, config);
			console.log(`[Blackprint] "${config.name}" config was added`);
		}
		else { // on changed
			if(oldConfig[_path] === void 0){
				SFC.importConfig(config.name, config);
				console.log(`[Blackprint] "${config.name}" config was enabled`);
			}
			else{
				SFC.deleteConfig(oldConfig[_path]);
				if(config.disabled){
					delete oldConfig[_path];
					console.log(`[Blackprint] "${config.name}" config was disabled`);
					return;
				}

				SFC.importConfig(config.name, config);
				console.log(`[Blackprint] "${config.name}" config reloaded`);
			}
		}

		oldConfig[_path] = config;
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

	onInit: onInit,
	beforeInit(){
		SFC.clearGenerateImport('example/index.html');
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
			}
		},

		// This needed if you want to maintain Blackprint's source code
		// You can specify other property if you exporting something
		blackprint:{
			versioning:'example/index.html',
			// stripURL:'example/',

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

		// Compiler for Blackprint Engine
		'engine-js':{
			versioning:'example/index.html',
			// stripURL:'example/',

			js:{
				file:'dist/engine.min.js',
				header:"/* Blackprint \n MIT Licensed */",
				combine:[
					// Start private wrapper
					'engine-js/src/init/begin.js',

					// Combine files from all directory recursively
					'engine-js/src/**/*.js',

					// Remove this end wrapper from /**/* matches
					'!engine-js/src/init/end.js',

					// End private wrapper
					'engine-js/src/init/end.js',
				],
			}
		},
	}
}, Gulp);