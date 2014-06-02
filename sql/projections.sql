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
	
		this.update = function(id, data, eventType){
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
			//projector.storeByStream(definition.$stream);
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

		self.storeByStream = function(streamType, projection){
			byStream.add(streamType, projection);
		};

		self.storeByEvent = function(eventType, projection){
			byEvent.add(eventType, projection);
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

		self.project = function(id, streamType, evt){
		plv8.elog(NOTICE, 'DATA IS ' + JSON.stringify(evt));
			var projections = byStream.get(streamType).concat(byEvent.get(evt.$type));
plv8.elog(NOTICE, 'SECOND');
/*
			for (var i = 0; i < projections.length; i++){
				projections[i].projeßct(id, evt);
				plv8.elog(NOTICE, 'RAN PROJECTION ' + i)ß;
			}
			*/
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

