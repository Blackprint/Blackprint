const fs = require('fs');

module.exports = function(SFC, Gulp){
	let resolvePath = require('path').resolve;
	let configWatch = Gulp.watch("nodes/**/blackprint.config.js", {
		ignoreInitial: false,
		ignored: (path => path.includes('node_modules') || path.includes('.git') || path.includes('turbo_modules'))
	});

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
				config.js.combine = [temp, '!blackprint.config.js', '!dist/**/*'];
			else
				temp.push('!blackprint.config.js', '!dist/**/*');
		}

		['html', 'sf'].forEach(v => {
			let that = config[v];
			if(that){
				that.header = config.header;
				that.prefix = config.templatePrefix;
			}
		});

		['js', 'scss', 'html', 'sf'].forEach(which => {
			let that = config[which];
			if(that){
				that.header = config.header;
				that.file = convertCWD(that.file, dirPath);

				if(config.hardlinkTo !== void 0){
					let _path = that.file; // String must be copied
					let dir = config.hardlinkTo.replace(/\\/g, '/').split('/');

					if(dir[0] === '.'){
						dir.shift();
						dir = dirPath + '/' + dir.join('/');
					}
					else dir = dir.join('/');

					let fileName = _path.slice(_path.lastIndexOf('/') + 1);

					that.onFinish = function(location, fileExt){
                		fs.mkdirSync(dir, {recursive: true});
                		if(!fileExt) fileExt = '';
                		else fileExt = '.'+fileExt;

	                	let filePath = dir + "/" + fileName + fileExt;
	                	let oriPath = _path + fileExt;

	                	fs.lstat(oriPath, function(err, stats1){
	                		if(err)
								return console.error("[Blackprint Config Loader]", err, oriPath);

	                		fs.lstat(filePath, function(err, stats2){
	                			if(!err && stats1.ino === stats2.ino)
	                				return;

								fs.link(oriPath, filePath, ()=>{});
	                		});

		                	// Also hardlink the sourcemap
		                	let m_path = oriPath+'.map';
		                	let m_filePath = filePath+'.map';
		                	fs.lstat(m_path, function(err, stats1){
		                		if(err)
									return console.error("[Blackprint Config Loader]", err, m_path);

		                		fs.lstat(m_filePath, function(err, stats2){
		                			if(!err && stats1.ino === stats2.ino)
		                				return;

									fs.link(m_path, m_filePath, ()=>{});
		                		});
		                	});
	                	});
					}
				}

				if(that.combine)
					that.combine = convertCWD(that.combine, dirPath);
			}
		});

		config.versioning = 'editor/dev.html';
		config.autoGenerate = 'url+"/dist/**",'
		// config.stripURL = 'editor/';

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