'use strict';

const optionDefinitions = [
    { name: 'verbose', alias: 'v', type: Boolean }
];

module.exports = {
    post: function(data, callback) {

        const commandLineArgs = require('command-line-args');
        const options = commandLineArgs(optionDefinitions);

        let lvl = options.verbose ? 'debug': 'info';
        let logger = require('console-log-level')({ level: lvl });

        if (!data.clientId.length) {
            logger.error('JIVE Client ID is not specified');
            return;
        }

        if (!data.clientSecret.length) {
            logger.error('JIVE Client Secret is not specified');
            return;
        }

        if (!data.refreshToken.length) {
            logger.error('JIVE Refresh Token is not specified');
            return;
        }

        if (!data.tokenUrl.length) {
            logger.error('JIVE Token URL is not specified');
            return;
        }

        if (!data.url.length) {
            logger.error('JIVE URL is not specified');
            return;
        }

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

            var accessToken = tokenObj.access_token;

            var bodyRequest = JSON.stringify(data.jive_opts);

            request.post({
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                url: data.url + 'contents',
                body: bodyRequest
            }, function (err, r, body) {
                logger.debug('error: ' + error);
                logger.debug('response status code: ' + response.statusCode);
                logger.debug('response status message: ' + response.statusMessage);
                logger.debug('token response: ' + body);
                if (body) {
                    var result = JSON.parse(body);
                    if (result) {
                        if (result.error) {
                            logger.error("\nJIVE Error Code: " + result.error.status + "\n" + "JIVE Error Message: " + result.error.message);
                        }

                        if (result.resources && result.resources.html && result.resources.html.ref) {
                            logger.debug('JIVE Document is created at ' + result.resources.html.ref);
                        }
                        callback(result.error, result);
                    }
                }
            });
        });
    }
};