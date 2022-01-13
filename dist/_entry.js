// Import Blackprint Sketch for Browser only
if(window === void 0 || window.HTMLVideoElement === void 0)
	throw new Error("Blackprint Sketch is only for browser, please use Blackprint Engine if you want to run on browserless environment.");

if(window.sf === void 0)
	throw new Error("Blackprint Sketch need ScarletsFrame to be loaded on window variable, make sure you have load it first before this library.");

if(window.Blackprint === void 0)
	throw new Error("Blackprint Engine must be loaded first before Blackprint Sketch.");

!function(){
	let sf = window.sf;

	let path = sf.$('script[src*="blackprint/sketch"]')[0];
	if(path === void 0) alert("'blackprint/sketch' URL was not found on any <script> tag, make sure to load Blackprint from the correct CDN link");

	path = path.src.split('/dist')[0];

	sf.loader.js([path+'/dist/blackprint.min.js', path+'/dist/blackprint.sf.js'], {ordered: true});
	sf.loader.css([path+'/dist/blackprint.sf.css']);
}();