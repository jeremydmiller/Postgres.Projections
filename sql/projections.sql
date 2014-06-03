CREATE OR REPLACE FUNCTION initialize_projections() RETURNS VOID AS $$
	function ProjectionUpdater(){
		this.insert = function(id, data, type){
			plv8.execute('INSERT INTO projections (id, data, type) values ($1, $2, $3)', [id, data, type]);
		
		};

		this.update = function(id, data, type){
			plv8.execute('UPDATE projections SET data = $2 where id = $1 AND type = $3', [id, data, type]);
		};

		this.findExisting = function(id, type){
			var raw = plv8.execute('SELECT data FROM projections WHERE id = $1 AND type = $2',[id, type]);

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
	
	function Projector(updater){
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
	var projector = new Projector(new ProjectionUpdater());
	for (var i = 0; i < rows.length; i++){
		eval(rows[i].definition);
		projector.add(definition);
	}

	plv8.projector = projector;

$$ LANGUAGE plv8;