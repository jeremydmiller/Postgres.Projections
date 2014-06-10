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
				
				expect(result.modules).to.deep.equal(['EventStore', 'Persistor', 'Projector']);

				done();
			})
			.error(function(err){
				done(err);
			});
	});

});



