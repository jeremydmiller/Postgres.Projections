CREATE OR REPLACE FUNCTION load_stream(id UUID, stream json)
RETURNS VOID AS $$
	var appender = plv8.find_function('append_event');

	for (var i = 0; i < stream.events.length; i++){
		var evt = stream.events[i];

		appender(id, stream.type, evt.$type, evt.data);
	}
$$ LANGUAGE plv8;