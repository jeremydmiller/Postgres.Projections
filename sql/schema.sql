DROP TABLE IF EXISTS Trace CASCADE;
CREATE TABLE Trace (
	text		varchar(100)
);

DROP TABLE IF EXISTS streams CASCADE;
CREATE TABLE streams (
	id			uuid CONSTRAINT pk_streams PRIMARY KEY,
	type		varchar(100) NOT NULL,
	version		integer NOT NULL	
);


DROP TABLE IF EXISTS events;
CREATE TABLE events (
	stream_id	uuid REFERENCES streams ON DELETE CASCADE,
	version		integer NOT NULL,
	data		json NOT NULL,
	type 		varchar(100) NOT NULL,
	timestamp	timestamp without time zone default (now() at time zone 'utc') NOT NULL,
	CONSTRAINT pk_events PRIMARY KEY(stream_id, version)
);

-- TODO: add an index on id and type. 
DROP TABLE IF EXISTS projections CASCADE;
CREATE TABLE projections (
	id			uuid,
	type 		varchar(100) NOT NULL,
	data		json NOT NULL,
	CONSTRAINT pk_projections PRIMARY KEY(id, type)
);

DROP TABLE IF EXISTS projection_definitions CASCADE;
CREATE TABLE projection_definitions (
	name			varchar(100) CONSTRAINT pk_projection_definitions PRIMARY KEY,
	definition		varchar(1000) NOT NULL
);


-- stream_id UUID, stream_type varchar(100), data json
CREATE OR REPLACE FUNCTION append_event(stream_id UUID, stream_type varchar, event_type varchar, data json) RETURNS int AS $$
	var raw = plv8.execute('select version, type from streams where id = $1', [stream_id]);
	var version = 1;
	if (raw.length == 1){
		version = parseInt(raw[0].version) + 1;
		if (stream_type == null){
			stream_type = raw[0].type;
		}
	};

	if (version == 1){
		plv8.execute('insert into streams (id, version, type) values ($1, $2, $3)', [stream_id, version, stream_type]);
	}
	else{
		plv8.execute('update streams set version = $1 where id = $2', [version, stream_id]);
	}

	plv8.execute('insert into events (stream_id, version, data, type) values ($1, $2, $3, $4)', [stream_id, version, data, event_type]);

	data.$type = event_type;

    plv8.projector.project(stream_id, stream_type, data);

	return version;
$$ LANGUAGE plv8;



CREATE OR REPLACE FUNCTION load_stream(id UUID, stream json)
RETURNS VOID AS $$
	var appender = plv8.find_function('append_event');

	for (var i = 0; i < stream.events.length; i++){
		var evt = stream.events[i];

		appender(id, stream.type, evt.$type, evt);
	}
$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION initialize_projections() RETURNS VOID AS $$
	function ProjectionUpdater(){
		var insertPlan = plv8.prepare('INSERT INTO projections (id, data, type) values ($1, $2, $3)');
		var updatePlan = plv8.prepare('UPDATE projections SET data = $2 where id = $1 AND type = $3');
		var findPlan = plv8.prepare('SELECT data FROM projections WHERE id = $1 AND type = $2');

		this.insert = function(id, data, type){
			insertPlan.execute([id, data, type]);
		};

		this.update = function(id, data, type){
			updatePlan.execute([id, data, type]);
		};

		this.findExisting = function(id, type){
			var raw = findPlan.execute([id, type]);
			if (raw.length == 0) return null;

			return raw[0].data;
		};

		return this;
	}

	function StreamAggregator(definition, updater){
	
		this.project = function(id, data){
			var eventType = data.$type;
			var transform = definition[eventType];
			var state = updater.findExisting(id, definition.$name);

			if (state == null){
				state = definition.init();
				if (transform){
					transform(state, data);
				}

				updater.insert(id, state, definition.$name);
			}
			else if (transform){
				transform(state, data);

				updater.update(id, state, definition.$name);
			}
		};

		this.mapApplicability = function(projector){
			projector.storeByStream(definition.$stream, this);
		};

		


		return this;
	}

	function ProjectionSet(){
		this.add = function(key, value){
			if (!this[key]){
				this[key] = [];
			}

			this[key].push(value);
		}

		this.get = function(key){
			if (!this[key]){
				return [];
			}

			return this[key];
		}
	}
	
	function EventProjector(updater){
		var self = this;

		var byStream = new ProjectionSet();
		var byEvent = new ProjectionSet();

		var projections = [];

		self.storeByStream = function(stream_type, projection){
			byStream.add(stream_type, projection);
		};

		self.storeByEvent = function(event_type, projection){
			byEvent.add(event_type, projection);
		};

		var buildProjection = function(definition){
			if (definition.$type == 'by-stream'){
				return new StreamAggregator(definition, updater);
			}

			throw 'oh noes';
		};

		self.add = function(definition){
			var projection = buildProjection(definition);
			projection.mapApplicability(self);
			projections.push(projection);
		};

		self.project = function(id, stream_type, evt){
			var projections = byStream.get(stream_type).concat(byEvent.get(evt.$type));

			for (var i = 0; i < projections.length; i++){
				projections[i].project(id, evt);
			}
			
		};

		return self;
	}




	var rows = plv8.execute('select definition from projection_definitions');
	var projector = new EventProjector(new ProjectionUpdater());
	for (var i = 0; i < rows.length; i++){
		eval(rows[i].definition);
		projector.add(definition);
	}

	plv8.projector = projector;

$$ LANGUAGE plv8;








truncate table projection_definitions;
insert into projection_definitions (name, definition) values ('Party', 
'
var definition = {
		$name: "Party",
		$type: "by-stream",
		$stream: "Quest",

		init: function(){
			return {};
		},

		QuestStarted: function(state, evt){
			state.active = true;
			state.location = evt.location; 
		},

		QuestEnded: function(state, evt){
			state.active = false;
			state.location = evt.location;
		}
}

');


SELECT initialize_projections();

truncate Trace cascade;
truncate streams cascade;
truncate projections cascade;

SELECT load_stream('cdd82fef-2c14-46a5-a2f3-e866cc6f4568', '
	{
		"type":"Quest",
		"events":[
			{"$type":"QuestStarted", "data":{"location": "Emond''s Field", "members":["Rand", "Perrin", "Mat", "Lan"]}},
			{"$type":"TownReached", "data":{"location": "Taren Ferry"}},
			{"$type":"MemberLost", "data":{"member": "Thom"}},
			{"$type":"MemberJoined", "data":{"member": "Nynaeve"}},
			{"$type":"TownReached", "data":{"location": "Baerlon"}},
			{"$type":"QuestEnded", "data":{"location":"Eye of the World"}}
		]	

	}
');


select * from projections;


