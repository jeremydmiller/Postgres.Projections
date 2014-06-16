var expect = require('chai').expect;

var seeder = require('../lib/seeder');
var uuid = require('node-uuid');

var connection = 'postgres://jeremill:@localhost/projections';
var projectionFolder = __dirname + '/projections';

before(function(done){
	return seeder.seedAll({connection: connection, projection_folder: projectionFolder})
		.then(function(){
			done();
		})
		.error(function(err){
			console.log(err);
			done(err);
		});
});

describe('EventStore End to End', function(done){
	var client = require('../lib/client');
	client.start({connection: connection});

	it('should be able to capture an event for a new stream to the database', function(done){
		var message = {
			streamType: 'Quest',
			data: {location: "Emond's Field", $id: uuid.v4(), $type: 'QuestStarted'}
		};

		return client.startStream(message)
			.then(function(result){
				return client.fetchStream(result.id);
			})
			.then(function(result){
				expect(result[0]).to.deep.equal(message.data);
				done();
			})
			.error(function(err){
				done(err);
			});
	});

	it('should append an event to an existing stream to the database', function(done){
		var message = {
			streamType: 'Quest',
			data: {location: "Emond's Field", $id: uuid.v4(), $type: 'QuestStarted'}
		};

		var evt = {
			$type: 'TownReached',
			location: 'Baerlon',
			traveled: 5
		};

		return client.startStream(message)
			.then(function(result){
				return client.append({
					id: result.id,
					data: evt
				})
				.then(function(version){
				// 2nd event in the stream
				console.log(JSON.stringify(version));
					expect(version).to.equal(2);
					return client.fetchStream(result.id);
				});
			})
			.then(function(stream){
				expect(stream[1]).to.deep.equal(evt);

				done();
			})
			.error(function(err){
				done(err);
			});
	});

});