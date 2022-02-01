/**
 * rename 'credentials.js.example' to 'credentials.js' and edit it to use our private credentials.
 * start unit-tests with 'npm install' and 'npm test', verbose testing with 'npm test -- -- --v'
 * To start a specific test use: npx ava --match='homesData*' or npx ava --match='homesData*' -- --v
 */

/* eslint-disable ava/prefer-async-await */
//@ts-check
const process = require('process');
const test = require('ava');
const netatmo = require('../netatmo');

const regexMacAddr = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\\.[0-9a-fA-F]{4}\\.[0-9a-fA-F]{4})$/;

// eslint-disable-next-line ava/no-import-test-files
function getCredentials() { try { return (require('./credentials').getCredentials()); } catch (err) { return {}; } }
// eslint-disable-next-line ava/no-import-test-files
function getTestParameters() { try { return (require('./credentials').getTestParameters()); } catch (err) { return {}; } }

// Do extra logs...
const verbose = process.argv && process.argv[2] === '-v';
const velux = getCredentials() && getCredentials().user_prefix && getCredentials().user_prefix === "velux";

// @ts-ignore
// test produces a "Uncaught exception in test.js" 
test.serial.before('try authenticate without credentials', async t => {
    if (verbose) { t.log("Verbose output enabled"); }
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
 * @promise fPromise
 * @reject {string}
 * @fulfill {Object}
 * @returns {Promise.<Object,string>}
 */

function apiCallAsync(api, func, options = null) {
    return new Promise(function (resolve, reject) {
        function errorWarningHandler(error) {
            process.removeListener('uncaughtException', uncaughtExceptionHandler);
            // @ts-ignore
            api.removeListener('error', errorWarningHandler);
            // @ts-ignore
            api.removeListener('warning', errorWarningHandler);
            reject(error.message);
        }
        // @ts-ignore
        api.on("error", errorWarningHandler);
        // @ts-ignore
        api.on("warning", errorWarningHandler);

        function uncaughtExceptionHandler(reason) {
            process.removeListener('uncaughtException', uncaughtExceptionHandler);
            // @ts-ignore
            api.removeListener('error', errorWarningHandler);
            // @ts-ignore
            api.removeListener('warning', errorWarningHandler);
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
        if (verbose) { t.log(result.homes); }
        t.assert(Array.isArray(result.homes[0].rooms));
        if (verbose) { t.log(result.homes[0].rooms); }
    }).catch(() => { t.fail(); });
});

// Velux test with NGX
// @ts-ignore
test.serial('homesData without home_id and NXG', t => {
    return apiCallAsync(t.context.api, t.context.api.homesData, { gateway_types: "NXG" }).then(result => {
        t.assert(result);
        t.assert(Array.isArray(result.homes));
        if (verbose) { t.log(result.homes); }
        t.assert(Array.isArray(result.homes[0].rooms));
        if (verbose) { t.log(result.homes[0].rooms); }
        t.assert(Array.isArray(result.homes[0].modules));
        if (verbose) { t.log(result.homes[0].modules); }
        t.assert(Array.isArray(result.homes[0].modules[0].capabilities));
        if (verbose) { t.log(result.homes[0].modules[0].capabilities); }
    }).catch(() => { t.fail(); });
});


// @ts-ignore
test.serial('homesData with invalid home_id', t => {
    return apiCallAsync(t.context.api, t.context.api.homesData, { home_id: 1 }).then(() => {
        t.fail();
    }).catch(error => { t.is(error, 'homesData error: Forbidden access to home'); });
});

if (getTestParameters().homeId) {
    // @ts-ignore
    test.serial('homesData with home_id', t => {
        return apiCallAsync(t.context.api, t.context.api.homesData, { home_id: getTestParameters().homeId }).then((result) => {
            t.assert(result);
            t.assert(Array.isArray(result.homes));
            t.assert(Array.isArray(result.homes[0].rooms));
            if (verbose) { t.log(result.homes); }
            if (verbose) { t.log(result.homes[0].rooms); }
        }).catch(() => { t.fail(); });
    });
}

if (!velux) {
    // @ts-ignore
    test.serial('getStationsData without device_id', t => {
        return apiCallAsync(t.context.api, t.context.api.getStationsData).then(result => {
            // console.log(result);
            t.assert(result);
            t.assert(Array.isArray(result));
        }).catch(() => { t.fail(); });
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
            }).catch(() => { t.fail(); });
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
            }).catch(() => { t.fail(); });
        });
    }
}

