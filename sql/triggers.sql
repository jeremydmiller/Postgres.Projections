


CREATE OR REPLACE FUNCTION update_projections() RETURNS trigger AS $$
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

	// TODO -- move this to a prototype later?
	function StreamAggregator(projection, updater){
		this.update = function(id, data, eventType){

plv8.elog(NOTICE, JSON.stringify(data));

			var transform = projection[eventType];
			var state = updater.findExisting(id, projection.type);

			if (state == null){
				state = projection.init();
				if (transform){
					transform(state, data);
				}

				updater.insert(id, state, projection.type);
			}
			else if (transform){
				transform(state, data);

				updater.update(id, state, projection.type);
			}
		};

		return this;
	}


	var projection = {
		type: 'Party',

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
	};

	var aggregator = new StreamAggregator(projection, new ProjectionUpdater());

	aggregator.update(NEW.stream_id, NEW.data, NEW.type);

$$ LANGUAGE plv8;

DROP TRIGGER update_projections ON events CASCADE;
CREATE TRIGGER update_projections AFTER INSERT ON events
    FOR EACH ROW EXECUTE PROCEDURE update_projections();


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




