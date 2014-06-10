var pg = require('pg');
var Promise = require("bluebird");
var uuid = require('node-uuid');
var _ = require('underscore-node');

Object.keys(pg).forEach(function(key) {
	if (key == "native") return;

    var Class = pg[key];
    if (typeof Class === "function") {
        Promise.promisifyAll(Class.prototype);
        Promise.promisifyAll(Class);
    }
})
Promise.promisifyAll(pg);



module.exports = {
	start: function(options){
		this.options = options;
	},

	// TODO -- do some validation on event type, stream id
	append: function(message){
		if (message.eventId == null){
			message.eventId = uuid.v4();
		}

		

		return pg.connectAsync(this.options.connection).spread(function(client, release){
			return client.queryAsync('select pge_append_event($1)', [message])
				.finally(release);
		});
	},

	startStream: function(message){
		message.id = uuid.v4();

		
		return pg.connectAsync(this.options.connection).spread(function(client, release){
			return client.queryAsync('select pge_append_event($1)', [message])
				.then(function(){
					return {id: message.id};
				})
				.finally(release);
		});
	},

	// TODO -- much later
	appendBatch: function(id, type, events){

	},


	fetchStream: function(id){
		return pg.connectAsync(this.options.connection).spread(function(client, release){
			return client.queryAsync('select data from pge_events where stream_id = $1', [id])
				.then(function(results){
					return _.map(results.rows, function(row){
						return row.data
					});

				})
				.finally(release);
		});
	} 
};