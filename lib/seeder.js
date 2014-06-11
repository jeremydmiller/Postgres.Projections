// TODO -- generalize this!

var pg = require('pg');
var Promise = require("bluebird");
var Path = require('path');

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

var seedSchema = function(conn){
	var file = __dirname + '/sql/schema.sql';
	var schema = fs.readFileSync(file, 'utf8');

	conn.then(function(c){
		console.log(schema);
		c.client.query(schema);
	});
}



var loadModule = function(path){
	var path = __dirname + path;
	var text = fs.readFileSync(path, 'utf8');
	var name = Path.basename(path, '.js');


	return function(promise, client, log){
		return promise.then(function(){
			log.modules.push(name);
			return client.queryAsync('insert into pge_modules (name, definition) values ($1, $2)', [name, text]);
		});
	}
}

var loadFile = function(filename){
	var file = __dirname + '/sql/' + filename;
	var schema = fs.readFileSync(file, 'utf8');

	return function(promise, client, log){
		return promise.then(function(){
			return client.queryAsync(schema)
		});
	};
}


var loadSchema = function(promise, client, log){
	var file = __dirname + '/sql/schema.sql';
	var schema = fs.readFileSync(file, 'utf8');

	return promise.then(function(){
		return client.queryAsync(schema)
	});
}

var logTables = function(promise, client, log){
	return promise.then(function(){
		return client.queryAsync("select table_name from information_schema.tables where table_name like 'pge_%' order by table_name");
	})
	.then(function(results){
		log.tables = [];
		for (var i = 0; i < results.rows.length; i++){
			log.tables.push(results.rows[i].table_name);
		}
	});
}


var execute = function(options, operations){
	var log = {tables: [], modules: []};


	return pg.connectAsync(options.connection)
		.then(function(args){
			var client = args[0];
			var release = args[1];

			var promise = Promise.resolve(null);
			
			for (var i = 0; i < operations.length; i++){
				promise = operations[i](promise, client, log);
			}

			return promise.finally(release);
		})
		.then(function(){
			return log;
		});
}

var initialize = function(promise, client, log){
	return promise.then(function(){
		return client.queryAsync('select pge_initialize()');
	});
}

// TODO -- need to log functions too
exports.seedAll = function(options){
	return execute(options, [
		loadFile('schema.sql'), 
		loadFile('initializer.sql'), 
		loadFile('append_events.sql'), 
		logTables,
		loadModule('/server/eventstore.js', 'EventStore'),
		loadModule('/server/persistor.js', 'Persistor'),
		loadModule('/pg-events.js', 'Projector'),
		initialize	
		]);
};


var forEachFile = function(folder, callback){
	var files = fs.readdirSync(folder);
	for (var i = 0; i < files.length; i++){
		var path = folder + '/' + files[i];

		callback(path);
	}
}

exports.loadProjections = function(options){
	var projector = require('./pg-events');

	var files = fs.readdirSync(options.projection_folder);
	forEachFile(options.projection_folder, function(path){
		require(path);
	});
}




function EventStorageBuilder(){
	var dropDDL = "DROP TABLE IF EXISTS pge_projections_* CASCADE;";
	var createDDL = [
		"CREATE TABLE pge_projections_* (",
		"	id			uuid CONSTRAINT pk_pge_projections_* PRIMARY KEY,",
		"	data		json NOT NULL",
		");",

	];

	this.names = [];

	this.addTableFor = function(name){
		this.names.push(name);
	};

}









