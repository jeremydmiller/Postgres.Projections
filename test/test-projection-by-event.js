var assert = require('chai').assert;
var expect = require('chai').expect;
var projector = require("../lib/postgres-projections");

beforeEach(function(){
	projector.reset();
});

describe('Projecting an event', function(){
	it('should transform and event and place it in the right store', function(){
		var projection = projector
			.projectEvent('TownReached')
			.named('Arrival')
			.by(function(evt){
				return {
					town: evt.location
				};
			});


		projection.processEvent(1, {location: "Caemlyn"});
		projection.processEvent(2, {location: "Four Kings"});
		projection.processEvent(3, {location: "Whitebridge"});

		expect(projection.store.find(1)).to.deep.equal({town: "Caemlyn"});
		expect(projection.store.find(2)).to.deep.equal({town: "Four Kings"});
		expect(projection.store.find(3)).to.deep.equal({town: "Whitebridge"});
	});
});