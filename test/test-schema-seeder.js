var expect = require('chai').expect;

var seeder = require('../lib/seeder');
var _ = require('underscore-node');
var connection = 'postgres://jeremill:@localhost/projections';

describe('The Database Seeder', function(){
	//seeder.seedAll({
	//	connection: connection
	//});

	it('Should be able to seed the basic database schema', function(done){
		seeder.seedAll({connection: connection})
			.then(function(result){

				expect(result.tables).to.deep.equal(['pge_events', 'pge_modules', 'pge_projection_definitions', 'pge_projections', 'pge_streams']);
				
				expect(result.modules).to.deep.equal(['eventstore', 'persistor', 'pg-events']);

				done();
			})
			.error(function(err){
				done(err);
			});
	});

	it('should be able to load all the projections from a folder path', function(){
		var projector = require('../lib/pg-events');
		projector.reset();

		seeder.loadProjections({projection_folder: __dirname + '/projections'});

		expect(projector.activeProjectionNames()).to.deep.equal(['Arrival', 'Party', 'Traveled']);
	});

});



