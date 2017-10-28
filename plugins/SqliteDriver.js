'use strict';

var events    = require('events');
var logger    = require('tracer').colorConsole();
var Database = require('better-sqlite3');
var fs = require('fs');

class SqliteDriver_SmartNas {
    constructor(databasePath){

      if (!fs.existsSync(databasePath)) {
        throw "Database path passed in parametters is not found"
      }

      logger.debug("Driver loaded");
      this.databasePath = databasePath;
      this.checkIfUpgradeIsNeededAndUpgrade();
      this.database = new Database(this.databasePath);
    }

    checkIfUpgradeIsNeededAndUpgrade() {
      let db = new Database(this.databasePath);
      db.exec("SELECT * FROM files");
      try {
        db.exec("ALTER TABLE files ADD COLUMN SN_ext_level INT;");
        db.exec("ALTER TABLE files ADD COLUMN SN_rs_level INT;");
        db.exec("ALTER TABLE files ADD COLUMN SN_atime_level INT;");
        db.exec("ALTER TABLE files ADD COLUMN SN_a_sent BOOLEAN;");
        db.exec("ALTER TABLE files ADD COLUMN SN_is_live BOOLEAN;");
        logger.debug("Database just be upgraded")
        db.close();
      } catch (e) {
        logger.debug("Database is already upgraded")
        db.close();
      }

    }

}

SqliteDriver_SmartNas.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = SqliteDriver_SmartNas;
