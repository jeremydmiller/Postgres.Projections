var uuid = require('node-uuid');
var client = require('../lib/client');
var expect = require('chai').expect;

describe('The client.toEventMessage() method', function(){
	it('should pass through a single argument', function(){
		var message = {
			type: 'Quest',
			data: [{$type:'QuestStarted'}]
		};

		expect(client.toEventMessage([message])).to.deep.equal(message);
	});

	it('should recognize that a uuid is an id', function(){
		var id = uuid.v4();

		var expected = {
			id: id,
			data: [{$type: 'QuestStarted'}]
		};

		expect(client.toEventMessage([id, expected.data[0]])).to.deep.equal(expected);
	});

	it('should recognize that a uuid and string is id and type', function(){
		var id = uuid.v4();

		var expected = {
			id: id,
			type: 'Quest',
			data: [{$type: 'QuestStarted'}]
		};

		expect(client.toEventMessage([id, 'Quest', expected.data[0]])).to.deep.equal(expected);
	});


	it('should recognize that a string argument is type', function(){
		var expected = {
			type: 'Quest',
			data: [{$type: 'QuestStarted'}]
		};

		expect(client.toEventMessage(['Quest', expected.data[0]])).to.deep.equal(expected);
	});

	it('should combine the rest of the arguments into the event array', function(){
		var expected = {
			type: 'Quest',
			data: [{$type: 'QuestStarted'}, {$type: 'TownReached'}, {$type: 'EndOfDay'}]
		};

		expect(client.toEventMessage(['Quest', expected.data[0], expected.data[1], expected.data[2]])).to.deep.equal(expected);
	});

	it('should accept an array of events as the last argument as well', function(){
		var expected = {
			type: 'Quest',
			data: [{$type: 'QuestStarted'}, {$type: 'TownReached'}, {$type: 'EndOfDay'}]
		};

		expect(client.toEventMessage(['Quest', expected.data])).to.deep.equal(expected);
	});
});