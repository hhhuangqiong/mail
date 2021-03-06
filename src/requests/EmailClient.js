import request from 'superagent';
import url from 'url';

import { metaValidator } from '../collections/validators/emailMeta';
import { templateValidator } from '../collections/validators/emailTemplate';

/**
 * Create a new email client
 * This is supposed to be `require/import` in other app(s)
 *
 * @class
 */
export default class EmailClient {

  /**
   * @constructs
   * @param {Object} opts
   * @param {string} opts.baseUrl Base URL to the email service
   * @param {string} [opts.basePath=emails] Base path for the email route
   */
  constructor(opts = {}) {
    if (!opts.baseUrl) throw new Error('`baseUrl` is required`');
    this.baseUrl = opts.baseUrl;
    this.basePath = opts.basePath || 'emails';
  }

  buildTargetPath(templateName) {
    return `${url.resolve(this.baseUrl, this.basePath)}/${templateName}`;
  }

  /**
   * @callback sendCallback
   * @param {Error} err
   * @param {String} token The token returned after the email created
   */

  /**
   * Submit the email based on meta information
   *
   * @param {Object} meta
   * @param {Object} template
   * @param {Object} [appMeta]
   * @param {sendCallback} cb
   */
  send(meta, template, appMeta, cb) {
    // TODO more descriptive error message
    if (!metaValidator(meta)) return cb(new Error('Invalid `meta` data'));
    if (!templateValidator(template)) return cb(new Error('Invalid `template` data'));

    if (arguments.length === 3) { // eslint-disable-line prefer-rest-params
      /* eslint-disable no-param-reassign */
      cb = appMeta;
      appMeta = {};
      /* eslint-enable no-param-reassign */
    }

    const targetPath = this.buildTargetPath(template.name);

    return request.post(targetPath)
      .send({ ...meta, ...template, appMeta })
      .end((err, res) => {
        // other kind of error?
        if (err || res.status >= 400) return cb(err);
        return cb(null, res.body.token);
      });
  }
}
