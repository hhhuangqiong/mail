# M800 mail service

## Overview

This is an application mainly for accepting request from API to send email,
there's no views rendering.

There's a package,
[m800-mail-service-client](http://gerrit.dev.maaii.com/#/admin/projects/m800-web-common),
to be used with this service.

### Component(s)

- MongoDB:
  - for storing each email request
  - for more information on email object "schema", please reference
    'src/collections/email.js'

## Getting Started

```
cd PROJECT_ROOT
docker-compose up # for starting the MongoDB; Assume using '192.168.99.100' as host
npm i 
npm start
```
To read the documentation (powered by [GitBook](https://www.gitbook.com/))

```
npm i
npm run doc -- serve
```

### Enviroment Variables

LOGSTASH_URL

- to where [Winston Logstash](http://github.com/jaakkos/winston-logstash) will
  publish logging information
- must start with scheme (i.e. 'http' or 'https')
  - [More information](https://github.com/garycourt/uri-js#scheme-extendable)
- e.g., `export LOGSTASH_URL=http://192.168.118.26:9997`

## APIs

The followings are all the APIs:

1. POST /emails - send (and create) the email
2. GET /tokens/:token - get the token metadata
3. POST /tokens/:token - update the token metadata

### Sample Code

```
var Client = require('m800-mail-service-client');

var client = new Client({
  baseUrl: 'http://<hostname>:<port>',
  basePath: '/emails'
});

client.send({
  from: 'noreply@m800.com',
  to: 'staff@maaii.com',
}, {
  name: 'signUp',
  language: 'en-US',
  data: {
    host: 'http://partner.m800.com',
  }
}, function(err, token) {
  /* ... */
});
```

## Reference

- https://www.campaignmonitor.com/css/

### Template solution

- https://github.com/mailgun/transactional-email-templates
