import request from 'superagent';
import url from 'url';

import {metaValidator} from '../collections/validators/emailMeta';
import {templateValidator} from '../collections/validators/emailTemplate';

/**
 * Create a new email request
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
   * @param {NetworkError} err
   * @param {String} token The token returned after the email created 
   */

  /**
   * Submit the email based on meta information
   *
   * @param {Object} meta
   * @param {Object} tmpl 
   * @param {sendCallback} cb
   */
  send(meta, tmpl, cb) {
    // TODO more descriptive error message
    if(!metaValidator(meta)) return cb(new Error('Invalid `meta` data'));
    if(!templateValidator(tmpl)) return cb(new Error('Invalid `tmpl` data'));

    const targetPath = this._buildTargetPath(tmpl.name);

    request.post(targetPath)
      .send(Object.assign({}, meta, tmpl)) // all in top-level
      .end((err, res) => {
        // other kind of error?
        if (err || res.status >= 400) return cb(err);
        cb(null, res.body.token);
      });
  }

}
