


CREATE OR REPLACE FUNCTION update_Party_projection() RETURNS trigger AS $$
	var projector = function(id, data, eventType, projection){
		var raw = plv8.execute('SELECT data FROM projections WHERE id = $1 AND type = $2', [id, projection.type]);

		var plan = null;
		var state = null;

		var transform = projection[eventType];

		if (raw.length == 1){
			if (!transform){
				return;
			}

			state = raw[0];
			plan = plv8.prepare('UPDATE projections SET data = $2 where id = $1 AND type = $3');
		}
		else {
			state = projection.init();

			plan = plv8.prepare('INSERT INTO projections (id, data, type) values ($1, $2, $3)');
		}

		
		if (transform){
			transform(state, data);
		}

		plan.execute([id, state, projection.type]);
	}

	var projection = {
		type: 'Party',

		init: function(){
			return {};
		},

		QuestStarted: function(state, evt){
			state.Started = true;
		}
	};

	projector(NEW.stream_id, NEW.data, NEW.type, projection);

$$ LANGUAGE plv8;

DROP TRIGGER update_Party_projection ON events CASCADE;
CREATE TRIGGER update_Party_projection AFTER INSERT ON events
    FOR EACH ROW EXECUTE PROCEDURE update_Party_projection();


truncate Trace cascade;
truncate streams cascade;
truncate projections cascade;

SELECT load_stream('cdd82fef-2c14-46a5-a2f3-e866cc6f4568', '
	{
		"type":"Quest",
		"events":[
			{"type":"QuestStarted", "data":{"location": "Emond''s Field", "members":["Rand", "Perrin", "Mat", "Lan"]}},
			{"type":"TownReached", "data":{"location": "Taren Ferry"}},
			{"type":"MemberLost", "data":{"member": "Thom"}},
			{"type":"MemberJoined", "data":{"member": "Nynaeve"}},
			{"type":"TownReached", "data":{"location": "Baerlon"}},
			{"type":"QuestEnded", "data":{"location":"Eye of the World"}}
		]	

	}
');


select * from projections;

select * from Trace;



