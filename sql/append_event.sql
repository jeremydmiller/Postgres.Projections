-- stream_id UUID, stream_type varchar(100), data json
CREATE OR REPLACE FUNCTION append_event(stream_id UUID, stream_type varchar, event_type varchar(100), data json) RETURNS int AS $$
	var raw = plv8.execute('select version, type from streams where id = $1', [stream_id]);
	var version = 1;
	if (raw.length == 1){
		version = parseInt(raw[0].version) + 1;
		if (stream_type == null){
			stream_type = raw[0].type;
		}
	};

	if (version == 1){
		plv8.execute('insert into streams (id, version, type) values ($1, $2, $3)', [stream_id, version, stream_type]);
	}
	else{
		plv8.execute('update streams set version = $1 where id = $2', [version, stream_id]);
	}

	plv8.execute('insert into events (stream_id, version, data, type) values ($1, $2, $3, $4)', [stream_id, version, data, event_type]);

	data.$type = event_type;

    plv8.projector.project(stream_id, stream_type, data);

	return version;
$$ LANGUAGE plv8;