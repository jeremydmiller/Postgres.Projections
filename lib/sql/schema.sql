DROP TABLE IF EXISTS pge_streams CASCADE;
CREATE TABLE pge_streams (
	id			uuid CONSTRAINT pk_pge_streams PRIMARY KEY,
	type		varchar(100) NOT NULL,
	version		integer NOT NULL	
);


DROP TABLE IF EXISTS pge_events;
CREATE TABLE pge_events (
	stream_id	uuid REFERENCES pge_streams ON DELETE CASCADE,
	version		integer NOT NULL,
	data		json NOT NULL,
	type 		varchar(100) NOT NULL,
	timestamp	timestamp without time zone default (now() at time zone 'utc') NOT NULL,
	CONSTRAINT pk_pge_events PRIMARY KEY(stream_id, version)
);

-- TODO: add an index on id and type. 
DROP TABLE IF EXISTS pge_projections CASCADE;
CREATE TABLE pge_projections (
	id			uuid,
	type 		varchar(100) NOT NULL,
	data		json NOT NULL,
	CONSTRAINT pk_pge_projections PRIMARY KEY(id, type)
);

DROP TABLE IF EXISTS pge_projection_definitions CASCADE;
CREATE TABLE pge_projection_definitions (
	name			varchar(100) CONSTRAINT pk_pge_projection_definitions PRIMARY KEY,
	definition		varchar(1000) NOT NULL
);

DROP TABLE IF EXISTS pge_modules CASCADE;
CREATE TABLE pge_modules (
	name			varchar(100) CONSTRAINT pk_pge_modules PRIMARY KEY,
	definition		varchar(3000) NOT NULL
);



-- stream_id UUID, stream_type varchar(100), data json
CREATE OR REPLACE FUNCTION pge_append_event(stream_id UUID, stream_type varchar, event_type varchar(100), data json) RETURNS int AS $$
	var raw = plv8.execute('select version, type from pg_streams where id = $1', [stream_id]);
	var version = 1;
	if (raw.length == 1){
		version = parseInt(raw[0].version) + 1;
		if (stream_type == null){
			stream_type = raw[0].type;
		}
	};

	if (version == 1){
		plv8.execute('insert into pg_streams (id, version, type) values ($1, $2, $3)', [stream_id, version, stream_type]);
	}
	else{
		plv8.execute('update pg_streams set version = $1 where id = $2', [version, stream_id]);
	}

	plv8.execute('insert into pg_events (stream_id, version, data, type) values ($1, $2, $3, $4)', [stream_id, version, data, event_type]);

	data.$type = event_type;

    //plv8.projector.project(stream_id, stream_type, data);

	return version;
$$ LANGUAGE plv8;



