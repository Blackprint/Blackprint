const fs = require('fs');
let currentPath = process.cwd();

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
			config.js.filePath = config.js.file;

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

		['ts', 'js', 'scss', 'html', 'sf'].forEach(which => {
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

			if(config.js != null){
				// Extract JSDoc for Blackprint nodes if exist
				if(config.bpDocs != null){
					let dir = config.bpDocs;
					if(dir.includes('@cwd'))
						dir = dir.replace('@cwd', currentPath);

					let docs = {};
					let that = config.js;

					that.onEvent = {
						fileCompiled(content, rawContent){
							that.onEvent.fileModify(rawContent || content);
						},
						fileModify(content, filePath){
							extractDocs(content, filePath, docs);
						},
						scanFinish(){
							fs.writeFileSync(dir, JSON.stringify(docs));
							SFC.socketSync?.('bp-docs-append', docs, "Blackprint docs updated");
						}
					}
				}
			}

			if(config.ts != null && config.ts.scanDocs){
				// Extract JSDoc for Blackprint nodes if exist
				if(config.bpDocs != null){
					let dir = config.bpDocs;
					if(dir.includes('@cwd'))
						dir = dir.replace('@cwd', currentPath);

					let initScan = setTimeout(()=> {
						console.log("Initial scan was longer than 1min:", config.ts.scanDocs);
					}, 60000);

					let save = 0;
					let docs = {};
					function onChange(file, stats){
						file = currentPath + '/' + file;
						extractDocs(fs.readFileSync(file, 'utf8'), file, docs);

						clearTimeout(save);
						save = setTimeout(()=> {
							fs.writeFileSync(dir, JSON.stringify(docs));
							SFC.socketSync?.('bp-docs-append', docs, "Blackprint docs updated");
						}, 3000);
					}

					config._tsDocsWatch = chokidar.watch(config.ts.scanDocs, {
							cwd: currentPath,
							alwaysStat: false,
							ignored: (path => path.includes('node_modules') || path.includes('.git') || path.includes('turbo_modules'))
						})
						.on('add', onChange).on('change', onChange)
						.on('ready', () => clearTimeout(initScan))
						.on('error', console.error);
				}
			}

			SFC.importConfig(config.name, config);
			console.log(`[Blackprint] "${config.name}" config was added`);
		}
		else { // on changed
			if(oldConfig[_path] === void 0){
				SFC.importConfig(config.name, config);
				console.log(`[Blackprint] "${config.name}" config was enabled`);

				config._tsDocsWatch?.close();
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

function extractDocs(content, filePath, docs){
	let contents = [];
	content.replace(/\/\*\*.*?\*\//gs, function(full, index){
		if(!full.includes('* @blackprint')) return;
		contents.push(index);
	});

	for (let i=0; i < contents.length; i++)
		contents[i] = content.slice(contents[i], contents[i+1]);

	for (let i=0; i < contents.length; i++) {
		content = contents[i]; // this have a purposes, don't delete before checking
		content.replace(/\/\*\*(.*?)\*\//gs, function(full, match){
			// Only process if "@blackprint" was found in the file content
			if(!match.includes('@blackprint')) return;

			match = match
				.replace(/\t+/g, '')
				.replace(/^[ \t]+?\* /gm, '')
				.replace(/^@blackprint.*?$\b/gm, '')
				.trim();

			let output = {};
			let input = {};
			let hasIO = {input: false, output: false};
			let namespace = '';

			// Get the class content below the docs
			let slice = content.slice(content.indexOf(full)+full.length);
			slice.replace(/\bregisterNode\(['"`](.*?)['"`].*?^}/ms, function(full, match){
				namespace = match;
				full.replace(/static (input|output)(.*?)}(;|\n)/gms, function(full, which, content){
					// Obtain documentation for StructOf first
					content.replace(/^(\s+).*?(\S+):.*?\bStructOf\(.*?{(.*?)\1}/gms, function(full, s, rootName, content){
						content.replace(/\/\*\*(.*?)\*\/\s+(.*?):/gs, function(full, docs, portName){
							hasIO[which] = true;

							let obj = which === 'output' ? output : input;
							obj[rootName+portName] = {description: docs.replace(/^[ \t]+?\* /gm, '').trim()};
						});

						return full.replace(content, '');
					})
					.replace(/\/\*\*(.*?)\*\/\s+(.*?):/gs, function(full, docs, portName){
						hasIO[which] = true;

						let obj = which === 'output' ? output : input;
						obj[portName] = {description: docs.replace(/^[ \t]+?\* /gm, '').trim()};
					});
				});
			});

			if(namespace === '') return;

			let tags = {};
			let hasTags = false;
			let data = {
				description: match.replace(/^@(\w+) (.*?)$/gm, function(full, name, desc){
					hasTags = true;
					tags[name] = desc;
					return '';
				}).trim(),
			};

			if(hasTags) data.tags = tags;
			if(hasIO.input) data.input = input;
			if(hasIO.output) data.output = output;

			deepProperty(docs, namespace.split('/'), data);
		});
	}
}

function deepProperty(obj, path, value, onCreate){
	var temp;
	if(value !== void 0){
		for(var i = 0, n = path.length-1; i < n; i++){
			temp = path[i];
			if(obj[temp] === void 0){
				obj[temp] = {};
				onCreate && onCreate(obj[temp]);
			}

			obj = obj[temp];
		}

		obj[path[i]] = value;
		return;
	}

	for(var i = 0; i < path.length; i++){
		if((obj = obj[path[i]]) === void 0)
			return;
	}

	return obj;
}