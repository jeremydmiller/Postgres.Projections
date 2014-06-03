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