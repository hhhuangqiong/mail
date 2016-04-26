/** @module initializers/logging */

const winston = require('winston');

import _ from 'lodash';

// included anyways even it's not specified in the configuration
require('winston-logstash');

function hasLogstash(transport) {
  return /logstash/i.test(transport.type);
}

function prepareMetaInGlobal(meta) {
  if (!meta || _.isEmpty(meta)) {
    throw new Error('Must have `meta` object in Winston config');
  }
  global.logstashMeta = meta;
}

function wrapOriginalLevels(winstonInst) {
  const origLevels = {};

  Object.keys(winstonInst.levels).forEach((level) => {
    origLevels[level] = winstonInst[level];

    winstonInst[level] = function () { // eslint-disable-line no-param-reassign
      const args = Array.prototype.slice.call(arguments); // eslint-disable-line prefer-rest-params
      return origLevels[level].apply(winstonInst, args.concat(logstashMeta)); // eslint-disable-line no-undef, max-len
    };
  });

  return winstonInst;
}

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
  const transports = opts.transports || [];

  if (transports.length) {
    // to avoid `Console` transport being added more than once
    winston.remove(winston.transports.Console);

    transports.forEach((t) => {
      winston.add(eval(t.type), t.options); // eslint-disable-line no-eval
    });
  }

  const useLogstash = _.some(transports, hasLogstash);

  if (useLogstash) {
    prepareMetaInGlobal(opts.meta);
    return wrapOriginalLevels(winston);
  } else { // eslint-disable-line no-else-return
    return winston;
  }
}

module.exports = initialize;
