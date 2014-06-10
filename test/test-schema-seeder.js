var expect = require('chai').expect;

var seeder = require('../lib/postgres-seeder');

var connection = 'postgres://jeremill:@localhost/projections';

describe('The Database Seeder', function(){
	//seeder.seedAll({
	//	connection: connection
	//});

	it('Should be able to seed the basic database schema', function(done){
		seeder.seedAll({connection: connection})
			.then(function(result){
				expect(result.rowCount).to.equal(5);

				expect(result.rows[0].table_name).to.equal('pge_events');
				expect(result.rows[1].table_name).to.equal('pge_modules');
				expect(result.rows[2].table_name).to.equal('pge_projection_definitions');
				expect(result.rows[3].table_name).to.equal('pge_projections');
				expect(result.rows[4].table_name).to.equal('pge_streams');

				done();
			})
			.error(function(err){
				done(err);
			});

	});

/*
	it.only('Should be able to seed the basic database schema', function(){
		var pg = require('pg');
		pg.connect(connection, function(err, client, done){
			expect(err).to.be.null;

			client.query("select table_name from information_schema.tables where table_name like 'pge_%' order by table_name", function(err, result){
				expect(err).to.be.null;
				expect(result.rows.length).to.equal(5);
				
				expect(result.rows[0].table_name).to.equal('pge_events');
				expect(result.rows[1].table_name).to.equal('pge_modules');
				expect(result.rows[2].table_name).to.equal('pge_projection_definitions');
				expect(result.rows[3].table_name).to.equal('pge_projections');
				expect(result.rows[4].table_name).to.equal('pge_streams');
				done(client);
			});



		});

		

	});

	it('should insert the EventStore module', function(){
console.log('I am in here.');
		require('pg').connect(connection, function(err, client, done){
			expect(err).to.be.null;
console.log('I am in here.');
			client.query("select name from pge_modules", function(err, result){
				console.log('I am in here.');

				expect(err).to.be.null;

				expect(result.rows.length).to.equal(1);

				for (var i = 0; i < result.rows.length; i++){
					console.log(result[i].name);
				}

				expect(result.rows[0].name).to.equal('EventStore');

				done(client);
			});

		});
	});
*/

});