var util = require('util');
var EventEmitter = require("events").EventEmitter;
var request = require('request');
var moment = require('moment');

const BASE_URL = 'https://api.netatmo.net';

var username;
var password;
var client_id;
var client_secret;
var scope;
var access_token;

var netatmo = function(args) {
  EventEmitter.call(this);
  this.authenticate(args);
};

util.inherits(netatmo, EventEmitter);

netatmo.prototype.handleRequestError = function(err,response,body,message,critical) {
  var errorMessage = "";
  if (body) {
    errorMessage = JSON.parse(body);
    errorMessage = errorMessage && errorMessage.error;
  } else if (typeof response !== 'undefined') {
    errorMessage = "Status code" + response.statusCode;
  }
  else {
    errorMessage = "No response";
  }
  var error = new Error(message + ": " + errorMessage);
  if(critical) {
    this.emit("error", error);
  } else {
    this.emit("warning", error);
  }
  return error;
};

// http://dev.netatmo.com/doc/authentication
netatmo.prototype.authenticate = function(args, callback) {
  if (!args) {
    this.emit("error", new Error("Authenticate 'args' not set."));
    return this;
  }

  if (!args.client_id) {
    this.emit("error", new Error("Authenticate 'client_id' not set."));
    return this;
  }

  if (!args.client_secret) {
    this.emit("error", new Error("Authenticate 'client_secret' not set."));
    return this;
  }

  if (!args.username) {
    this.emit("error", new Error("Authenticate 'username' not set."));
    return this;
  }

  if (!args.password) {
    this.emit("error", new Error("Authenticate 'password' not set."));
    return this;
  }

  username = args.username;
  password = args.password;
  client_id = args.client_id;
  client_secret = args.client_secret;
  scope = args.scope || 'read_station read_thermostat write_thermostat';

  var form = {
    client_id: client_id,
    client_secret: client_secret,
    username: username,
    password: password,
    scope: scope,
    grant_type: 'password',
  };

  var url = util.format('%s/oauth2/token', BASE_URL);

  request({
    url: url,
    method: "POST",
    form: form,
  }, function(err, response, body) {
    if (err || response.statusCode != 200) {
      return this.handleRequestError(err,response,body,"Authenticate error", true);
    }

    body = JSON.parse(body);

    access_token = body.access_token;

    if (body.expires_in) {
      setTimeout(this.authenticate_refresh.bind(this), body.expires_in * 1000, body.refresh_token);
    }

    this.emit('authenticated');

    if (callback) {
      return callback();
    }

    return this;
  }.bind(this));

  return this;
};

// http://dev.netatmo.com/doc/authentication
netatmo.prototype.authenticate_refresh = function(refresh_token) {

  var form = {
    grant_type: 'refresh_token',
    refresh_token: refresh_token,
    client_id: client_id,
    client_secret: client_secret,
  };

  var url = util.format('%s/oauth2/token', BASE_URL);

  request({
    url: url,
    method: "POST",
    form: form,
  }, function(err, response, body) {
    if (err || response.statusCode != 200) {
      return this.handleRequestError(err,response,body,"Authenticate refresh error");
    }

    body = JSON.parse(body);

    access_token = body.access_token;

    if (body.expires_in) {
        setTimeout(this.authenticate_refresh.bind(this), body.expires_in * 1000, body.refresh_token);
    }

    return this;
  }.bind(this));

  return this;
};

// http://dev.netatmo.com/doc/restapi/getuser
netatmo.prototype.getUser = function(callback) {
  // Wait until authenticated.
  if (!access_token) {
    return this.on('authenticated', function() {
      this.getUser(callback);
    });
  }

  var url = util.format('%s/api/getuser', BASE_URL);

  var form = {
    access_token: access_token,
  };

  request({
    url: url,
    method: "POST",
    form: form,
  }, function(err, response, body) {
    if (err || response.statusCode != 200) {
      return this.handleRequestError(err,response,body,"getUser error");
    }

    body = JSON.parse(body);

    this.emit('get-user', err, body.body);

    if (callback) {
      return callback(err, body.body);
    }

    return this;

  }.bind(this));

  return this;
};

