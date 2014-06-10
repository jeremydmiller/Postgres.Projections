CREATE OR REPLACE FUNCTION pge_initialize() RETURNS VOID AS $$


var $modules = {};
var module = {};
var exports = null;

function require(name){
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


var persistor = require('Persistor');

// TODO -- add some way to put in the options for defaults
plv8.events = require('EventStore').create(persistor, {});


$$ LANGUAGE plv8;

SET plv8.start_proc = plv8_initialize;
