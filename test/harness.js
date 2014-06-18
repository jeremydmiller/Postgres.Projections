var connection = 'postgres://jeremill:@localhost/projections';
var projectionFolder = __dirname + '/projections';
var Promise = require("bluebird");

var client = require('../lib/client');
client.start({connection: connection});

function Harness(){
	this.steps = [];

	this.append = function(){
		var message = client.toEventMessage(arguments);

		this.steps.push(function(promise){
			return promise.then(function(){
				return client.append(message);
			});
		});
	}

	this.stream = function(){
		if (arguments.length == 2){
			var id = arguments[0];
			var assertion = arguments[1];

			this.steps.push(function(promise){
				return promise.then(function(){
					return client.fetchStream(id)
						.then(assertion);
				});
			});
		}

		if (arguments.length == 1){
			var assertion = arguments[0];

			this.steps.push(function(promise){
				return promise.then(function(result){
					return client.fetchStream(result.id)
						.then(assertion);
				});
			});
		}


	}

	this.view = function(id, view, func){
		this.steps.push(function(promise){
			return promise.then(function(){
				return client.fetchView(id, view)
					.then(func);
			});
		});
	}

	this.execute = function(done, client){
		var promise = Promise.resolve(null);

		this.steps.forEach(function(step){
			promise = step(promise);
		});

		return promise.finally(function(){
			done();
		})
		.error(function(err){
			console.log(err);
			done(err);
		});

	}
}



module.exports = {
	seeded: false,

	seed: function(done){
		if (this.seeded){
			return Promise.resolve(this.result)
				.finally(function(){
					done();
				});
		}

		var seeder = require('../lib/seeder');

		return seeder.seedAll({connection: connection, projection_folder: projectionFolder})
			.then(function(result){
				this.seeded = true;
				this.projections = result; 
				
				return result;
			})
			.finally(function(){
				done();
			})
			.error(function(err){
				console.log(err);
				done(err);
			});
	},

	cleanAll: function(done){
		return client.cleanAll()
			.then(function(){
				done();
			})
			.error(function(err){
				console.log(err);
				done(err);
			});
	},

	scenario: function(done, configure){
		var harness = new Harness();
		configure(harness);

		return harness.execute(done, client);
	}
};

