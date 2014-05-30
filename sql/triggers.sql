DROP TABLE IF EXISTS TRACE CASCADE;
CREATE TABLE TRACE (
	text	varchar(250)
);

CREATE OR REPLACE FUNCTION play_trigger() RETURNS trigger AS $$
	function transform(x){
		return {wrapper: x.foo};
	}

	var plan = plv8.prepare( 'INSERT INTO TRACE (text) values ($1)', ['json'] );

	plan.execute([transform(NEW.data)]);
$$ LANGUAGE plv8;

DROP TRIGGER play_trigger ON events CASCADE;
CREATE TRIGGER play_trigger AFTER INSERT ON events
    FOR EACH ROW EXECUTE PROCEDURE play_trigger();


--CREATE OR REPLACE FUNCTION json_play(left JSON, right JSON)
--RETURNS JSON AS $$
--  for (var key in right) { left[key] = right[key]; }
--  return left;
--$$ LANGUAGE plv8;

--select json_play('{"a":"1", "b":"2"}', '{"c":"3"}');

truncate streams cascade;


select append_event('cdd82fef-2c14-46a5-a2f3-e866cc6f4568', 'shopping', '{"foo": "bar"}');
select append_event('cdd82fef-2c14-46a5-a2f3-e866cc6f4568', 'shopping', '{"foo": "baz"}');
select append_event('cdd82fef-2c14-46a5-a2f3-e866cc6f4568', 'shopping', '{"foo": "bonkers"}');

select * from TRACE;

--select * from streams;

--select * from events;


DROP TABLE IF EXISTS ShoppingCart_Projection CASCADE;
CREATE TABLE ShoppingCart_Projection (
	id			uuid CONSTRAINT pk_shoppingcart_projection PRIMARY KEY,
	data		json NOT NULL	
);