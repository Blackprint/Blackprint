// Import Blackprint Sketch for Browser only
if(window === void 0 || window.HTMLVideoElement === void 0)
	throw new Error("Blackprint Sketch is only for browser, please use Blackprint Engine if you want to run on browserless environment.");

if(window.sf === void 0)
	throw new Error("Blackprint Sketch need ScarletsFrame to be loaded on window variable, make sure you have load it first before this library.");

if(window.Blackprint === void 0)
	throw new Error("Blackprint Engine must be loaded first before Blackprint Sketch.");

window.sf.loader.js(['./blackprint.min.js', './blackprint.sf.js'], {ordered: true});
window.sf.loader.css(['./blackprint.sf.css']);