// @ts-ignore
test.serial('getMeasure without device_id', t => {
    return apiCallAsync(t.context.api, t.context.api.getMeasure, {}).then(() => {
        t.fail();
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
        }).catch(() => { t.fail(); });
    });
}

if (getTestParameters().weatherDeviceId) {
    // @ts-ignore
    test.serial('getThermostatsData with Weather Device', t => {
        const options = {
            device_id: getTestParameters().weatherDeviceId,
        };
        return apiCallAsync(t.context.api, t.context.api.getThermostatsData, options).then(() => {
            t.fail();
        }).catch(error => { t.is(error, 'getThermostatsDataError error: Device not found'); });
    });
}

/*
device_id type is unknown function is deprecated by netatmo
if (getTestParameters().energyRelayDeviceId) {
    // @ts-ignore
    test.serial('getThermostatsData with EnergyRelayDevice Device', t => {
        const options = {
            device_id: getTestParameters().energyRelayDeviceId,
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
test.serial('getRoomMeasure without home_id', t => {
    return apiCallAsync(t.context.api, t.context.api.getRoomMeasure, {}).then(() => {
        t.fail();
    }).catch(error => { t.is(error, 'getRoomMeasure \'home_id\' not set.'); });
});

if (getTestParameters().homeId) {
    // @ts-ignore
    test.serial('getRoomMeasure with home_id', t => {
        return apiCallAsync(t.context.api, t.context.api.getRoomMeasure, { home_id: getTestParameters().homeId }).then(() => {
            t.fail();
        }).catch(error => { t.is(error, 'getRoomMeasure \'room_id\' not set.'); });
    });
}

if (getTestParameters().homeId && getTestParameters().roomId) {
    // @ts-ignore
    test.serial('getRoomMeasure with home_id and room_id', t => {
        const options = {
            home_id: getTestParameters().homeId,
            room_id: getTestParameters().roomId,
        };
        return apiCallAsync(t.context.api, t.context.api.getRoomMeasure, options).then(() => {
            t.fail();
        }).catch(error => { t.is(error, 'getRoomMeasure \'scale\' not set.'); });
    });
}

if (getTestParameters().homeId && getTestParameters().roomId) {
    // @ts-ignore
    test.serial('getRoomMeasure with home_id and room_id and scale', t => {
        const options = {
            home_id: getTestParameters().homeId,
            room_id: getTestParameters().roomId,
            scale: 'xxx'
        };
        return apiCallAsync(t.context.api, t.context.api.getRoomMeasure, options).then(() => {
            t.fail();
        }).catch(error => { t.is(error, 'getRoomMeasure \'type\' not set.'); });
    });
}

if (getTestParameters().homeId && getTestParameters().roomId) {
    // @ts-ignore
    test.serial('getRoomMeasure with home_id and room_id and scale and type', t => {
        const options = {
            home_id: getTestParameters().homeId,
            room_id: getTestParameters().roomId,
            scale: 'xxx',
            type: 'xxx',
        };
        return apiCallAsync(t.context.api, t.context.api.getRoomMeasure, options).then(() => {
            t.fail();
        }).catch(error => { t.is(error, 'getRoomMeasure error: Unknown scale'); });
    });
}

// @ts-ignore
test.serial('homeStatus without options', t => {
    return apiCallAsync(t.context.api, t.context.api.homeStatus).then(() => {
        t.fail();
    }).catch(error => { t.is(error, 'homeStatus \'options\' not set.'); });
});

if (getTestParameters().homeId) {
    // @ts-ignore
    test.serial('homeStatus with home_id', t => {
        return apiCallAsync(t.context.api, t.context.api.homeStatus, { home_id: getTestParameters().homeId }).then(result => {
            t.assert(result);
            t.assert(result.home);
            if (verbose) { t.log(result.home); }
            t.assert(result.home.id);
        }).catch(() => { t.fail(); });
    });
}

if (getTestParameters().homeId) {
    // @ts-ignore
    test.serial('setThermMode with home_id', t => {
        const options = {
            home_id: getTestParameters().homeId,
            mode: 'schedule',
        };
        return apiCallAsync(t.context.api, t.context.api.setThermMode, options).then(result => {
            t.assert(result);
            t.is(result.status, 'ok');
        }).catch(() => { t.fail(); });
    });
}

if (!velux) {
    if (getTestParameters().homeId) {
        // @ts-ignore
        test.serial('setRoomThermPoint with home_id', t => {
            const options = {
                home_id: getTestParameters().homeId,
            };
            return apiCallAsync(t.context.api, t.context.api.setRoomThermPoint, options).then(() => {
                t.fail();
            }).catch((error) => { t.is(error, 'setRoomThermPoint error: Missing parameters'); });
        });
    }

    if (getTestParameters().homeId && getTestParameters().roomId) {
        // @ts-ignore
        test.serial('setRoomThermPoint with home_id and room_id', t => {
            const options = {
                home_id: getTestParameters().homeId,
                room_id: getTestParameters().roomId,
            };
            return apiCallAsync(t.context.api, t.context.api.setRoomThermPoint, options).then(() => {
                t.fail();
            }).catch((error) => { t.is(error, 'setRoomThermPoint error: Missing parameters'); });
        });
    }

    if (getTestParameters().homeId && getTestParameters().roomId) {
        // @ts-ignore
        test.serial('setRoomThermPoint with home_id and room_id and mode', t => {
            const options = {
                home_id: getTestParameters().homeId,
                room_id: getTestParameters().roomId,
                mode: 'home',
            };
            return apiCallAsync(t.context.api, t.context.api.setRoomThermPoint, options).then((result) => {
                t.assert(result);
                t.is(result.status, 'ok');
            }).catch(() => { t.fail(); });
        });
    }
}

if (getTestParameters().homeId) {
    // @ts-ignore
    test.serial('setPersonAway with home_id and invalid person_id', t => {
        const options = {
            home_id: getTestParameters().homeId,
            person_id: 'xxx',
        };
        return apiCallAsync(t.context.api, t.context.api.setPersonAway, options).then(() => {
            t.fail();
        }).catch(error => { t.is(error, 'setPersonAway error: Invalid person'); });
    });
}

if (getTestParameters().homeId) {
    // @ts-ignore
    test.serial('setPersonAway with home_id and empty person_id', t => {
        const options = {
            home_id: getTestParameters().homeId,
            person_id: '',
        };
        return apiCallAsync(t.context.api, t.context.api.setPersonAway, options).then(result => {
            t.assert(result);
            t.is(result.status, 'ok');
        }).catch(() => { t.fail(); });
    });
}

if (getTestParameters().aircareDeviceId) {
    // @ts-ignore
    test.serial('getHealthyHomeCoachData with Aircare Device', t => {
        const options = {
            device_id: getTestParameters().aircareDeviceId,
        };
        return apiCallAsync(t.context.api, t.context.api.getHealthyHomeCoachData, options).then(() => {
            t.fail();
        }).catch(error => { t.is(error, 'getHealthyHomeCoachData error: Device not found'); });
    });
}

// @ts-ignore
test.serial('getPublicData with Invalid coordinates and rain', t => {
    return apiCallAsync(t.context.api, t.context.api.getPublicData, { lat_ne: 1, lon_ne: 2, lat_sw: 3, lon_sw: 4, required_data: ['rain'] }).then(() => {
        t.fail();
    }).catch(error => { t.is(error, 'getPublicData error: Invalid coordinates given'); });
});

// Lese eine öffentliche Station

// @ts-ignore
test.serial('getPublicData with coordinates and temperature', t => {
    return apiCallAsync(t.context.api, t.context.api.getPublicData, { lat_ne: 39.6, lon_ne: 3.4, lat_sw: 39.5, lon_sw: 3.3, required_data: ['temperature'] }).then(result => {
        t.assert(result);
        // console.log(result);
        t.assert(Array.isArray(result));
        t.regex(result[0]._id, regexMacAddr, "[0]._id is not a mac address")
        t.is(result[0]._id, '70:ee:50:3c:2c:ac'); // Dont worry, this id is public
    }).catch(() => { t.fail(); });
});

// @ts-ignore
// fails with TypeError as uncaughtException, so all getPublicData must be serial
// and this must be the last one
test.serial.failing('getPublicData without required_data', t => {
    return apiCallAsync(t.context.api, t.context.api.getPublicData, { lat_ne: 39.6, lon_ne: 3.4, lat_sw: 39.5, lon_sw: 3.3 }).then(result => {
        t.assert(result);
        t.assert(Array.isArray(result.homes));
    }).catch(() => { t.fail(); });
});

