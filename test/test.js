/* eslint-disable ava/prefer-async-await */
//@ts-check
const process = require('process');
const test = require('ava');
const netatmo = require('../netatmo');

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
    const auth = {
        "client_id": "myClientId", // your credentials here!
        "client_secret": "myClientSecret",
        "username": "myEmail",
        "password": "myPassord",
    };

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
        // @ts-ignore
        api.on("error", function (error) {
            reject(error.message);
        });
        // @ts-ignore
        api.on("warning", function (error) {
            reject(error.message);
        });
        // @ts-ignore
        // eslint-disable-next-line no-unused-vars
        process.on('uncaughtException', (reason, promise) => {
            // console.error(`Uncaught error in`, promise);
            reject(reason.message);
        });
        func.bind(api)(options, function (err, data) {
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
        t.is(result[0]._id, '70:ee:50:3c:2c:ac');
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

