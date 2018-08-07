'use strict';

const optionDefinitions = [
    { name: 'verbose', alias: 'v', type: Boolean }
];

let logger = null;

let initEnv = function() {
    const commandLineArgs = require('command-line-args');
    const options = commandLineArgs(optionDefinitions);

    let lvl = options.verbose ? 'debug': 'info';
    logger = require('console-log-level')({ level: lvl });
};

let validArguments = function(data, logger) {
    if (!data || !data.clientId)
        return false;

    if (!data.clientId.length) {
        logger.error('JIVE Client ID is not specified');
        return false;
    }

    if (!data.clientSecret.length) {
        logger.error('JIVE Client Secret is not specified');
        return false;
    }

    if (!data.refreshToken.length) {
        logger.error('JIVE Refresh Token is not specified');
        return false;
    }

    if (!data.tokenUrl.length) {
        logger.error('JIVE Token URL is not specified');
        return false;
    }

    if (!data.url.length) {
        logger.error('JIVE URL is not specified');
        return false;
    }
    return true;
};

let requestAccessToken = function(data, callback) {
    let request = require('request');
    let authString = "Basic " + new Buffer(data.clientId + ":" + data.clientSecret).toString("base64");
    let bodyString = 'grant_type=refresh_token&refresh_token=' + data.refreshToken;
    request.post({
        headers: {
            'content-type' : 'application/x-www-form-urlencoded',
            'Authorization': authString
        },
        url: data.tokenUrl,
        body: bodyString
    }, function(error, response, body) {
        logger.debug('error: ' + error);
        logger.debug('response status code: ' + response.statusCode);
        logger.debug('response status message: ' + response.statusMessage);
        logger.debug('token response: ' + body);

        let tokenObj;
        if (body) {
            try {
                tokenObj = JSON.parse(body);
            } catch (e) {
                logger.error("Invalid response from authenticating with given refresh token");
                logger.error(e);
            }
        }

        callback(tokenObj.access_token);
    });
};

let call_jive_api = function(data, token, method, url, callback) {
    let request = require('request');
    let bodyRequest = JSON.stringify(data.jive_opts);

    let requestFn = null;
    switch (method) {
        case 'post':
            requestFn = request.post;
            break;
        case 'put':
            requestFn = request.put;
            break;
        default:
            requestFn = request.post;
            break;
    }

    requestFn({
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        url: url,
        body: bodyRequest
    }, function (err, r, body) {
        logger.debug('error: ' + err);
        logger.debug('response status code: ' + r.statusCode);
        logger.debug('response status message: ' + r.statusMessage);
        logger.debug('token response: ' + body);
        if (body) {
            let result = JSON.parse(body);
            if (result) {
                if (result.error) {
                    logger.error("\nJIVE Error Code: " + result.error.status + "\n" + "JIVE Error Message: " + result.error.message);
                }

                if (result.resources && result.resources.html && result.resources.html.ref) {
                    logger.debug('JIVE Document is updated at ' + result.resources.html.ref);
                }
                callback(result.error, result);
            }
        }
    });
};

let post = function(data, callback) {

    initEnv();

    if (!validArguments(data, logger)) {
        callback('Invalid input');
        return;
    }

    requestAccessToken(data, function(token){
        let url = data.url + 'contents';

        call_jive_api(data, token, 'post', url, callback);
    });
};

let update = function(docId, data, callback) {

    initEnv();

    if (!validArguments(data, logger)) {
        callback('Invalid input');
        return;
    }

    if (!docId || !docId.length) {
        logger.error('Document ID is not specified');
        return false;
    }

    requestAccessToken(data, function(token){

        let url = data.url + 'contents/' + docId;

        call_jive_api(data, token, 'put', url, callback);
    });
};

module.exports = {
    post: post,
    update: update
};