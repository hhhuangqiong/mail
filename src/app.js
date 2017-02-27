import healthcheck from 'm800-health-check';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONFIG_DIR = path.resolve(PROJECT_ROOT, 'config');

const nconf = require('./initializers/nconf')(CONFIG_DIR);

nconf.overrides({
  PROJECT_ROOT,
  CONFIG_DIR,
});

const loggingKey = 'logging:winston:transports';
const transports = [].concat(nconf.get(loggingKey));
const logstashTransport = require('m800-winston/lib/util')('LOGSTASH_URL', 'winston.transports.Logstash'); // eslint-disable-line max-len
if (logstashTransport) {
  nconf.set(loggingKey, transports.concat(logstashTransport));
}

require('./initializers/ioc')(nconf);
require('./initializers/logging')(nconf.get('logging:winston'));
const mongoose = require('./initializers/database')(nconf.get('mongodb:uri'), nconf.get('mongodb:options'));

const app = express();
app.use(require('morgan')('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('express-validator')());

app.use('/', require('./routes/index'));

// integrate m800 common
healthcheck(app, {
  mongodb: {
    mongoose,
  },
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function serverErrorDev(err, req, res, next) { // eslint-disable-line
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function serverError(err, req, res, next) { // eslint-disable-line
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {},
  });
});


module.exports = app;
