# jive-simple-api

Simple JIVE API to post content to JIVE site. This is based on [Jive REST API](https://developers.jivesoftware.com/api/v3/cloud/rest/index.html) 
## Installation

```
npm install jive-simple-api --save
```

## Methods
- post(options, callback) = Post new content to JIVE API

### Options Object
#### options.clientId
Type: `String`
Default value: `''`

JIVE OAUTH2 Client ID

#### options.clientSecret
Type: `String`
Default value: `''`

JIVE OAUTH2 Client Secret

#### options.refreshToken
Type: `String`
Default value: `''`

JIVE OAUTH2 Refresh Token

#### options.tokenUrl
Type: `String`
Default value: `''`

JIVE Token URL for obtaining the access token

#### options.url
Type: `String`
Default value: `''`

JIVE API URL

#### options.jive_opts
Type: `Object`
Default value: ``

JIVE Fields - same as [JIVE Fields](https://developers.jivesoftware.com/api/v3/cloud/rest/DocumentEntity.html)


### Callback
```js
function(error, result) {}
```

## Example usage

```js
var jive = require('jive-simple-ai');

jive.post({
    clientId: '[CLIENT ID]',
    clientSecret: '[CLIENT SECRET]',
    refreshToken: '[REFRESH TOKEN]',
    tokenUrl: '[TOKEN URL]',
    url: '[JIVE URL]',
    jive_opts: {
        content: {
            type: "text/html",
            text: "hello World"
        },
        subject: "Hello World",
        type: "document"
    }
},
    function(error, result) {
        console.log(error);
        console.log(JSON.stringify(result));
});
```

## Log
specify --verbose or -v to turn on the verbose log