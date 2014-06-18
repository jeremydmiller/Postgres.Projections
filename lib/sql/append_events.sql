CREATE OR REPLACE FUNCTION pge_append_event(message json) RETURNS JSON AS $$
	return plv8.events.store(message);
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION pge_clean_all_events() RETURNS VOID AS $$
	return plv8.cleanAll();
$$ LANGUAGE plv8;