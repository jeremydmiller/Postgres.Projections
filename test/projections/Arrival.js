require("../../lib/pg-events")
	.projectEvent('TownReached')
	.named('Arrival')
	.by(function(evt){
		id = (evt.id || 0) + 1;

		return {
			town: evt.location,
			$id: id
		};
	});