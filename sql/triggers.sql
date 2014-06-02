
DROP TABLE IF EXISTS Party_Projection CASCADE;
CREATE TABLE Party_Projection (
	id			uuid CONSTRAINT pk_party_projection PRIMARY KEY,
	data		json NOT NULL	
);




CREATE OR REPLACE FUNCTION update_Party_projection() RETURNS trigger AS $$
	var projector = function(id, data, eventType, projection){
		var raw = plv8.execute('SELECT data FROM Party_Projection WHERE id = $1', [id]);

		var plan = null;
		var state = null;

		var transform = projection[eventType];



		if (raw.length == 1){
		plv8.elog(NOTICE, 'got current state');
			if (!transform){
				return;
			}

			state = raw[0];
			plan = plv8.prepare('UPDATE Party_Projection SET data = $2 where id = $1');
		}
		else {

		plv8.elog(NOTICE, 'no current state');
			state = projection.init();

			plv8.elog(NOTICE, 'state is ' + JSON.stringify(state));
			plan = plv8.prepare('INSERT INTO Party_Projection (id, data) values ($1, $2)');
		}

		
		if (transform){
			transform(state, data);

			// TODO -- do a DELETE here
		}

		plan.execute([id, state]);
	}

	var projection = {
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
truncate Party_Projection cascade;

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


select * from Party_Projection;

select * from Trace;



