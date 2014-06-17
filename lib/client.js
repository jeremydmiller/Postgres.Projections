
var pg = require('pg');
var Promise = require("bluebird");
var uuid = require('node-uuid');

Object.keys(pg).forEach(function(key) {
	if (key == "native") return;

    var Class = pg[key];
    if (typeof Class === "function") {
        Promise.promisifyAll(Class.prototype);
        Promise.promisifyAll(Class);
    }
})
Promise.promisifyAll(pg);

function isEvent(o){
	return o.hasOwnProperty('$type');
}

module.exports = {
	start: function(options){
		this.options = options;
	},

	// TODO -- do some validation on event type, stream id
	append: function(){
		if (arguments.length == 0){
			throw new Error('No event data specified');
		}

		var message = {data:[]};
		if (arguments.length == 1){
			message = arguments[0];
		}
		else {
			var start = 0;
			if (!isEvent(arguments[0])){
				message.id = arguments[0];
				start = 1;
			}

			if (!isEvent(arguments[1])){
				message.type = arguments[1];
				start = 2;
			}

			for (var i = start; i < arguments.length; i++){
				message.data.push(arguments[i]);
			}
		}

		return pg.connectAsync(this.options.connection).spread(function(client, release){
			return client.queryAsync('select pge_append_event($1)', [message])
				.finally(release);
		})
		.then(function(result){
			return Promise.resolve(result.rows[0].pge_append_event);
		});
	},

	// TODO -- handle more than one event?
	startStream: function(){
		var message = {};

		if (arguments.length == 1){
			message = arguments[0];
		}
		else if (arguments.length == 2){
			message.type = arguments[0];
			message.data = arguments[1];
		}
		

		if (!message.id){
			message.id = uuid.v4();
		}
		
		return pg.connectAsync(this.options.connection).spread(function(client, release){
			return client.queryAsync('select pge_append_event($1)', [message])
				.then(function(){
					return {id: message.id};
				})
				.finally(release);
		});
	},


	fetchStream: function(id){
		return pg.connectAsync(this.options.connection).spread(function(client, release){
			return client.queryAsync('select data from pge_events where stream_id = $1', [id])
				.then(function(results){
					return results.rows.map(function(row){
						return row.data
					});

				})
				.finally(release);
		});
	} 
};