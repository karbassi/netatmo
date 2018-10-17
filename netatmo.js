const util = require('util');
const EventEmitter = require("events").EventEmitter;
const request = require('request');
const moment = require('moment');

const BASE_URL = 'https://api.netatmo.net';

let username;
let password;
let client_id;
let client_secret;
let scope;
let access_token;

class netatmo extends EventEmitter {

  /**
   * @constructor
   * @param args
   */
  constructor(args) {
    super();
    this.authenticate(args);
  }

  /**
   * handleRequestError
   * @param err
   * @param response
   * @param body
   * @param message
   * @param critical
   * @returns {Error}
   */
  handleRequestError(err, response, body, message, critical) {
    let errorMessage = "";
    if (body && response.headers["content-type"].trim().toLowerCase().indexOf("application/json") !== -1) {
      errorMessage = JSON.parse(body);
      errorMessage = errorMessage && (errorMessage.error.message || errorMessage.error);
    } else if (typeof response !== 'undefined') {
      errorMessage = `Status code${response.statusCode}`;
    } else {
      errorMessage = "No response";
    }
    const error = new Error(`${message}: ${errorMessage}`);
    if (critical) {
      this.emit("error", error);
    } else {
      this.emit("warning", error);
    }
    return error;
  }

  /**
   * https://dev.netatmo.com/dev/resources/technical/guides/authentication
   * @param args
   * @param callback
   * @returns {netatmo}
   */
  authenticate(args, callback) {
    if (!args) {
      this.emit("error", new Error("Authenticate 'args' not set."));
      return this;
    }

    if (args.access_token) {
      access_token = args.access_token;
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
    scope = args.scope || 'read_station read_thermostat write_thermostat read_camera read_homecoach';

    const form = {
      client_id: client_id,
      client_secret: client_secret,
      username: username,
      password: password,
      scope: scope,
      grant_type: 'password',
    };

    const url = `${BASE_URL}/oauth2/token`;

    request({
      url: url,
      method: "POST",
      form: form,
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        return this.handleRequestError(err, response, body, "Authenticate error", true);
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
    });

    return this;
  }

  /**
   * https://dev.netatmo.com/dev/resources/technical/guides/authentication/refreshingatoken
   * @param refresh_token
   * @returns {netatmo}
   */
  authenticate_refresh(refresh_token) {

    const form = {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
      client_id: client_id,
      client_secret: client_secret,
    };

    const url = `${BASE_URL}/oauth2/token`;

    request({
      url: url,
      method: "POST",
      form: form,
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        return this.handleRequestError(err, response, body, "Authenticate refresh error");
      }

      body = JSON.parse(body);

      access_token = body.access_token;

      if (body.expires_in) {
        setTimeout(this.authenticate_refresh.bind(this), body.expires_in * 1000, body.refresh_token);
      }

      return this;
    });

    return this;
  }

  /**
   * https://dev.netatmo.com/dev/resources/technical/reference/weatherstation/getstationsdata
   * @param options
   * @param callback
   * @returns {*}
   */
  getStationsData(options, callback) {
    // Wait until authenticated.
    if (!access_token) {
      return this.on('authenticated', function () {
        this.getStationsData(options, callback);
      });
    }

    if (options != null && callback == null) {
      callback = options;
      options = null;
    }

    const url = `${BASE_URL}/api/getstationsdata`;

    const form = {
      access_token: access_token,
    };

    if (options) {
      if (options.device_id) {
        form.device_id = options.device_id;
      }
      if (options.get_favorites) {
        form.get_favorites = options.get_favorites;
      }
    }

    request({
      url: url,
      method: "POST",
      form: form,
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        return this.handleRequestError(err, response, body, "getStationsDataError error");
      }

      body = JSON.parse(body);

      const devices = body.body.devices;

      this.emit('get-stationsdata', err, devices);

      if (callback) {
        return callback(err, devices);
      }

      return this;

    });

