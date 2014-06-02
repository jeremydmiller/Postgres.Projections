DROP TABLE IF EXISTS Trace CASCADE;
CREATE TABLE Trace (
	text		varchar(100)
);

DROP TABLE IF EXISTS streams CASCADE;
CREATE TABLE streams (
	id			uuid CONSTRAINT pk_streams PRIMARY KEY,
	type		varchar(100) NOT NULL,
	version		integer NOT NULL	
);


DROP TABLE IF EXISTS events;
CREATE TABLE events (
	stream_id	uuid REFERENCES streams ON DELETE CASCADE,
	version		integer NOT NULL,
	data		json NOT NULL,
	type 		varchar(100) NOT NULL,
	timestamp	timestamp without time zone default (now() at time zone 'utc') NOT NULL,
	CONSTRAINT pk_events PRIMARY KEY(stream_id, version)
);

-- stream_id UUID, stream_type varchar(100), data json
CREATE OR REPLACE FUNCTION append_event(streamId UUID, streamType varchar(100), eventType varchar(100), data json)
RETURNS INT AS $$
DECLARE
	v integer;
BEGIN
	SELECT max(version) INTO v FROM events WHERE stream_id = streamId;
	IF v is NULL THEN
		v := 1;

		insert into streams (id, type, version) values (streamId, streamType, v);
	ELSE
		v := v + 1;

		update streams set version = v where id = streamId;
	END IF;

	insert into events (stream_id, version, data, type) values (streamId, v, data, eventType);

	RETURN v;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION load_stream(id UUID, stream json)
RETURNS VOID AS $$
	var streamType = stream.type;

	for (var i = 0; i < stream.events.length; i++){
		var evt = stream.events[i];

		var version = plv8.execute('select append_event($1, $2, $3, $4)', [id, streamType, evt.type, evt.data]);
	}
$$ LANGUAGE plv8;





