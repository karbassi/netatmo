var netatmo = require('./netatmo');

var auth = {
  "client_id": "",
  "client_secret": "",
  "username": "",
  "password": "",
};

var api = new netatmo(auth);

// EXAMPLE #1

// Get User
// See Docs: http://dev.netatmo.com/doc/restapi/getuser
api.getUser(function(err, user) {
  console.log(user);
});

// Get Devicelist
// See docs: http://dev.netatmo.com/doc/restapi/devicelist
api.getDevicelist(function(err, devices, modules) {
  console.log(devices);
  console.log(modules);
});

// Get Stations Data
// See docs: https://dev.netatmo.com/doc/methods/getstationsdata
api.getStationsData(function(err, devices) {
  console.log(devices);
});

// Get Measure
// See docs: http://dev.netatmo.com/doc/restapi/getmeasure
var options = {
  device_id: '',
  scale: 'max',
  type: ['Temperature', 'CO2', 'Humidity', 'Pressure', 'Noise'],
};

api.getMeasure(options, function(err, measure) {
  console.log(measure.length);
  console.log(measure[0]);
});

// Get Thermstate
// See docs: http://dev.netatmo.com/doc/restapi/getthermstate
var options = {
  device_id: '',
  module_id: '',
};

api.getThermstate(options, function(err, result) {
  console.log(result);
});

// Set Sync Schedule
// See docs: http://dev.netatmo.com/doc/restapi/syncschedule
var options = {
  device_id: '',
  module_id: '',
  zones: [
    { type: 0, id: 0, temp: 19 },
    { type: 1, id: 1, temp: 17 },
    { type: 2, id: 2, temp: 12 },
    { type: 3, id: 3, temp: 7 },
    { type: 5, id: 4, temp: 16 }
  ],
  timetable: [
    { m_offset: 0, id: 1 },
    { m_offset: 420, id: 0 },
    { m_offset: 480, id: 4 },
    { m_offset: 1140, id: 0 },
    { m_offset: 1320, id: 1 },
    { m_offset: 1860, id: 0 },
    { m_offset: 1920, id: 4 },
    { m_offset: 2580, id: 0 },
    { m_offset: 2760, id: 1 },
    { m_offset: 3300, id: 0 },
    { m_offset: 3360, id: 4 },
    { m_offset: 4020, id: 0 },
    { m_offset: 4200, id: 1 },
    { m_offset: 4740, id: 0 },
    { m_offset: 4800, id: 4 },
    { m_offset: 5460, id: 0 },
    { m_offset: 5640, id: 1 },
    { m_offset: 6180, id: 0 },
    { m_offset: 6240, id: 4 },
    { m_offset: 6900, id: 0 },
    { m_offset: 7080, id: 1 },
    { m_offset: 7620, id: 0 },
    { m_offset: 8520, id: 1 },
    { m_offset: 9060, id: 0 },
    { m_offset: 9960, id: 1 }
  ],
};

api.setSyncSchedule(options, function(err, status) {
  console.log(status);
});


// Set Thermstate
// See docs: http://dev.netatmo.com/doc/restapi/setthermpoint
var options = {
  device_id: '',
  module_id: '',
  setpoint_mode: '',
};

api.setThermpoint(options, function(err, status) {
  console.log(status);
});


// EXAMPLE #2

var getUser = function(err, user) {
  console.log(user);
};

var getDevicelist = function(err, devices, modules) {
  console.log(devices);
  console.log(modules);
};

var getStationsData = function(err, devices) {
  console.log(devices);
  console.log(modules);
};

var getMeasure = function(err, measure) {
  console.log(measure.length);
  console.log(measure[0]);
};

var getThermstate = function(err, result) {
  console.log(result);
};

var setSyncSchedule = function(err, status) {
  console.log(status);
};

var setThermpoint = function(err, status) {
  console.log(status);
};

// Event Listeners
api.on('get-user', getUser);
api.on('get-devicelist', getDevicelist);
api.on('get-stationsdata', getStationsData);
api.on('get-measure', getMeasure);
api.on('get-thermstate', getThermstate);
api.on('set-syncschedule', setSyncSchedule);
api.on('set-thermpoint', setThermpoint);

// Get User
// See Docs: http://dev.netatmo.com/doc/restapi/getuser
api.getUser();

// Get Devicelist
// See docs: http://dev.netatmo.com/doc/restapi/devicelist
api.getDevicelist();

// Get Stations Data
// See docs: https://dev.netatmo.com/doc/methods/getstationsdata
api.getStationsData();

// Get Measure
// See docs: http://dev.netatmo.com/doc/restapi/getmeasure
var options = {
  device_id: '',
  scale: 'max',
  type: ['Temperature', 'CO2', 'Humidity', 'Pressure', 'Noise'],
};

api.getMeasure(options);

// Get Thermstate
// See docs: http://dev.netatmo.com/doc/restapi/getthermstate
var options = {
  device_id: '',
  module_id: '',
};

api.getThermstate();

// Set Sync Schedule
// See docs: http://dev.netatmo.com/doc/restapi/syncschedule
var options = {
  device_id: '',
  module_id: '',
  zones: [
    { type: 0, id: 0, temp: 19 },
    { type: 1, id: 1, temp: 17 },
    { type: 2, id: 2, temp: 12 },
    { type: 3, id: 3, temp: 7 },
    { type: 5, id: 4, temp: 16 }
  ],
  timetable: [
    { m_offset: 0, id: 1 },
    { m_offset: 420, id: 0 },
    { m_offset: 480, id: 4 },
    { m_offset: 1140, id: 0 },
    { m_offset: 1320, id: 1 },
    { m_offset: 1860, id: 0 },
    { m_offset: 1920, id: 4 },
    { m_offset: 2580, id: 0 },
    { m_offset: 2760, id: 1 },
    { m_offset: 3300, id: 0 },
    { m_offset: 3360, id: 4 },
    { m_offset: 4020, id: 0 },
    { m_offset: 4200, id: 1 },
    { m_offset: 4740, id: 0 },
    { m_offset: 4800, id: 4 },
    { m_offset: 5460, id: 0 },
    { m_offset: 5640, id: 1 },
    { m_offset: 6180, id: 0 },
    { m_offset: 6240, id: 4 },
    { m_offset: 6900, id: 0 },
    { m_offset: 7080, id: 1 },
    { m_offset: 7620, id: 0 },
    { m_offset: 8520, id: 1 },
    { m_offset: 9060, id: 0 },
    { m_offset: 9960, id: 1 }
  ],
};

api.setSyncSchedule();

// Set Thermstate
// See docs: http://dev.netatmo.com/doc/restapi/setthermpoint
var options = {
  device_id: '',
  module_id: '',
  setpoint_mode: '',
};

api.setThermpoint();

api.getHomeData();

// Get Next Events
// See docs: https://dev.netatmo.com/doc/methods/getnextevents
var options = {
  home_id: '',
  event_id: ''
};

api.getNextEvents();

// Get Next Events
// See docs: https://dev.netatmo.com/doc/methods/getlasteventof
var options = {
  home_id: '',
  person_id: ''
};

api.getLastEventOf();

// Get Next Events
// See docs: https://dev.netatmo.com/doc/methods/geteventsuntil
var options = {
  home_id: '',
  event_id: ''
};

api.getEventsUntil();

// Get Next Events
// See docs: https://dev.netatmo.com/doc/methods/getcamerapicture
var options = {
  image_id: '',
  key: ''
};

api.getCameraPicture(options);
