
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


function isUUID(o){
	return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(o);
}



module.exports = {
	toEventMessage: function(arguments){
		if (arguments.length == 0){
			throw new Error('No event data specified');
		}

		if (arguments.length == 1) return arguments[0];

		var message = {data:[]};


		for (var i = 0; i < arguments.length; i++){
			var arg = arguments[i];
			if (isEvent(arg)){
				message.data.push(arg);
			}
			else if (isUUID(arg)){
				message.id = arg;
			}
			else if (arg instanceof Array){
				arg.forEach(function(x){
					message.data.push(x);
				});
			}
			else{
				message.type = arg;
			}
		}

		return message;
	},

	start: function(options){
		this.options = options;
	},

	// TODO -- do some validation on event type, stream id
	append: function(){
		var message = this.toEventMessage(arguments);

		return pg.connectAsync(this.options.connection).spread(function(client, release){
			return client.queryAsync('select pge_append_event($1)', [message])
				.finally(release);
		})
		.then(function(result){
			return Promise.resolve(result.rows[0].pge_append_event);
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