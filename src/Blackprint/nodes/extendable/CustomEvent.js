// This class must be initialized first before any extendable
// That's why this file should be written on gulpfile.js

class CustomEvent{
	on(eventName, func){
		if(this._event === void 0)
			Object.defineProperty(this, '_event', {value:{}});

		if(eventName.includes(' ')){
			eventName = eventName.split(' ');
			for (var i = 0; i < eventName.length; i++)
				this.on(eventName[i], func);

			return;
		}

		if(this._event[eventName] === void 0)
			this._event[eventName] = [];

		this._event[eventName].push(func);
	}

	once(eventName, func){
		func.once = true;
		this.on.apply(this, arguments);
	}

	off(eventName, func){
		if(eventName.includes(' ')){
			eventName = eventName.split(' ');
			for (var i = 0; i < eventName.length; i++)
				this.off(eventName[i], func);

			return;
		}

		if(this._event === void 0 || this._event[eventName] === void 0)
			return;

		if(func === void 0){
			delete this._event[eventName];
			return;
		}
		else{
			var i = this._event[eventName].indexOf(func);
			if(i === -1)
				return;

			this._event[eventName].splice(i, 1);
		}

		if(this._event[eventName].length === 0)
			delete this._event[eventName];
	}

	_trigger(eventName, data){
		if(this._event === void 0 || this._event[eventName] === void 0)
			return;

		var events = this._event[eventName];
		for (var i = 0; i < events.length; i++){
			events[i](data);

			if(events[i].once){
				delete events[i].once;
				events.splice(i--, 1);
			}
		}
	}
}