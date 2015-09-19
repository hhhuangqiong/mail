let EmailTemplate = require('email-templates').EmailTemplate;
let fs            = require('fs');
let logger        = require('winston');
let path          = require('path');

let TemplateMailer = module.exports = function(mailer, opts) {
  if (!mailer)
    throw new Error('`mailer` is required');
  this.mailer = mailer;

  this._templatesDir = opts.templatesDir;
  if (!fs.existsSync(this._templatesDir))
    throw new Error('`templatesDir` "' + this._templatesDir + '" doesn\'t not exist');
};

/**
 * Send email using the data with the template specified
 *
 * @param {Object}
 * @param {String}
 * @param {Object}
 * @param {Function} cb
 */
TemplateMailer.prototype.send = function(mailOpts, tmplOpts, tmplData, cb) {
  //TODO validate `mailOpts`
  if (!mailOpts || !tmplOpts || !tmplData)
    throw new Error('Invalid number of arguments');

  // TBC combine opts & data?
  this._tmplContent(tmplOpts, tmplData, function(err, html) {
    if (err) return cb(err);

    this.mailer.sendHtmlContent(mailOpts, html, function(err, responseStatus) {
      if (err) return cb(err);

      logger.info('Email using template "%j" with %j', tmplOpts, tmplData, {});
      cb(null, responseStatus.message);
    });
  }.bind(this));
};

/**
 * Prepare the message content with the specified template & data
 *
 * @private
 * @param {Object} tmplOpts
 * @param {Object} tmplData
 * @param {Function} cb
 */
TemplateMailer.prototype._tmplContent = function(tmplOpts, tmplData, cb) {
  // TODO language resolution strategy here; stricter validation
  const {name, language} = tmplOpts;

  // TODO no check of directory existence?!
  let email = new EmailTemplate(path.join(this._templatesDir, name, language));

  // reason for not using `renderHtml`: no documentation yet
  email.render(tmplData, function(err, result) {
    if (err) {
      logger.error('Error rendering template %s with %j', name, tmplData, err.stack, {});
      return cb(err);
    }

    cb(null, result.html);
  });
};

// TODO handler multi-language for the subject field
// or wait this to be merged: https://github.com/niftylettuce/node-email-templates/pull/147

