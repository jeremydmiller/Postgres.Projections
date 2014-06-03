\i build.sql;

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