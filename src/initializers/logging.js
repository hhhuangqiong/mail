/** @module initializers/logging */

let winston = require('winston');

import _ from 'lodash';

// included anyways even it's not specified in the configuration
require('winston-logstash');

/**
 * The options will be passed through to winston instance returned
 *
 * Usage: https://github.com/flatiron/winston
 *
 * See: https://github.com/flatiron/winston/blob/master/docs/transports.md
 *
 * @param {Object} [opts] winston options
 * @param {Array} [opts.transports] transport options. e.g, [{ type: ..., options: ... }]
 */
function initialize(opts = {}) {

  let transports = opts.transports || [];

  if (transports.length) {
    // to avoid `Console` transport being added more than once
    winston.remove(winston.transports.Console);

    transports.forEach(function(t) {
      winston.add(eval(t.type), t.options);
    });
  }

  let useLogstash = _.some(transports, hasLogstash);

  if (useLogstash) {
    prepareMetaInGlobal(opts.meta);
    return wrapOriginalLevels(winston);
  } else {
    return winston;
  }
}

function hasLogstash(transport) {
  return /logstash/i.test(transport.type);
}

function prepareMetaInGlobal(meta) {
  if (!meta || _.isEmpty(meta)) {
    throw new Error('Must have `meta` object in Winston config');
  }
  global.logstashMeta = meta;
}

function wrapOriginalLevels(winston) {
  let _origLevels = {};

  Object.keys(winston.levels).forEach(function(level) {
    _origLevels[level] = winston[level];

    winston[level] = function() {
      let args = Array.prototype.slice.call(arguments);
      return _origLevels[level].apply(winston, args.concat(logstashMeta));
    };
  });

  return winston;
}

module.exports = initialize;

