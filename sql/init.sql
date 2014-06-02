CREATE LANGUAGE PLV8;



SET plv8.start_proc = plv8_projections_init;

CREATE OR REPLACE FUNCTION plv8_projections_init() RETURNS VOID AS $$

$$ LANGUAGE plv8;
