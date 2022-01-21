/* eslint-disable ava/prefer-async-await */
//@ts-check
const process = require('process');
const test = require('ava');
const netatmo = require('../netatmo');
// eslint-disable-next-line ava/no-import-test-files
const { getCredentials, getTestParameters } = require('./credentials');
const regexMacAddr = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\\.[0-9a-fA-F]{4}\\.[0-9a-fA-F]{4})$/;

// @ts-ignore
// test produces a "Uncaught exception in test.js" 
test.serial.before('try authenticate without credentials', async t => {
    const auth = {
        "client_id": "",
        "client_secret": "",
        "username": "",
        "password": "",
    };

    const error = await t.throwsAsync(async () => {
        new netatmo(auth);
    });
    t.is(error.message, 'Authenticate \'client_id\' not set.');
    t.pass();
});

// @ts-ignore
// beforeEach or test.serial is required, two concurrent calls to netatmo are not possible!
test.before('authenticate', t => {
    const auth = getCredentials();
    t.context.api = new netatmo(auth);
    t.assert(t.context.api);
});

/**
 * @param {netatmo} api
 * @param {function} func
 * @param {*} [options=null]
 * @return {Promise}
 */

function apiCallAsync(api, func, options = null) {
    return new Promise(function (resolve, reject) {
        function errorWarningHandler(error) {
            reject(error.message);
        }
        // @ts-ignore
        api.on("error", errorWarningHandler);
        // @ts-ignore
        api.on("warning", errorWarningHandler);

        function uncaughtExceptionHandler(reason) {
            reject(reason.message);
        }
        // @ts-ignore
        // eslint-disable-next-line no-unused-vars
        process.on('uncaughtException', uncaughtExceptionHandler);

        func.bind(api)(options, function (err, data) {
            process.removeListener('uncaughtException', uncaughtExceptionHandler);
            // @ts-ignore
            api.removeListener('error', errorWarningHandler);
            // @ts-ignore
            api.removeListener('warning', errorWarningHandler);
            if (err !== null) reject(err);
            else resolve(data);
        });
    });
}

// @ts-ignore
test.serial('homesData without home_id', t => {
    return apiCallAsync(t.context.api, t.context.api.homesData).then(result => {
        t.assert(result);
        t.assert(Array.isArray(result.homes));
        // console.log(result.homes[1].modules);
    }).catch(error => { t.is(error, ''); });
});

// @ts-ignore
test.serial('homesData with invalid home_id', t => {
    return apiCallAsync(t.context.api, t.context.api.homesData, { home_id: 1 }).then(result => {
        t.assert(result);
        t.assert(Array.isArray(result.homes));
    }).catch(error => { t.is(error, 'homesData error: Forbidden access to home'); });
});

// @ts-ignore
test.serial('getStationsData without device_id', t => {
    return apiCallAsync(t.context.api, t.context.api.getStationsData).then(result => {
        // console.log(result);
        t.assert(result);
        t.assert(Array.isArray(result));
    }).catch(error => { t.is(error, ''); });
});

if (getTestParameters().weatherDeviceId) {
    // @ts-ignore
    test.serial('getStationsData with device_id', t => {
        const options = {
            device_id: getTestParameters().weatherDeviceId,
        };
        return apiCallAsync(t.context.api, t.context.api.getStationsData, options).then(result => {
            t.assert(result);
            t.assert(Array.isArray(result));
            t.regex(result[0]._id, regexMacAddr, "[0]._id is not a mac address")
        }).catch(error => { t.is(error, ''); });
    });
}

if (getTestParameters().weatherDeviceId) {
    // @ts-ignore
    test.serial('getStationsData with device_id and get_favorites', t => {
        const options = {
            device_id: getTestParameters().weatherDeviceId,
            get_favorites: true,
        };
        return apiCallAsync(t.context.api, t.context.api.getStationsData, options).then(result => {
            t.assert(result);
            t.assert(Array.isArray(result));
            t.regex(result[0]._id, regexMacAddr, "[0]._id is not a mac address")
        }).catch(error => { t.is(error, ''); });
    });
}

