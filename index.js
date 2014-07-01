var Insteon = require('home-controller').Insteon;

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
    }
  }
};

Plugin.prototype.onMessage = function(data, cb){
  console.log('insteon onMessage', data, this.options);
  var payload = data.payload || data.message;
  var gateway = new Insteon();
  var port = payload.portNumber || 9761;
  var opts = this.options;
  gateway.once('close', function(){
      console.log('closed!', opts.ipAddress);
    cb();
  });
  gateway.once('error', cb);
  if(payload !== undefined && typeof payload.on === 'boolean'){
    gateway.connect(opts.ipAddress, opts.portNumber, function(){
      console.log('Connected!', opts.ipAddress);
      if(payload.on){
        gateway.light(payload.deviceId)
               .turnOn(100)
               .then(function(){
          console.log('Light on!', payload.deviceId);
          gateway.close();
        }, cb);
      }else{
        gateway.light(payload.deviceId)
               .turnOff()
               .then(function(){
          console.log('Light off!', payload.deviceId);
          gateway.close();
        }, cb);
      }
    });
  }
};

Plugin.prototype.destroy = function(){
  //clean up
  console.log('destroying.', this.options);
};


module.exports = {
  Plugin: Plugin,
  optionsSchema: optionsSchema,
  messageSchema: messageSchema
};
