var netatmo = require('./netatmo');

var auth = {
  "client_id": "",
  "client_secret": "",
  "username": "",
  "password": "",
};

var api = new netatmo(auth);

// EXAMPLE #1

// Get Stations Data
// See docs: https://dev.netatmo.com/dev/resources/technical/reference/weatherstation/getstationsdata
api.getStationsData(function(err, devices) {
  console.log(devices);
});

// Get Measure
// See docs: https://dev.netatmo.com/dev/resources/technical/reference/common/getmeasure
var options = {
  device_id: '',
  scale: 'max',
  type: ['Temperature', 'CO2', 'Humidity', 'Pressure', 'Noise'],
};

api.getMeasure(options, function(err, measure) {
  console.log(measure.length);
  console.log(measure[0]);
});


// Set Sync Schedule
// See docs: https://dev.netatmo.com/dev/resources/technical/reference/thermostat/syncschedule
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


// Set Thermpoint
// See docs: https://dev.netatmo.com/dev/resources/technical/reference/thermostat/setthermpoint
var options = {
  device_id: '',
  module_id: '',
  setpoint_mode: '',
};

api.setThermpoint(options, function(err, status) {
  console.log(status);
});


// EXAMPLE #2

var getStationsData = function(err, devices) {
  console.log(devices);
};

var getMeasure = function(err, measure) {
  console.log(measure.length);
  console.log(measure[0]);
};

var getThermostatsData = function(err, devices) {
  console.log(devices);
};

var setSyncSchedule = function(err, status) {
  console.log(status);
};

var setThermpoint = function(err, status) {
  console.log(status);
};

var getHomeData = function(err, data) {
  console.log(data);
};

var handleEvents = function(err, data) {
  console.log(data.events_list);
};


// Event Listeners
api.on('get-stationsdata', getStationsData);
api.on('get-measure', getMeasure);
api.on('get-thermostatsdata', getThermostatsData);
api.on('set-syncschedule', setSyncSchedule);
api.on('set-thermpoint', setThermpoint);
api.on('get-homedata', getHomeData);
api.on('get-nextevents', handleEvents);
api.on('get-lasteventof', handleEvents);
api.on('get-eventsuntil', handleEvents);

// Get Stations Data
// See docs: https://dev.netatmo.com/doc/methods/getstationsdata
api.getStationsData();

// Get Measure
// See docs: https://dev.netatmo.com/dev/resources/technical/reference/common/getmeasure
var options = {
  device_id: '',
  scale: 'max',
  type: ['Temperature', 'CO2', 'Humidity', 'Pressure', 'Noise'],
};

api.getMeasure(options);

// Get Thermostats Data
// See docs: https://dev.netatmo.com/dev/resources/technical/reference/thermostat/getthermostatsdata
var options = {
  device_id: '',
};

api.getThermostatsData(options);

// Set Sync Schedule
// See docs: https://dev.netatmo.com/dev/resources/technical/reference/thermostat/syncschedule
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

api.setSyncSchedule(options);

// Set Thermstate
// See docs: https://dev.netatmo.com/dev/resources/technical/reference/thermostat/setthermpoint
var options = {
  device_id: '',
  module_id: '',
  setpoint_mode: '',
};

api.setThermpoint(options);

// Get Home Data
// https://dev.netatmo.com/dev/resources/technical/reference/cameras/gethomedata
api.getHomeData();

// Get Next Events
// See docs: https://dev.netatmo.com/dev/resources/technical/reference/cameras/getnextevents
var options = {
  home_id: '',
  event_id: ''
};

api.getNextEvents(options);

// Get Last Event Of
// See docs: https://dev.netatmo.com/dev/resources/technical/reference/cameras/getlasteventof
var options = {
  home_id: '',
  person_id: ''
};

api.getLastEventOf(options);

// Get Events Until
// See docs: https://dev.netatmo.com/dev/resources/technical/reference/cameras/geteventsuntil
var options = {
  home_id: '',
  event_id: ''
};

api.getEventsUntil(options);

// Get Camera Picture
// See docs: https://dev.netatmo.com/dev/resources/technical/reference/cameras/getcamerapicture
var options = {
  image_id: '',
  key: ''
};

api.getCameraPicture(options);

// Get Healthy Home Coach Data
// See docs: https://dev.netatmo.com/dev/resources/technical/reference/healthyhomecoach/gethomecoachsdata
var options = {
  device_id: '',
};

api.getHealthyHomeCoachData(options);

