'use strict';

var events    = require('events');
var logger = require('tracer').colorConsole();
var fs = require('fs');

var _URI_RULES_ = "https://api.nasonlines.com/v1/SmartNas/files/rules";

class SmartNas {

    constructor(plugin = 'SqliteDriver', args = {}){
      this.loadPlugins(plugin, args)
      this.uriRules = _URI_RULES_;
      this.rules = {}
      this.module_loaded = false

    }

    level(path, stats) {
      var fs = require('fs')
      var pModule = require('path')

      var ret = {
        SN_ext_level:null,
        SN_rs_level:null,
        SN_atime_level:null,
        SN_atime_count:null
      }

      // Range_size find level
      this.rules.rules.range_size.content.some(function(element) {
        if (stats.size >= element.minimum && element.maximum == -1){
            ret.SN_rs_level = element.level
            return ;
        } else if (stats.size >= element.minimum && stats.size <= element.maximum){
          ret.SN_rs_level = element.level
          return ;
        }
      });

      // SN_atime_level find level
      let file_atime_secondes = stats.atime.getTime()/1000;
      let current_time = new Date().getTime()/1000;
      let timeBetweenTwoDate = current_time - file_atime_secondes;

      this.rules.rules.range_atime.content.some(function(element) {
        if (timeBetweenTwoDate >= element.minimum && element.maximum == -1){
            ret.SN_atime_level = element.level
            return ;
        } else if (timeBetweenTwoDate >= element.minimum && timeBetweenTwoDate <= element.maximum){
          ret.SN_atime_level = element.level
          return ;
        }
      });

      // SN_ext_level find level
      let extension = pModule.extname(path).substr(1, pModule.extname(path).length)
      let levelUnknown = 0;
      let temporaryArr = []

      this.rules.rules.range_atime.content.some(function(element) {
          if (element.ext === "unknown"){
            levelUnknown = element.level;
          }
          temporaryArr.push(element.ext)
      });

      let find = temporaryArr.indexOf(extension);

      if (find == -1) {
        ret.SN_ext_level = levelUnknown
      } else {
        ret.SN_ext_level = this.rules.rules.range_atime.content[find].level
      }

      // SN_atime_count find
      var Base64 = require('js-base64').Base64;
      let dataFromDriver = this.driver.getInfoFile(Base64.encode(path));
      if (dataFromDriver != undefined) {
        ret.SN_atime_count = dataFromDriver.SN_atime_count;
      } else {
        ret.SN_atime_count = 0;
      }

      return (ret)

    }
    loadRulesFromURI() {
      var request = require('request');
      var self = this;

      request(this.uriRules, function (error, response, body) {
        if (error != null || (response && response.statusCode) != 200 ){
          logger.debug("Cannot get clean response from server")
          self.emit('smartResponse', "Cannot get clean response from server")
          self.module_loaded = false
        } else {
          try {
            let json = JSON.parse(body)
            self.rules = json
            logger.debug("Get rules cleanly")
            self.emit('smartResponse', "Module SmartNas OK")
            self.module_loaded = true
          } catch (e) {
            logger.debug("Cannot get clean json")
            self.emit('smartResponse', "Cannot get clean json")
            self.module_loaded = false
          }
        }
      }).on('error', function(err) {
        logger.debug("Unknown error")
        self.emit('smartResponse', "Unknown error")
        self.module_loaded = false
      });
    }
    loadPlugins(name, args) {
      if (fs.existsSync('plugins/'+name+'.js')) {
        var  Driver = require('plugins/SqliteDriver.js')
        this.driver = new Driver(args);
      } else {
        logger.error('Plugin expected not found');
        throw "Plugin expected not found"
      }
    }

    algorithm(level = 0, limit = 100){
      return (this.driver.lookingFor(level, limit))
    }

}

SmartNas.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = SmartNas;