    return this;
  }

  /**
   * https://dev.netatmo.com/dev/resources/technical/reference/thermostat/getthermostatsdata
   * @param options
   * @param callback
   * @returns {*}
   */
  getThermostatsData(options, callback) {
    // Wait until authenticated.
    if (!access_token) {
      return this.on('authenticated', function () {
        this.getThermostatsData(options, callback);
      });
    }

    if (options != null && callback == null) {
      callback = options;
      options = null;
    }

    let url = `${BASE_URL}/api/getthermostatsdata?access_token=${access_token}`;
    if (options != null) {
      url = `${url}&device_id=${options.device_id}`;
    }

    request({
      url: url,
      method: "GET",
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        return this.handleRequestError(err, response, body, "getThermostatsDataError error");
      }

      body = JSON.parse(body);

      const devices = body.body.devices;

      this.emit('get-thermostatsdata', err, devices);

      if (callback) {
        return callback(err, devices);
      }

      return this;

    });

    return this;
  }

  /**
   * https://dev.netatmo.com/dev/resources/technical/reference/common/getmeasure
   * @param options
   * @param callback
   * @returns {*}
   */
  getMeasure(options, callback) {
    // Wait until authenticated.
    if (!access_token) {
      return this.on('authenticated', function () {
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


    const url = `${BASE_URL}/api/getmeasure`;

    const form = {
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
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        const error = this.handleRequestError(err, response, body, "getMeasure error");
        if (callback) {
          callback(error);
        }
        return;
      }

      body = JSON.parse(body);

      const measure = body.body;

      this.emit('get-measure', err, measure);

      if (callback) {
        return callback(err, measure);
      }

      return this;

    });

    return this;
  }

  /**
   * https://dev.netatmo.com/dev/resources/technical/reference/thermostat/syncschedule
   * @param options
   * @param callback
   * @returns {*}
   */
  setSyncSchedule(options, callback) {
    // Wait until authenticated.
    if (!access_token) {
      return this.on('authenticated', function () {
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

    const url = `${BASE_URL}/api/syncschedule`;

    const form = {
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
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        return this.handleRequestError(err, response, body, "setSyncSchedule error");
      }

      body = JSON.parse(body);

      this.emit('set-syncschedule', err, body.status);

      if (callback) {
        return callback(err, body.status);
      }

      return this;

    });

    return this;
  }

  /**
   * https://dev.netatmo.com/dev/resources/technical/reference/thermostat/setthermpoint
   * @param options
   * @param callback
   * @returns {*}
   */
  setThermpoint(options, callback) {
    // Wait until authenticated.
    if (!access_token) {
      return this.on('authenticated', function () {
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

    const url = `${BASE_URL}/api/setthermpoint`;

    const form = {
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
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        return this.handleRequestError(err, response, body, "setThermpoint error");
      }

      body = JSON.parse(body);

      this.emit('get-thermostatsdata', err, body.status);

      if (callback) {
        return callback(err, body.status);
      }

      return this;

    });

    return this;
  }

  /**
   * https://dev.netatmo.com/dev/resources/technical/reference/welcome/gethomedata
   * @param options
   * @param callback
   * @returns {*}
   */
  getHomeData(options, callback) {
    // Wait until authenticated.
    if (!access_token) {
      return this.on('authenticated', function () {
        this.getHomeData(options, callback);
      });
    }

    const url = `${BASE_URL}/api/gethomedata`;

    const form = {
      access_token: access_token
    };

    if (options != null && callback == null) {
      callback = options;
      options = null;
    }

    if (options) {
      if (options.home_id) {
        form.home_id = options.home_id;
      }
      if (options.size) {
        form.size = options.size;
      }
    }

    request({
      url: url,
      method: "POST",
      form: form,
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        return this.handleRequestError(err, response, body, "getHomeData error");
      }

      body = JSON.parse(body);

      this.emit('get-homedata', err, body.body);

      if (callback) {
        return callback(err, body.body);
      }

      return this;

    });

    return this;
  }

  /**
   * https://dev.netatmo.com/dev/resources/technical/reference/welcome/getnextevents
   * @param options
   * @param callback
   * @returns {*}
   */
  getNextEvents(options, callback) {
    // Wait until authenticated.
    if (!access_token) {
      return this.on('authenticated', function () {
        this.getNextEvents(options, callback);
      });
    }

    if (!options) {
      this.emit("error", new Error("getNextEvents 'options' not set."));
      return this;
    }

    if (!options.home_id) {
      this.emit("error", new Error("getNextEvents 'home_id' not set."));
      return this;
    }

    if (!options.event_id) {
      this.emit("error", new Error("getNextEvents 'event_id' not set."));
      return this;
    }

    const url = `${BASE_URL}/api/getnextevents`;

    const form = {
      access_token: access_token,
      home_id: options.home_id,
      event_id: options.event_id,
    };

    if (options.size) {
      form.size = options.size;
    }

    request({
      url: url,
      method: "POST",
      form: form,
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        return this.handleRequestError(err, response, body, "getNextEvents error");
      }

      body = JSON.parse(body);

      this.emit('get-nextevents', err, body.body);

      if (callback) {
        return callback(err, body.body);
      }

      return this;

    });

    return this;
  }

  /**
   * https://dev.netatmo.com/dev/resources/technical/reference/welcome/getlasteventof
   * @param options
   * @param callback
   * @returns {*}
   */
  getLastEventOf(options, callback) {
    // Wait until authenticated.
    if (!access_token) {
      return this.on('authenticated', function () {
        this.getLastEventOf(options, callback);
      });
    }

    if (!options) {
      this.emit("error", new Error("getLastEventOf 'options' not set."));
      return this;
    }

    if (!options.home_id) {
      this.emit("error", new Error("getLastEventOf 'home_id' not set."));
      return this;
    }

    if (!options.person_id) {
      this.emit("error", new Error("getLastEventOf 'person_id' not set."));
      return this;
    }

    const url = `${BASE_URL}/api/getlasteventof`;

    const form = {
      access_token: access_token,
      home_id: options.home_id,
      person_id: options.person_id,
    };

    if (options.offset) {
      form.offset = options.offset;
    }

    request({
      url: url,
      method: "POST",
      form: form,
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        return this.handleRequestError(err, response, body, "getLastEventOf error");
      }

      body = JSON.parse(body);

      this.emit('get-lasteventof', err, body.body);

      if (callback) {
        return callback(err, body.body);
      }

      return this;

    });

    return this;
  }

  /**
   * https://dev.netatmo.com/dev/resources/technical/reference/welcome/geteventsuntil
   * @param options
   * @param callback
   * @returns {*}
   */
  getEventsUntil(options, callback) {
    // Wait until authenticated.
    if (!access_token) {
      return this.on('authenticated', function () {
        this.getEventsUntil(options, callback);
      });
    }

    if (!options) {
      this.emit("error", new Error("getEventsUntil 'options' not set."));
      return this;
    }

    if (!options.home_id) {
      this.emit("error", new Error("getEventsUntil 'home_id' not set."));
      return this;
    }

    if (!options.event_id) {
      this.emit("error", new Error("getEventsUntil 'event_id' not set."));
      return this;
    }

    const url = `${BASE_URL}/api/geteventsuntil`;

    const form = {
      access_token: access_token,
      home_id: options.home_id,
      event_id: options.event_id,
    };

    request({
      url: url,
      method: "POST",
      form: form,
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        return this.handleRequestError(err, response, body, "getEventsUntil error");
      }

      body = JSON.parse(body);

      this.emit('get-eventsuntil', err, body.body);

      if (callback) {
        return callback(err, body.body);
      }

      return this;

    });

    return this;
  }

  /**
   * https://dev.netatmo.com/dev/resources/technical/reference/welcome/getcamerapicture
   * @param options
   * @param callback
   * @returns {*}
   */
  getCameraPicture(options, callback) {
    // Wait until authenticated.
    if (!access_token) {
      return this.on('authenticated', function () {
        this.getCameraPicture(options, callback);
      });
    }

    if (!options) {
      this.emit("error", new Error("getCameraPicture 'options' not set."));
      return this;
    }

    if (!options.image_id) {
      this.emit("error", new Error("getCameraPicture 'image_id' not set."));
      return this;
    }

    if (!options.key) {
      this.emit("error", new Error("getCameraPicture 'key' not set."));
      return this;
    }

    const url = `${BASE_URL}/api/getcamerapicture`;

    const qs = {
      access_token: access_token,
      image_id: options.image_id,
      key: options.key,
    };

    request({
      url: url,
      method: "GET",
      qs: qs,
      encoding: null,
      contentType: 'image/jpg'
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        return this.handleRequestError(err, response, body, "getCameraPicture error");
      }

      this.emit('get-camerapicture', err, body);

      if (callback) {
        return callback(err, body);
      }

      return this;

    });

    return this;
  }

  /**
   * https://dev.netatmo.com/dev/resources/technical/reference/healthyhomecoach/gethomecoachsdata
   * @param options
   * @param callback
   * @returns {*}
   */
  getHealthyHomeCoachData(options, callback) {
    // Wait until authenticated.
    if (!access_token) {
      return this.on('authenticated', function () {
        this.getHealthyHomeCoachData(options, callback);
      });
    }

    if (options != null && callback == null) {
      callback = options;
      options = null;
    }

    let url = `${BASE_URL}/api/gethomecoachsdata?access_token=${access_token}`;
    if (options != null) {
      url = `${url}&device_id=${options.device_id}`;
    }

    request({
      url: url,
      method: "GET",
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        return this.handleRequestError(err, response, body, "getHealthyHomeCoachData error");
      }

      body = JSON.parse(body);

      const devices = body.body.devices;

      this.emit('get-healthhomecoaches-data', err, devices);

      if (callback) {
        return callback(err, devices);
      }

      return this;

    });

    return this;
  }

  /**
   * https://dev.netatmo.com/resources/technical/reference/weatherapi/getpublicdata
   * @param options
   * @param callback
   * @returns {*}
   */
  getPublicData(options, callback) {
    // Wait until authenticated.
    if (!access_token) {
      return this.on('authenticated', function () {
        this.getPublicData(options, callback);
      });
    }

    if (!options) {
      this.emit("error", new Error("getPublicData 'options' not set."));
      return this;
    }

    if (!options.lat_ne) {
      this.emit("error", new Error("getPublicData 'lat_ne' not set."));
      return this;
    }

    if (!options.lon_ne) {
      this.emit("error", new Error("getPublicData 'lon_ne' not set."));
      return this;
    }

    if (!options.lat_sw) {
      this.emit("error", new Error("getPublicData 'lat_sw' not set."));
      return this;
    }

    if (!options.lon_sw) {
      this.emit("error", new Error("getPublicData 'lat_sw' not set."));
      return this;
    }

    if (util.isArray(options.required_data)) {
      options.required_data = options.required_data.join(',');
    }

    // Remove any spaces from the type list if there is any.
    options.required_data = options.required_data.replace(/\s/g, '').toLowerCase();


    const url = `${BASE_URL}/api/getpublicdata`;

    const form = {
      access_token: access_token,
      lat_ne: options.lat_ne,
      lon_ne: options.lon_ne,
      lat_sw: options.lat_sw,
      lon_sw: options.lon_sw,
      required_data: options.required_data,
      filter: options.filter,
    };

    request({
      url: url,
      method: "POST",
      form: form,
    }, (err, response, body) => {
      if (err || response.statusCode != 200) {
        const error = this.handleRequestError(err, response, body, "getPublicData error");
        if (callback) {
          callback(error);
        }
        return;
      }

      body = JSON.parse(body);

      const measure = body.body;

      this.emit('get-publicdata', err, measure);

      if (callback) {
        return callback(err, measure);
      }

      return this;

    });

    return this;
  }
}

module.exports = netatmo;
