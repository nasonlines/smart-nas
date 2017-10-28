'use strict';

var events    = require('events');
var logger = require('tracer').colorConsole();
var fs = require('fs');

class SmartNas {
    constructor(plugin = 'SqliteDriver', args = {}){
      this.loadPlugins(plugin, args)
    }

    loadPlugins(name, args) {
      if (fs.existsSync('./plugins/'+name+'.js')) {
        var  Driver = require('./plugins/SqliteDriver.js')
        this.driver = new Driver(args);
      } else {
        logger.error('Plugin expected not found');
        throw "Plugin expected not found"
      }
    }
}

SmartNas.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = SmartNas;
