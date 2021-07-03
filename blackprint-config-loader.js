module.exports = function(SFC, Gulp){
	let resolvePath = require('path').resolve;
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