// http://dev.netatmo.com/doc/restapi/devicelist
netatmo.prototype.getDevicelist = function(options, callback) {
  // Wait until authenticated.
  if (!access_token) {
    return this.on('authenticated', function() {
      this.getDevicelist(options, callback);
    });
  }

  if (options != null && callback == null) {
    callback = options;
    options = null;
  }

  var url = util.format('%s/api/devicelist', BASE_URL);

  var form = {
    access_token: access_token,
  };

  if (options && options.app_type) {
    form.app_type = options.app_type;
  }

  request({
    url: url,
    method: "POST",
    form: form,
  }, function(err, response, body) {
    if (err || response.statusCode != 200) {
      return this.handleRequestError(err,response,body,"getDevicelist error");
    }

    body = JSON.parse(body);

    var devices = body.body.devices;
    var modules = body.body.modules;

    this.emit('get-devicelist', err, devices, modules);

    if (callback) {
      return callback(err, devices, modules);
    }

    return this;

  }.bind(this));

  return this;
};

// http://dev.netatmo.com/doc/restapi/getmeasure
netatmo.prototype.getMeasure = function(options, callback) {
  // Wait until authenticated.
  if (!access_token) {
    return this.on('authenticated', function() {
      this.getMeasure(options, callback);
    });
  }

  if (!options) {
    this.emit("error", new Error("getMeasure 'options' not set."));
    return this;
  }

  if (!options.device_id) {
    this.emit("error", new Error("getMeasure 'device_id' not set."));
    return this;
  }

  if (!options.scale) {
    this.emit("error", new Error("getMeasure 'scale' not set."));
    return this;
  }

  if (!options.type) {
    this.emit("error", new Error("getMeasure 'type' not set."));
    return this;
  }

  if (util.isArray(options.type)) {
    options.type = options.type.join(',');
  }

  // Remove any spaces from the type list if there is any.
  options.type = options.type.replace(/\s/g, '').toLowerCase();


  var url = util.format('%s/api/getmeasure', BASE_URL);

  var form = {
    access_token: access_token,
    device_id: options.device_id,
    scale: options.scale,
    type: options.type,
  };

  if (options) {

    if (options.module_id) {
      form.module_id = options.module_id;
    }

    if (options.date_begin) {
      if (options.date_begin <= 1E10) {
        options.date_begin *= 1E3;
      }

      form.date_begin = moment(options.date_begin).utc().unix();
    }

    if (options.date_end === 'last') {
      form.date_end = 'last';
    } else if (options.date_end) {
      if (options.date_end <= 1E10) {
        options.date_end *= 1E3;
      }
      form.date_end = moment(options.date_end).utc().unix();
    }

    if (options.limit) {
      form.limit = parseInt(options.limit, 10);

      if (form.limit > 1024) {
        form.limit = 1024;
      }
    }

    if (options.optimize !== undefined) {
      form.optimize = !!options.optimize;
    }

    if (options.real_time !== undefined) {
      form.real_time = !!options.real_time;
    }
  }

  request({
    url: url,
    method: "POST",
    form: form,
  }, function(err, response, body) {
    if (err || response.statusCode != 200) {
      var error = this.handleRequestError(err,response,body,"getMeasure error");
      if (callback) {
        callback(error);
      }
      return;
    }

    body = JSON.parse(body);

    var measure = body.body;

    this.emit('get-measure', err, measure);

    if (callback) {
      return callback(err, measure);
    }

    return this;

  }.bind(this));

  return this;
};

