
exports.create = function(persistor, options){
	return {
		// TODO -- blow up if id is null?
		// TODO -- do the optimistic version check
		// TODO -- blow up if eventType is completely missing?
		store: function(message){
			var eventType = message.type || message.data.$type;
			var eventId = message.eventId || persistor.newId();
			var stream = persistor.findStream(message.id);
			var streamType = message.streamType || options.streamType;
			
			var next = 1;
			if (stream == null){
				persistor.insertStream(message.id, 1, streamType);
				stream = {type: streamType, version: 0};
			}
			else{
				next = stream.version + 1;
				persistor.updateStream(message.id, next);
			}

			persistor.appendEvent(message.id, next, message.data, eventType, eventId);
			
		},


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