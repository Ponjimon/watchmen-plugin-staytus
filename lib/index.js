'use strict';

var rp = require('request-promise');
var config = {};

try {
    config = require(__dirname + '/../../../config.js');
    console.log('watchmen-plugin-staytus will use config.js from root folder!');
} catch(e) {
    console.log('No config found, depending on env variables...');
}

const STAYTUS_URL = process.env.WATCHMEN_STAYTUS_URL || config.WATCHMEN_STAYTUS_URL;
const STAYTUS_TOKEN = process.env.WATCHMEN_STAYTUS_TOKEN || config.WATCHMEN_STAYTUS_TOKEN;
const STAYTUS_SECRET = process.env.WATCHMEN_STAYTUS_SECRET || config.WATCHMEN_STAYTUS_SECRET;
const baseUrl = STAYTUS_URL + '/api/v1';
const servicesUrl = baseUrl + '/services/all';
const servicePatchUrl = baseUrl + '/services/set_status';
const authHeader = {
    'X-Auth-Token': STAYTUS_TOKEN,
    'X-Auth-Secret': STAYTUS_SECRET,
};

var findService = function (name, callback) {
    var identifyService = function (service) {
        return service.name === name;
    };
    rp({
        method: 'GET',
        url: servicesUrl,
        headers: authHeader,
    }).then(function (body) {
        try {
            callback(JSON.parse(body).data.find(identifyService), null);
        } catch (ex) {
            callback(null, 'Unable to parse staytus result.');
        }
    }).catch(function (err) {
        callback(null, err);
    });
};

var updateStatus = function (name, status) {
    findService(name, function (service, err) {
        if (err !== null) {
            console.log('Unable to update service ', name, ' in staytus (', err, ').');
        } else {
            const permalink = service.permalink;
            rp({
                method: 'PATCH',
                url: servicePatchUrl,
                headers: authHeader,
                body: {
                    service: permalink,
                    status: status,
                },
                json: true,
            }).then(function () {
                console.log('Service ', service.name, ' has been updated in staytus to status ', status);
            }).catch(function (err) {
                console.log('Unable to update status ', status, ' in staytus for service ', service.name,
                    ' (', err, ').')
            });
        }
    });
};

var onServiceError = function (service, outage) {
    updateStatus(service.name, 'major-outage');
};

var onServiceBack = function (service, lastOutage) {
    updateStatus(service.name, 'operational');
};


function StaytusPlugin(watchmen) {
    watchmen.on('new-outage', onServiceError);
    watchmen.on('service-back', onServiceBack);
}

module.exports = StaytusPlugin;
