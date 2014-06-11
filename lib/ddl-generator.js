var _ = require('underscore-node');

function StringBuilder(){
	this.text = '';

	this.appendLine = function(text){
		if (arguments.length == 0){
			this.text = this.text + '\n';
			return;
		}

		this.text = this.text + text + '\n';
	};

	return this;
}

module.exports = function(projector){
	var self = this;

	var dropDDL = "DROP TABLE IF EXISTS pge_projections_* CASCADE;";
	var createDDL = [
		"CREATE TABLE pge_projections_* (",
		"	id			uuid CONSTRAINT pk_pge_projections_* PRIMARY KEY,",
		"	data		json NOT NULL",
		");",

	];

	var drop = function(name, builder){
		builder.appendLine(dropDDL.replace("*", name));
	};

	var create = function(name, builder){
		_.each(createDDL, function(ddl){
			builder.appendLine(ddl.replace("*", name));
		});

		return _.map(createDDL, function(ddl){
			return ddl.replace("*", name);
		});
	};

	

	this.requireStorageFor = function(name){
		this.names.push(name);
	};

	this.generate = function(){
		var builder = new StringBuilder();
		builder.appendLine();

		_.each(this.names, function(name){
			drop(name, builder);
			create(name, builder);
			builder.appendLine();
			builder.appendLine();
		});

		return builder.text;
	};

	this.names = [];

	for (key in projector.projections){
		projector.projections[key].store.requireStorage(self);
	}

	return self;

}
