CREATE OR REPLACE FUNCTION pge_append_event(message json) RETURNS JSON AS $$
	return plv8.events.store(message);
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION pge_clean_all_events() RETURNS VOID AS $$
	return plv8.cleanAll();
$$ LANGUAGE plv8;

CREATE OR REPLACE FUNCTION pge_fetch_stream(id UUID) RETURNS JSON AS $$
	var raw = plv8.execute('select * from pge_streams where id = $1', [id]);

	if (raw.length == 0){
		return null;
	}

	var stream = {
		id: raw[0].id,
		type: raw[0].type,
		version: raw[0].version,
		events: []
	};

	var rows = plv8.execute('select data from pge_events where stream_id = $1 order by version', [id]);
	for (var i = 0; i < rows.length; i++){
		stream.events.push(rows[i].data);
	}


	return stream;
$$ LANGUAGE plv8;


CREATE OR REPLACE FUNCTION pge_find_view(id UUID, type varchar(100)) RETURNS JSON AS $$
	return plv8.projector.store.find(type, id);
$$ LANGUAGE plv8;
