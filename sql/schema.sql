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

-- TODO: add an index on id and type. 
DROP TABLE IF EXISTS projections CASCADE;
CREATE TABLE projections (
	id			uuid,
	type 		varchar(100) NOT NULL,
	data		json NOT NULL,
	CONSTRAINT pk_projections PRIMARY KEY(id, type)
);

DROP TABLE IF EXISTS projection_definitions CASCADE;
CREATE TABLE projection_definitions (
	name			varchar(100) CONSTRAINT pk_projection_definitions PRIMARY KEY,
	definition		varchar(1000) NOT NULL
);







