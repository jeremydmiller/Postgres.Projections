var expect = require('chai').expect;

var seeder = require('../lib/postgres-seeder');

var connection = 'postgres://localhost/projections';

describe('The Database Seeder', function(){
	it('Should be able to seed the basic database schema', function(){
		seeder.seedAll({
			connection: connection
		});

		var pg = require('pg');
		pg.connect(connection, function(err, client, done){
			expect(err).to.be.null;

			client.query("select table_name from information_schema.tables where table_name like 'pge_%' order by table_name", function(err, result){
				expect(err).to.be.null;
				expect(result.rows.length).to.equal(4);
				
				expect(result.rows[0].table_name).to.equal('pge_events');
				expect(result.rows[1].table_name).to.equal('pge_projection_definitions');
				expect(result.rows[2].table_name).to.equal('pge_projections');
				expect(result.rows[3].table_name).to.equal('pge_streams');
			});

		});
	});
});