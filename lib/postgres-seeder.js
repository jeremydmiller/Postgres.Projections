var pg = require('pg');
var Promise = require("bluebird");

Object.keys(pg).forEach(function(key) {
	if (key == "native") return;

    var Class = pg[key];
    if (typeof Class === "function") {
        Promise.promisifyAll(Class.prototype);
        Promise.promisifyAll(Class);
    }
})
Promise.promisifyAll(pg);

fs = require('fs');

// TODO -- move this to a promises lib



var seedSchema = function(conn){
	var file = __dirname + '/sql/schema.sql';
	var schema = fs.readFileSync(file, 'utf8');

	conn.then(function(c){
		console.log(schema);
		c.client.query(schema);
	});
}

var execute = function(options, operations){




/*
	for (var i = 0; i < operations.length; i++){
		operations[i](conn);
	}

	conn.catch(function(err){
		console.log(err);
	}).done();
*/

}

var loadModule = function(client, file, name){
	return;
	var path = __dirname + '/' + file;
	var text = fs.readFileSync(path, 'utf8');
	console.log('I am loading ' + name);
	client.query('insert into pge_modules (name, definition) values ($1, $2)', [name, text], function(err, result){
		console.log(err);
		console.log(JSON.stringify(result));		
	});
}

var loadModules = function(client){
	return;
client.query('BEGIN');
	client.query('delete from pge_modules');

	loadModule(client, 'eventstore-server.js', 'EventStore');
client.query('COMMIT', client.end.bind(client));
}



exports.seedAll = function(options){
	var file = __dirname + '/sql/schema.sql';
	var schema = fs.readFileSync(file, 'utf8');

	return pg.connectAsync(options.connection)
		.then(function(args){
			var client = args[0];
			var release = args[1];

			return client
				.queryAsync(schema)
				.then(function(){
					return client.queryAsync("select table_name from information_schema.tables where table_name like 'pge_%' order by table_name");
				})
				.finally(release());
		});


	//execute(options, [seedSchema, loadModules]);
};

exports.reloadModules = function(options){
	execute(options, [loadModules]);
};