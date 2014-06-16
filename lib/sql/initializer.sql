CREATE OR REPLACE FUNCTION pge_initialize() RETURNS VOID AS $$


var $modules = {};
var module = {};
var exports = null;

function require(name){
	var parts = name.split('/');
	name = parts[parts.length - 1].replace(".js", "");


	if ($modules.hasOwnProperty(name)){
		return $modules[name];
	}

	module = {exports: {}};
	exports = module.exports;

	var raw = plv8.execute("select definition from pge_modules where name = $1", [name])[0].definition;
	eval(raw);

	var newModule = module.exports;
	$modules[name] = newModule;

	return newModule;
}

var console = {
	log: function(text){
		plv8.elog(NOTICE, text);
	}
}


var persistor = require('persistor');

// TODO -- add some way to put in the options for defaults
plv8.events = require('eventstore').create(persistor, {});



var results = plv8.execute("select definition from pge_projection_definitions");
for (var i = 0; i < results.length; i++){
	eval(results[i].definition);
}


$$ LANGUAGE plv8;

SET plv8.start_proc = plv8_initialize;
