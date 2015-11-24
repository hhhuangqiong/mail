let express    = require('express');
let bodyParser = require('body-parser');
let path       = require('path');
import healthcheck from 'm800-health-check';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONFIG_DIR   = path.resolve(PROJECT_ROOT, 'config');

let nconf = require('./initializers/nconf')(CONFIG_DIR);

nconf.overrides({
  PROJECT_ROOT,
  CONFIG_DIR
});

require('./initializers/ioc')(nconf);
require('./initializers/logging')(nconf.get('logging:winston'));
require('./initializers/database')(nconf.get('mongodb:uri'), nconf.get('mongodb:options'));

let app = express();
app.use(require('morgan')('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('express-validator')());

app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// integrate m800 common
healthcheck(app);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


module.exports = app;