// @ts-ignore
test.serial('getMeasure without device_id', t => {
    return apiCallAsync(t.context.api, t.context.api.getMeasure, {}).then(result => {
        t.assert(result);
        t.assert(Array.isArray(result.homes));
    }).catch(error => { t.is(error, 'getMeasure \'device_id\' not set.'); });
});


if (getTestParameters().weatherDeviceId) {
    // @ts-ignore
    test.serial('getMeasure with scale max and complete type array', t => {
        const options = {
            device_id: getTestParameters().weatherDeviceId,
            scale: 'max',
            type: ['Temperature', 'CO2', 'Humidity', 'Pressure', 'Noise'],
        };
        return apiCallAsync(t.context.api, t.context.api.getMeasure, options).then(result => {
            //console.log(result);
            t.assert(result);
            t.assert(Array.isArray(result));
            t.assert(result[0].beg_time);
        }).catch(error => { t.is(error, ''); });
    });
}

if (getTestParameters().weatherDeviceId) {
    // @ts-ignore
    test.serial('getThermostatsData with Weather Device', t => {
        const options = {
            device_id: getTestParameters().weatherDeviceId,
        };
        return apiCallAsync(t.context.api, t.context.api.getThermostatsData, options).then(result => {
            // console.log(result);
            t.assert(result);
            t.assert(Array.isArray(result));
        }).catch(error => { t.is(error, 'getThermostatsDataError error: Device not found'); });
    });
}

/*
device_id type is unknown function is deprecated by netatmo
if (getTestParameters().getEnergyRelayDeviceId) {
    // @ts-ignore
    test.serial('getThermostatsData with EnergyRelayDevice Device', t => {
        const options = {
            device_id: getTestParameters().getEnergyRelayDeviceId,
        };
        return apiCallAsync(t.context.api, t.context.api.getThermostatsData, options).then(result => {
            // console.log(result);
            t.assert(result);
            t.assert(Array.isArray(result));
        }).catch(error => { t.is(error, 'getThermostatsDataError error: Device not found'); });
    });
}
*/

// @ts-ignore
test.serial('getPublicData with Invalid coordinates and rain', t => {
    return apiCallAsync(t.context.api, t.context.api.getPublicData, { lat_ne: 1, lon_ne: 2, lat_sw: 3, lon_sw: 4, required_data: ['rain'] }).then(result => {
        t.assert(result);
        t.assert(Array.isArray(result.homes));
    }).catch(error => { t.is(error, 'getPublicData error: Invalid coordinates given'); });
});

// @ts-ignore
test.serial('getPublicData with coordinates and temperature', t => {
    return apiCallAsync(t.context.api, t.context.api.getPublicData, { lat_ne: 39.6, lon_ne: 3.4, lat_sw: 39.5, lon_sw: 3.3, required_data: ['temperature'] }).then(result => {
        t.assert(result);
        // console.log(result);
        t.assert(Array.isArray(result));
        t.regex(result[0]._id, regexMacAddr, "[0]._id is not a mac address")
        t.is(result[0]._id, '70:ee:50:3c:2c:ac'); // Dont worry, this id is public
    }).catch(error => { t.is(error, ''); });
});

// @ts-ignore
// fails with TypeError as uncaughtException, so all getPublicData must be serial
// and this must be the last one
test.serial.failing('getPublicData without required_data', t => {
    return apiCallAsync(t.context.api, t.context.api.getPublicData, { lat_ne: 39.6, lon_ne: 3.4, lat_sw: 39.5, lon_sw: 3.3 }).then(result => {
        t.assert(result);
        t.assert(Array.isArray(result.homes));
    }).catch(error => { t.is(error, ''); });
});

