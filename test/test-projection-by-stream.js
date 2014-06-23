
var assert = require('chai').assert;
var expect = require('chai').expect;
var projector = require("../lib/projections");



describe('Projections by Stream', function(){
	it('uses a default $init function if none is provided', function(){
		var projection = projector
			.projectStream('Quest')
			.named('Party')
			.by({});

		var state = projection.applyEvent(null, {$type: 'QuestStarted'});
		assert.notEqual(null, state);
	});

	describe('Simple Projection', function(){
		projector
			.projectStream('Quest')
			.named('Party')
			.by({
				$init: function(){
					return {
						active: true,
						traveled: 0,
						location: null
					}
				},

				QuestStarted: function(state, evt){
					state.active = true;
					state.location = evt.location; 
				},

				TownReached: function(state, evt){
					state.location = evt.location;
					state.traveled += evt.traveled;
				},

				EndOfDay: function(state, evt){
					state.traveled += evt.traveled;
				},

				QuestEnded: function(state, evt){
					state.active = false;
					state.location = evt.location;
				},


			});


		var projection = projector.projections['Party'];

		describe('Projecting a single event', function(){
			it('should use the $init function if it exists to start the projection', function(){
				var initial = projection.applyEvent(null, {$type: 'QuestStarted', location: "Emond's Field"});
				expect(initial).to.deep.equal({active: true, traveled :0, location: "Emond's Field"});
			});

			it('should apply a single transform for the event type', function(){
				var state = projection.applyEvent(null, {$type: 'TownReached', location: "Baerlon", traveled: 4});
				expect(state).to.deep.equal({active: true, location: "Baerlon", traveled: 4});

			});
		});

		describe('Projecting a stream of events', function(){
			it('should apply each event to a single aggregate', function(){
				var state = projection.createSnapshot([
					{$type: 'QuestStarted', location: "Emond's Field"},
					{$type: 'EndOfDay', traveled: 3},
					{$type: 'EndOfDay', traveled: 5},
					{$type: 'TownReached', location: "Baerlon", traveled: 4}
				]);

				expect(state).to.deep.equal({
					location: "Baerlon", 
					traveled: 12,
					active: true
				});
			});
		});

		describe('Applying events to existing streams', function(){
			projection.processEvent(1, {$type: 'QuestStarted', location: "Emond's Field"});
			projection.processEvent(2, {$type: 'QuestStarted', location: "Rivendell"});

			projection.processEvent(1, {$type: 'TownReached', location: "Baerlon", traveled: 4});
			projection.processEvent(2, {$type: 'TownReached', location: "Moria", traveled: 100});

			projection.processEvent(1, {$type: 'EndOfDay', traveled: 13});


			var state1 = projection.store.find(1);
			expect(state1).to.deep.equal({location: 'Baerlon', active: true, traveled: 17});


			var state2 = projection.store.find(2);
			expect(state2).to.deep.equal({location: 'Moria', active: true, traveled: 100});



		});


	});


});