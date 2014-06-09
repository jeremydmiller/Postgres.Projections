var pg = require('pg');
fs = require('fs');

// TODO -- move this to a promises lib



var seedSchema = function(client){
	var file = __dirname + '/sql/schema.sql';
	var schema = fs.readFileSync(file, 'utf8');


	client.query(schema);
}

var execute = function(options, operations){
	var client = new pg.Client(options.connection);

	for (var i = 0; i < operations.length; i++){
		operations[i](client);
	}

	client.on("drain", client.end.bind(client));
	client.connect();
}


exports.seedAll = function(options){
	execute(options, [seedSchema]);
};