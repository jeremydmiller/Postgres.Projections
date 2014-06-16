\i initializer.sql;
\i append_events.sql;

truncate table pge_streams CASCADE ;

select pge_initialize();

select pge_append_event('{"id":"21bdc410-f15c-11e3-a583-7325f030e4a2" ,"type": "QuestStarted", "streamType": "Quest", "data": {"location": "Rivendell"}}');

select * from pge_events;
select * from pge_streams;