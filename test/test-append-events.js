var expect = require('chai').expect;

var seeder = require('../lib/postgres-seeder');
var uuid = require('node-uuid');

var connection = 'postgres://jeremill:@localhost/projections';

before(function(done){
	return seeder.seedAll({connection: connection})
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
		var client = require('../lib/eventstore-client');
		client.start({connection: connection});

		var message = {
			type: 'QuestStarted',
			streamType: 'Quest',
			data: {location: "Emond's Field", $id: uuid.v4()}
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