function SimpleStore(type){
	this.type = type;
}

SimpleStore.prototype.find = function(id){
	return this[id];
};

SimpleStore.prototype.update = function(id, data){
	this[id] = data;
};

function ProjectionSet(){
	var data = {};

	this.add = function(key, value){
		if (!data[key]){
			data[key] = [];
		}

		data[key].push(value);
	}

	this.get = function(key){
		if (!data[key]){
			return [];
		}

		return data[key];
	}

	this.clear = function(){
		data = {};
	}
}

function InMemoryStore(){
	var data = {};
	var self = this;

	self.byId = function(type){
		if (!data[type]){
			data[type] = new SimpleStore(type);
		}

		return data[type];
	};

	self.byType = function(){
		return self.byId('$aggregates');
	}

	return self;
}


function StreamAggregator(name, definition, updater){
	this.name = name;
	this.definition = definition;

	if (this.definition.$init == null){
		this.definition.$init = function(){
			return {};
		}
	}

}

StreamAggregator.prototype.applyEvent = function(state, eventType, data){
	var transform = this.definition[eventType];

	if (state == null){
		state = this.definition.$init();
	}

	if (transform){
		transform(state, data);
	}

	return state;
}




function Projector(store){
	var self = this;

	self.store = store;

	var byStream = new ProjectionSet();
	var byEvent = new ProjectionSet();

	self.projections = {};



	self.projectStream = function(stream){
		return {
			named: function(name){
				return {
					by: function(definition){
						var aggregator = new StreamAggregator(name, definition, self.store);
						byStream.add(stream, aggregator);
						self.projections[name] = aggregator;

						return aggregator;
					}
				}
			}
		};
	};


/*
	self.storeByStream = function(stream_type, projection){
		byStream.add(stream_type, projection);
	};

	self.storeByEvent = function(event_type, projection){
		byEvent.add(event_type, projection);
	};

	self.project = function(id, stream_type, evt){
		var projections = byStream.get(stream_type).concat(byEvent.get(evt.$type));

		for (var i = 0; i < projections.length; i++){
			projections[i].project(id, evt);
		}
		
	};


*/
	self.reset = function(){
		self.store = new InMemoryStore();
		byStream.clear();
		byEvent.clear();
		self.projections = {};
	};


	return self;
}



module.exports = new Projector(new SimpleStore());
