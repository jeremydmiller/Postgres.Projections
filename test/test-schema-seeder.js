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

				expect(result.tables).to.deep.equal(['pge_events', 'pge_modules', 'pge_projection_definitions', 'pge_projections', 'pge_streams']);


				done();
			})
			.error(function(err){
				done(err);
			});
		});
});

/*


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

