var uuid = require('node-uuid');
var client = require('../lib/client');
var expect = require('chai').expect;
var quest = require('./quest-events');
var seeder = require('../lib/seeder');

var connection = 'postgres://jeremill:@localhost/projections';
var projectionFolder = __dirname + '/projections';

var e1_1 = quest.QuestStarted("Emond's Field", ['Rand', 'Perrin', 'Mat', 'Thom', 'Egwene', 'Moiraine']);
var e1_2 = quest.EndOfDay(5);
var e1_3 = quest.TownReached('Baerlon', 11);
var e1_4 = quest.MembersDeparted('Shadar Logoth', ['Thom']);
var e1_5 = quest.EndOfDay(15);
var e1_6 = quest.QuestEnded('Eye of the World', 117);

var e2_1 = quest.QuestStarted("Faldor's Farm", ['Garion', 'Pol', 'Belgarath', 'Durnik']);
var e2_2 = quest.EndOfDay(10);
var e2_3 = quest.TownReached('Camaar', 23);
var e2_4 = quest.MembersJoined('Sendaria', ['Barak', 'Silk']);
var e2_5 = quest.TownReached('Cherek', 34);
var e2_6 = quest.MembersJoined('Vo Wacune', ['Lelldorin']);
var e2_7 = quest.MembersJoined('Mimbre', ['Mandorallen']);
var e2_8 = quest.MembersDeparted('Mimbre', ['Lelldorin']);

var e3_1 = quest.QuestStarted('Rivendell', ['Gandolf', 'Gimli', 'Aragorn', 'Legolas', 'Merry', 'Pippin', 'Sam', 'Frodo', 'Boromir']);
var e3_2 = quest.EndOfDay(7);
var e3_3 = quest.TownReached('Moria', 111);
var e3_4 = quest.MembersDeparted('Moria', ['Gandolf']);

describe.only('End to End Event Capture and Projections', function(){
	var client = require('../lib/client');
	client.start({connection: connection});

	before(function(done){
		return seeder.seedAll({connection: connection, projection_folder: projectionFolder})
			.then(function(){
				done();
			})
			.error(function(err){
				console.log(err);
				done(err);
			});
	});

	beforeEach(function(done){
		return client.cleanAll()
			.then(function(){
				done();
			})
			.error(function(err){
				console.log(err);
				done(err);
			});
	});

	it('is okay', function(){
		expect(1).to.equal(1);
	});
});