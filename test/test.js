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

function insertFakersFiles(path){
  let db = new Database(path);
  var faker = require('faker');
  for (var i = 0; i < 1000; i++){
    var Base64 = require('js-base64').Base64;
    var data = {
      path  : Base64.encode("c:/"+faker.random.number()+"/"+faker.system.commonFileName()),
      sent  : faker.random.boolean(),
      mtime  : faker.date.past(),
      priority  : 0,
      size:faker.random.number(),
      SN_ext_level:Math.floor(Math.random() * 6) + 1 ,
      SN_rs_level:Math.floor(Math.random() * 6) + 1 ,
      SN_atime_level:Math.floor(Math.random() * 6) + 1,
      SN_atime_last: faker.date.past(),
      SN_atime_count:faker.random.number(),
      SN_a_sent: faker.random.boolean(),
      SN_is_live: faker.random.boolean()
    }
    let insert = "INSERT INTO files (path, sent, mtime, priority, size, SN_ext_level, SN_rs_level,SN_atime_level,SN_atime_last, SN_atime_count,SN_a_sent,SN_is_live) VALUES ('"+data.path+"','"+data.sent+"','"+data.mtime+"','"+data.priority+"','"+data.size+"','"+data.SN_ext_level+"','"+data.SN_rs_level+"','"+data.SN_atime_level+"','"+data.SN_atime_last+"','"+data.SN_atime_count+"','"+data.SN_a_sent+"','"+data.SN_is_live+"');";
    db.exec(insert)
  }
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
  this.timeout(15000000);
    it('Try a files', function(done) {
      var databasePath = './test/db/sqlite_'+new Date().getTime()+'.db';
      generateDefaultDatabase(databasePath);
      let smartNas = new SmartNas("SqliteDriver", databasePath);
      insertFakersFiles(databasePath);
      smartNas.loadRulesFromURI();
      smartNas.on('smartResponse', function(data){
        smartNas.level(databasePath);
        smartNas.algorithm(0, 142)[0].path
        done();
      })
    });
})
