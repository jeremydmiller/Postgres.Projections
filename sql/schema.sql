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






CREATE OR REPLACE FUNCTION load_stream(id UUID, stream json)
RETURNS VOID AS $$
	var appender = plv8.find_function('append_event');

	for (var i = 0; i < stream.events.length; i++){
		var evt = stream.events[i];

		appender(id, stream.type, evt.$type, evt.data);
	}
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


