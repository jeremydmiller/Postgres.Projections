

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

			var eventType = message.data.$type;

			if (message.data.$id == null){
				message.data.$id = persistor.newId();
			}


			var next = stream.version + 1;

			stream.update([message.data]);

			persistor.appendEvent(stream.id, next, message.data, eventType, message.data.$id);
			
			projector.captureEvent(stream.id, stream.type, message.data);

			return next;
		},
/*
		storeEvents: function(id, streamType, events){
			var stream = persistor.findStream(id);
			streamType = streamType || options.streamType;
			id = id || persistor.newId();

			if (stream == null){
				stream = {id: persistor.newId(), version: 0};
				persistor.insertStream(id, events.length, streamType);
			}
			else{
				streamType = stream.type;
				persistor.updateStream(id, stream.version + events.length);
			}

			var next = stream.version;
			for (var i = 0; i < events.length; i++){
				var evt = events[i];
				next = next + 1;

				persistor.appendEvent(id, next, evt, evt.$type);
				projector.captureEvent(id, streamType, evt);
			}
		},
		*/

		storeBatch: function(message){


			/*
			var current = this.findVersion(message);
			var latest = current + message.events.length;
			if (current == 0){
				persistor.insertStream(message.id, latest, streamType);
			}
			else{
				persistor.updateStream(message.id, latest);
			}

			var version = current + 1;
			for (var i = 0; i < message.events.length; i++){
				persistor.appendEvent(id, next, message.data, eventType, eventId);
				version = version + 1;
			}
			*/
		}
	};
};