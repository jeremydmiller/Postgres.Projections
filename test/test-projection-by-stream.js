/*



// Projection across a stream of events
require('postgres-projections')
	.projectStream('stream type1')
	.named('name of projection')
	.async() // this will be optional
	.by({
		$init: function(){
			return {count:0, members:[]};
		},
 
		[Event Name]: function(state, evt){
			// modify the existing state here
		}
 
	}); 


*/


var assert = require("assert")
var projector = require("../lib/postgres-projections");

beforeEach(function(){
	projector.reset();
});

describe('Projections by Stream', function(){
	it('uses a default $init function if none is provided', function(){
		var projection = projector
			.projectStream('Quest')
			.named('Party')
			.by({});

		var state = projection.applyEvent(null, 'QuestStarted', {});
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
						fatalities: 0
					}
				},

				QuestStarted: function(state, evt){
					state.active = true;
					state.location = evt.location; 
					state.members = evt.members;
				},

				QuestEnded: function(state, evt){
					state.active = false;
					state.location = evt.location;
				}
			});


		var projection = projector.projections['Party'];

		describe('Project a single event', function(){
			it('should use the $init function if it exists to start the projection', function(){
				var initial = projection.applyEvent(null, 'QuestStarted', {location: "Emond's Field", members: ['Rand', 'Perrin', 'Mat']});
				assert.equal(true, initial.active);
				assert.equal(0, initial.fatalities);
			});

			it('should apply a single transform for the event type', function(){
				var state = projection.applyEvent(null, 'QuestStarted', {location: "Emond's Field", members: ['Rand', 'Perrin', 'Mat']});
				assert.equal(state.location, "Emond's Field");
				assert.equal(3, state.members.length);
			});
		});


	});


});