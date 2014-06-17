
module.exports = function(persistor, projector, options){
	return {
		// TODO -- blow up if id is null?
		// TODO -- do the optimistic version check
		// TODO -- blow up if eventType is completely missing?
		store: function(message){
			var eventType = message.data.$type;

			if (message.data.$id == null){
				message.data.$id = persistor.newId();
			}


			var streamType = message.type || options.streamType;
			
			var stream = null;
			var next = 1;

			if (message.id){
				stream = persistor.findStream(message.id);
			}
			else {
				message.id = persistor.newId();
			}

			if (stream){
				streamType = stream.type;
				next = stream.version + 1;
				persistor.updateStream(message.id, next);
			}
			else{
				persistor.insertStream(message.id, 1, streamType);
				stream = {type: streamType, version: 0};
			}


			persistor.appendEvent(message.id, next, message.data, eventType, message.data.$id);
			
			projector.captureEvent(message.id, streamType, message.data);

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