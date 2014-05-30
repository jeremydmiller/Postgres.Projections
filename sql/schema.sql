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
	timestamp	timestamp without time zone default (now() at time zone 'utc') NOT NULL,
	CONSTRAINT pk_events PRIMARY KEY(stream_id, version)
);

-- stream_id UUID, stream_type varchar(100), data json
CREATE OR REPLACE FUNCTION append_event(streamId UUID, streamType varchar(100), data json)
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

	insert into events (stream_id, version, data) values (streamId, v, data);

	raise notice 'The version is %', v;

	RETURN v;
END;
$$ LANGUAGE plpgsql;


