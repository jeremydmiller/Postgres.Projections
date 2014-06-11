var expect = require('chai').expect;

var seeder = require('../lib/seeder');
var _ = require('underscore-node');
var connection = 'postgres://jeremill:@localhost/projections';
var projectionFolder = __dirname + '/projections';

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

describe('The Database Seeder', function(){
	it('Should be able to seed the basic database schema', function(done){
		seeder.seedAll({connection: connection})
			.then(function(result){

				expect(result.tables).to.include('pge_events');
				expect(result.tables).to.include('pge_modules');
				expect(result.tables).to.include('pge_projection_definitions');
				expect(result.tables).to.include('pge_projections');
				expect(result.tables).to.include('pge_streams');

				expect(result.modules).to.deep.equal(['eventstore', 'persistor', 'pg-events']);

				done();
			})
			.error(function(err){
				done(err);
			});
	});

	it('should be able to load all the projections from a folder path', function(){
		var projector = require('../lib/pg-events');
		var files = projector.loadProjectionsFromFolder(projectionFolder);

		expect(projector.activeProjectionNames()).to.deep.equal(['Arrival', 'Party', 'Traveled']);
	});

	it('should be able to generate all the DDL for projection tables', function(){
		var DDL = seeder.generateDDL({projection_folder: projectionFolder});

		console.log(DDL);

		expect(DDL).to.include('DROP TABLE IF EXISTS pge_projections_Arrival CASCADE;');
		expect(DDL).to.include('CREATE TABLE pge_projections_Arrival (');
		expect(DDL).to.include('DROP TABLE IF EXISTS pge_projections_Party CASCADE;');
		expect(DDL).to.include('CREATE TABLE pge_projections_Party (');

		// shouldn't be adding a new table for an aggregate
		expect(DDL).to.not.include('Traveled');
	});
});



