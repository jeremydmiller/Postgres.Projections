require("../../lib/pg-events")
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