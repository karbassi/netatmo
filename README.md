netatmo
=======================

A node.js module to interface with the [netatmo api](http://dev.netatmo.com/) API.

Getting Starting
---

1. Make sure you have a netatmo account.
2. Make sure you have at least one netatmo device set up.

Install
---

```sh
npm install netatmo
```

Example #1
---

```javascript
var netatmo = require('netatmo');

var auth = {
  "client_id": "",
  "client_secret": "",
  "username": "",
  "password": "",
};

var api = new netatmo(auth);

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


// Get Home Data
// See docs: https://dev.netatmo.com/doc/methods/gethomedata
api.getHomeData(function(err, data) {
  console.log(data);
});


// Get Next Events
// See docs: https://dev.netatmo.com/doc/methods/getnextevents
var options = {
  home_id: '',
  event_id: ''
};

api.getNextEvents(options, function(err,events) {
  console.log(events);
});
```

Example #2
---

```javascript
var netatmo = require('netatmo');

var auth = {
  "client_id": "",
  "client_secret": "",
  "username": "",
  "password": "",
};

var api = new netatmo(auth);

var getUser = function(err, user) {
  console.log(user);
};

var getDevicelist = function(err, devices, modules) {
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

var getCameraPicture = function(err, picture) {
  console.log(picture); // image/jpeg
}

var setSyncSchedule = function(err, status) {
  console.log(status);
};

var setThermpoint = function(err, status) {
  console.log(status);
};

// Event Listeners
api.on('get-user', getUser);
api.on('get-devicelist', getDevicelist);
api.on('get-measure', getMeasure);
api.on('get-thermstate', getThermstate);
api.on('get-camerapicture', getCameraPicture);
api.on('set-syncschedule', setSyncSchedule);
api.on('set-thermpoint', setThermpoint);

// Get User
// See Docs: http://dev.netatmo.com/doc/restapi/getuser
api.getUser();

// Get Devicelist
// See docs: http://dev.netatmo.com/doc/restapi/devicelist
api.getDevicelist();

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
```

Catching Errors and Warnings
---

```javascript
var netatmo = require('netatmo');

var auth = {
  "client_id": "",
  "client_secret": "",
  "username": "",
  "password": "",
};

var api = new netatmo(auth);

api.on("error", function(error) {
    // When the "error" event is emitted, this is called
    console.error('Netatmo threw an error: ' + error);
});

api.on("warning", function(error) {
    // When the "warning" event is emitted, this is called
    console.log('Netatmo threw a warning: ' + error);
});

// Rest of program
```
