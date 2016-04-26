/** @module initializers/nconf */

import fs from 'fs';
import nconf from 'nconf';

/**
 * Initialize nconf settings
 *
 * @param {string} configDir Where configuration file(s) are kept
 * @param {Object} opts
 * @param {string} [opts.envSeparator=__]
 * @return {Object} nconf
 */
export default function initialize(configDir, opts = {}) {
  nconf.argv();
  nconf.env(opts.envSeparator || '__');

  fs.readdirSync(configDir).forEach((f) => {
    // TODO more strict checking
    if (f.indexOf('.js') !== -1) {
      nconf.file(f, {
        file: f,
        dir: configDir,
        search: true,
      });
    }
  });

  console.info('Loading files under "%s"', configDir); // eslint-disable-line no-console

  return nconf;
}