// http://dev.netatmo.com/doc/restapi/getthermstate
netatmo.prototype.getThermstate = function(options, callback) {
  // Wait until authenticated.
  if (!access_token) {
    return this.on('authenticated', function() {
      this.getThermstate(options, callback);
    });
  }

  if (!options) {
    this.emit("error", new Error("getThermstate 'options' not set."));
    return this;
  }

  if (!options.device_id) {
    this.emit("error", new Error("getThermstate 'device_id' not set."));
    return this;
  }

  if (!options.module_id) {
    this.emit("error", new Error("getThermstate 'module_id' not set."));
    return this;
  }

  var url = util.format('%s/api/getthermstate', BASE_URL);

  var form = {
    access_token: access_token,
    device_id: options.device_id,
    module_id: options.module_id,
  };

  request({
    url: url,
    method: "POST",
    form: form,
  }, function(err, response, body) {
    if (err || response.statusCode != 200) {
      return this.handleRequestError(err,response,body,"getThermstate error");
    }

    body = JSON.parse(body);

    this.emit('get-thermstate', err, body.body);

    if (callback) {
      return callback(err, body.body);
    }

    return this;

  }.bind(this));

  return this;
};

// http://dev.netatmo.com/doc/restapi/syncschedule
netatmo.prototype.setSyncSchedule = function(options, callback) {
  // Wait until authenticated.
  if (!access_token) {
    return this.on('authenticated', function() {
      this.setSyncSchedule(options, callback);
    });
  }

  if (!options) {
    this.emit("error", new Error("setSyncSchedule 'options' not set."));
    return this;
  }

  if (!options.device_id) {
    this.emit("error", new Error("setSyncSchedule 'device_id' not set."));
    return this;
  }

  if (!options.module_id) {
    this.emit("error", new Error("setSyncSchedule 'module_id' not set."));
    return this;
  }

  if (!options.zones) {
    this.emit("error", new Error("setSyncSchedule 'zones' not set."));
    return this;
  }

  if (!options.timetable) {
    this.emit("error", new Error("setSyncSchedule 'timetable' not set."));
    return this;
  }

  var url = util.format('%s/api/syncschedule', BASE_URL);

  var form = {
    access_token: access_token,
    device_id: options.device_id,
    module_id: options.module_id,
    zones: options.zones,
    timetable: options.timetable,
  };

  request({
    url: url,
    method: "POST",
    form: form,
  }, function(err, response, body) {
    if (err || response.statusCode != 200) {
      return this.handleRequestError(err,response,body,"setSyncSchedule error");
    }

    body = JSON.parse(body);

    this.emit('set-syncschedule', err, body.status);

    if (callback) {
      return callback(err, body.status);
    }

    return this;

  }.bind(this));

  return this;
};

// http://dev.netatmo.com/doc/restapi/setthermpoint
netatmo.prototype.setThermpoint = function(options, callback) {
  // Wait until authenticated.
  if (!access_token) {
    return this.on('authenticated', function() {
      this.setThermpoint(options, callback);
    });
  }

  if (!options) {
    this.emit("error", new Error("setThermpoint 'options' not set."));
    return this;
  }

  if (!options.device_id) {
    this.emit("error", new Error("setThermpoint 'device_id' not set."));
    return this;
  }

  if (!options.module_id) {
    this.emit("error", new Error("setThermpoint 'module_id' not set."));
    return this;
  }

  if (!options.setpoint_mode) {
    this.emit("error", new Error("setThermpoint 'setpoint_mode' not set."));
    return this;
  }

  var url = util.format('%s/api/setthermpoint', BASE_URL);

  var form = {
    access_token: access_token,
    device_id: options.device_id,
    module_id: options.module_id,
    setpoint_mode: options.setpoint_mode,
  };

  if (options) {

    if (options.setpoint_endtime) {
      form.setpoint_endtime = options.setpoint_endtime;
    }

    if (options.setpoint_temp) {
      form.setpoint_temp = options.setpoint_temp;
    }

  }

  request({
    url: url,
    method: "POST",
    form: form,
  }, function(err, response, body) {
    if (err || response.statusCode != 200) {
      return this.handleRequestError(err,response,body,"setThermpoint error");
    }

    body = JSON.parse(body);

    console.log(body);

    this.emit('get-thermstate', err, body.status);

    if (callback) {
      return callback(err, body.status);
    }

    return this;

  }.bind(this));

  return this;
};

module.exports = netatmo;
