

function ExistingStream(persistor, stream){
	this.persistor = persistor;
	this.version = stream.version;
	this.id = stream.id;
}

ExistingStream.prototype.update = function(events){
	this.persistor.updateStream(this.id, this.version + events.length);
}


function NewStream(persistor, id, type){
	this.persistor = persistor;
	this.type = type;
	this.version = 0;
	this.id = id;
}

NewStream.prototype.update = function(events){
	this.persistor.insertStream(this.id, events.length, this.type);
}



module.exports = function(persistor, projector, options){
	return {
		findStream: function(message){
			var id = message.id || persistor.newId();
			var streamType = message.type || options.streamType;

			var existing = persistor.findStream(id);
			if (existing == null){
				return new NewStream(persistor, id, streamType);
			}
			else{
				return new ExistingStream(persistor, existing);
			}
		},


		// TODO -- blow up if id is null?
		// TODO -- do the optimistic version check
		// TODO -- blow up if eventType is completely missing?
		store: function(message){
			var stream = this.findStream(message);

			if (message.data.$id == null){
				message.data.$id = persistor.newId();
			}

			var events = message.data;
			if (typeof events != 'array'){
				events = [events];
			}

			stream.update(events);
			var next = stream.version;
			for (var i = 0; i < events.length; i++){
				next = next + 1;
				var evt = events[i];
				if (evt.$id == null){
					evt.$id = persistor.newId();
				}

				persistor.appendEvent(stream.id, next, evt, evt.$type, evt.$id);
				projector.captureEvent(stream.id, stream.type, evt);
			}

			return next;
		},

	};
};