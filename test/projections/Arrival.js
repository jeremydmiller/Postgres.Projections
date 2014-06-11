require("../../lib/pg-events")
	.projectEvent('TownReached')
	.named('Arrival')
	.by(function(evt){
		id = id + 1;

		return {
			town: evt.location,
			$id: id
		};
	});