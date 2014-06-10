CREATE OR REPLACE FUNCTION pge_append_event(message json) RETURNS INT AS $$
	// TODO -- add the projections
	return plv8.events.store(message);
$$ LANGUAGE plv8;