DROP TABLE IF EXISTS TRACE CASCADE;
CREATE TABLE TRACE (
	text	varchar(250)
);

DROP TABLE IF EXISTS Party_Projection CASCADE;
CREATE TABLE Party_Projection (
	id			uuid CONSTRAINT pk_party_projection PRIMARY KEY,
	data		json NOT NULL	
);

CREATE OR REPLACE FUNCTION update_Party_projection() RETURNS trigger AS $$
	

	//var plan = plv8.prepare( 'INSERT INTO Party_Projection (id, data) values ($1)', ['json'] );

	//plan.execute([transform(NEW.data)]);
$$ LANGUAGE plv8;

DROP TRIGGER update_Party_projection ON events CASCADE;
CREATE TRIGGER update_Party_projection AFTER INSERT ON events
    FOR EACH ROW EXECUTE PROCEDURE update_Party_projection();


--CREATE OR REPLACE FUNCTION json_play(left JSON, right JSON)
--RETURNS JSON AS $$
--  for (var key in right) { left[key] = right[key]; }
--  return left;
--$$ LANGUAGE plv8;

--select json_play('{"a":"1", "b":"2"}', '{"c":"3"}');

truncate streams cascade;


select append_event('cdd82fef-2c14-46a5-a2f3-e866cc6f4568', 'quest', 'QuestStarted', 
	'{"location": "Two Rivers", "members":["Rand", "Perrin", "Mat", "Lan"]}');

select append_event('cdd82fef-2c14-46a5-a2f3-e866cc6f4568', 'quest', 'TownReached', 
	'{"location": "Taren Ferry"}');

select append_event('cdd82fef-2c14-46a5-a2f3-e866cc6f4568', 'quest', 'MemberLost', 
	'{"member": "Thom"}');

select append_event('cdd82fef-2c14-46a5-a2f3-e866cc6f4568', 'quest', 'MemberJoined', 
	'{"member": "Nynaeve"}');

select append_event('cdd82fef-2c14-46a5-a2f3-e866cc6f4568', 'quest', 'TownReached', 
	'{"location": "Baerlon"}');

select append_event('cdd82fef-2c14-46a5-a2f3-e866cc6f4568', 'quest', 'EnemyDispatched', 
	'{"location":"Shadar Logoth" "Trollocs": {"Mat":1, "Perrin":"2", "Rand":"3"}, "Fades":{"Lan":1}}');

select append_event('cdd82fef-2c14-46a5-a2f3-e866cc6f4568', 'quest', 'EnemyDispatched', 
	'{"location":"Caemlyn" "Trollocs": {"Lan":3}, "Fades":{"Lan":1}}');




select * from TRACE;

--select * from streams;

--select * from events;


