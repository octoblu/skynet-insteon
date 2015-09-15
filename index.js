var cheerio = require('cheerio');
var request = require('request');
var Insteon = require('home-controller').Insteon;
var url = require('url');

function getDefaultOptions(callback){
  request('http://connect.insteon.com/getinfo.asp', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log(body);
      try{
        $ = cheerio.load(body);
        var insteonAddress = url.parse($("strong a").attr("href"));
        if(insteonAddress.hostname){
          console.log("Found: ", insteonAddress.hostname);
          callback(null, {ipAddress: insteonAddress.hostname, portNumber: 9761});
        }else{
          callback("No hub found");
          console.log("No hub found");
        }
      }catch(err){
        console.log("Error", error);
        callback(err);
      }
    }
  });
}

function Plugin(messenger, options){
  this.messenger = messenger;
  this.options = options;
  return this;
}

var optionsSchema = {
  type: 'object',
  properties: {
    ipAddress: {
      type: 'string',
      required: true
    },
    portNumber: {
      type: 'number',
      required: false
    }
  }
};

var messageSchema = {
  type: 'object',
  properties: {
    on: {
      type: 'boolean',
      required: true
    },
    deviceId: {
      type: 'string',
      required: true
    },
    brightness: {
      type: 'number',
      required: false
    }
  }
};

Plugin.prototype.onMessage = function(data, cb){
  var payload = data.payload || data.message;
  var gateway = new Insteon();
  var port = payload.portNumber || 9761;
  var opts = this.options;
  var brightness = payload.brightness || 100;
  gateway.once('close', cb);
  gateway.once('error', cb);
  if(!payload || typeof payload.on !== 'boolean'){
    return;
  }
  function closeGateway(){
    gateway.close();
  }
  gateway.connect(opts.ipAddress, opts.portNumber, function(){
    var light = gateway.light(payload.deviceId)
    if(payload.on){
      return light.turnOn(brightness).then(closeGateway, cb);
    }
    light.turnOff().then(closeGateway, cb);
  });
};

Plugin.prototype.destroy = function(){
  //clean up
};

module.exports = {
  Plugin: Plugin,
  optionsSchema: optionsSchema,
  messageSchema: messageSchema,
  getDefaultOptions: getDefaultOptions
};
