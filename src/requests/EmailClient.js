import request from 'superagent';
import url from 'url';

import {metaValidator} from '../collections/validators/emailMeta';
import {templateValidator} from '../collections/validators/emailTemplate';

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
    this._baseUrl = opts.baseUrl;
    this._basePath = opts.basePath || 'emails';
  }

  _buildTargetPath(templateName) {
    return url.resolve(this._baseUrl, this._basePath) + '/' + templateName;
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
    if(!metaValidator(meta)) return cb(new Error('Invalid `meta` data'));
    if(!templateValidator(template)) return cb(new Error('Invalid `template` data'));

    if (arguments.length === 3) {
      cb = appMeta;
      appMeta = {};
    }

    const targetPath = this._buildTargetPath(template.name);

    request.post(targetPath)
      .send({ ...meta, ...template, appMeta })
      .end((err, res) => {
        // other kind of error?
        if (err || res.status >= 400) return cb(err);
        cb(null, res.body.token);
      });
  }
}


