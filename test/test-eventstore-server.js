var expect = require('chai').expect;
var EventStore = require("../lib/eventstore-server");

function InMemoryPersistor(){
	this.id = 0;

	this.data = {};

	this.newId = function(){
		this.id = this.id + 1;

		return this.id;
	}

	this.insertStream = function(id, version, type){
		this.data[id] = {id: id, version: version, type: type, events:[]};
	}

	this.updateStream = function(id, version){
		this.data[id].version = version;
	}

	this.findStream = function(id){
		return this.data[id];
	}

	this.appendEvent = function(id, version, data, eventType, eventId){
		data.$id = eventId;
		data.$type = eventType;
		this.findStream(id).events.push(data);
	}

	this.reset = function(){
		this.data = {};
	}

	return this;
}

describe("The EventStore Server Module", function(){
	var persistor = new InMemoryPersistor();
	var eventstore = require('../lib/eventstore-server').create(persistor, {streamType: 'foo'});
	var stream = null;
	var event = null;



	describe('When storing an event for a new stream with explicits for stream type and event id', function(){
		beforeEach(function(){
			persistor.reset();

			eventstore.store({
				id: 1,
				streamType: 'bar',
				type: 'QuestStarted',
				data: {location: 'Rivendell'},
				eventId: 4
			});

			stream = persistor.findStream(1);
			event = stream.events[0];
		});

		it('should create the new stream with the given stream type, id, and version', function(){

			expect(stream.id).to.equal(1);
			expect(stream.type).to.equal('bar');
			expect(stream.version).to.equal(1);
		});

		it('should capture the first event with the id and event type', function(){
			expect(event).to.deep.equal({location: 'Rivendell', $id: 4, $type: 'QuestStarted'});
		});


	});

	describe('When storing an event for a new stream with no stream type or event id', function(){
		beforeEach(function(){
			persistor.reset();

			eventstore.store({
				id: 1,
				type: 'QuestStarted',
				data: {location: 'Rivendell'}
			});

			stream = persistor.findStream(1);
			event = stream.events[0];
		});

		it('should create the new stream with the default stream type', function(){

			expect(stream.type).to.equal('foo');
		});

		it('should capture the first event with an auto-generated id', function(){
			expect(event.$id).to.not.be.null;
		});


	});

	describe('When appending an event to an existing stream', function(){
		beforeEach(function(){
			persistor.reset();

			eventstore.store({
				id: 1,
				type: 'QuestStarted',
				data: {location: 'Rivendell'}
			});

			eventstore.store({
				id: 1,
				type: 'TownReached',
				data: {location: 'Moria'},
				eventId: 6
			});

			stream = persistor.findStream(1);
			event = stream.events[1];
		});

		it('should capture the second event', function(){
			expect(event).to.deep.equal({$id: 6, $type: 'TownReached', location: 'Moria'})
		});

		it('should increment the version of the stream', function(){
			expect(stream.version).to.equal(2);
		});
	});
});