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
	it('should be able to capture an event to the database', function(done){
		var client = require('../lib/client');
		client.start({connection: connection});

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

});