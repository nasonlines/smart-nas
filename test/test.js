var should = require('chai').should();
var SmartNas = require('../index.js')
var Database = require('better-sqlite3');

function generateFakeDatabase(path){
  let db = new Database(path);
  let create = "CREATE TABLE tamer (path TEXT NOT NULL UNIQUE, sent BOOLEAN, mtime varchar(255), size int, priority int)";
  db.exec(create)
}

function generateDefaultDatabase(path){
  let db = new Database(path);
  let create = "CREATE TABLE files (path TEXT NOT NULL UNIQUE, sent BOOLEAN, mtime varchar(255), size int, priority int)";
  db.exec(create)
}

/* SMART-NAS TESTS */
describe('Start SmartNas with plugins', function() {
  var databasePath = './test/db/sqlite_'+new Date().getTime()+'.db';
  generateDefaultDatabase(databasePath)

  describe('# Should pass', function() {
    it('specified driver', function() {
      (function () {
        new SmartNas("SqliteDriver", databasePath);
      }).should.not.throw("Plugin expected not found");
    });

    it('specified driver and specified path', function() {
      (function () {
        new SmartNas("SqliteDriver", databasePath);
      }).should.not.throw("Database path passed in parametters is not found");
    });
  });

  describe('# Should not pass', function() {
    it('bad name driver', function() {
      (function () {
        new SmartNas("bullshit");
      }).should.throw("Plugin expected not found");
    });
    it('without good arguments', function() {
      (function () {
        new SmartNas("SqliteDriver", 'test/db/sqlite.db.lol0ta');
      }).should.throw("Database path passed in parametters is not found");
    });
  });

});
describe('Upgrading databases', function() {
  var dbPath;
  it('upgrade database perfectly', function() {
    var databasePath = './test/db/sqlite_'+new Date().getTime()+'.db';
    dbPath = databasePath;
    generateDefaultDatabase(databasePath);
    let smartNas = new SmartNas("SqliteDriver", dbPath);
  });
  it('Was already upgraded', function() {
    let smartNas = new SmartNas("SqliteDriver", dbPath);
  });
  it('database not compatible', function() {
    var databasePath = './test/db/sqlite_'+new Date().getTime()+'.db';
    generateFakeDatabase(databasePath);
    (function () {
      let smartNas = new SmartNas("SqliteDriver", databasePath);
    }).should.throw("no such table: files");
  });

});
describe('Gettings rules from server', function(){
  it('Get rules from server in json', function(done) {
    var databasePath = './test/db/sqlite_'+new Date().getTime()+'.db';
    generateDefaultDatabase(databasePath);
    let smartNas = new SmartNas("SqliteDriver", databasePath);
    smartNas.loadRulesFromURI();
    smartNas.on('smartResponse', function(data){
      data.should.not.equal('Cannot get clean response from server');
      data.should.not.equal('Cannot get clean json');
      data.should.not.equal('Unknown error');
      done();
    })
  });
})
describe('Get values from Algorithm', function(){
    it('Try a files', function(done) {
      var databasePath = './test/db/sqlite_'+new Date().getTime()+'.db';
      generateDefaultDatabase(databasePath);
      let smartNas = new SmartNas("SqliteDriver", databasePath);
      smartNas.loadRulesFromURI();
      smartNas.on('smartResponse', function(data){
        smartNas.level(databasePath);
        done();
      })
    });
})
