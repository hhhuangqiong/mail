const EmailTemplate = require('email-templates').EmailTemplate;
const fs = require('fs');
const logger = require('winston');
const path = require('path');

const TemplateMailer = module.exports = function (mailer, opts) {
  if (!mailer) {
    throw new Error('`mailer` is required');
  }
  this.mailer = mailer;

  this.templatesDir = opts.templatesDir;

  if (!fs.existsSync(this.templatesDir)) {
    throw new Error(`'templatesDir' ${this.templatesDir} doesn't not exist'`);
  }
};

/**
 * @callback sendCallback
 * @param {Error} err
 * @param {Object} result
 * @param {Object} result.render render result with properties: html, text, subject
 * @param {Object} result.response send response
 *
 * @see {@link https://github.com/niftylettuce/node-email-templates#basic} for the details of 'render' properties
 */

/**
 * Send email using the data with the template specified
 *
 * @param {Object}
 * @param {String}
 * @param {Object}
 * @param {sendCallback} cb
 */
TemplateMailer.prototype.send = function (mailOpts, tmplOpts, tmplData, cb) {
  // TODO validate `mailOpts`
  if (!mailOpts || !tmplOpts || !tmplData) {
    throw new Error('Invalid number of arguments');
  }

  // TBC combine opts & data?
  this.tmplContent(tmplOpts, tmplData, (err, render) => {
    if (err) return cb(err);

    const { subject, html } = render;

    mailOpts.subject = subject; // eslint-disable-line no-param-reassign

    return this.mailer.sendHtmlContent(mailOpts, html, (sendErr, response) => {
      if (sendErr) return cb(sendErr);

      logger.info('Sent email using template "%j" with %j; response: %j', tmplOpts, tmplData, response, {}); // eslint-disable-line max-len

      return cb(null, { render, response });
    });
  });
};

/**
 * Prepare the message content with the specified template & data
 *
 * @private
 * @param {Object} tmplOpts
 * @param {Object} tmplData
 * @param {Function} cb
 */
TemplateMailer.prototype.tmplContent = function (tmplOpts, tmplData, cb) {
  // TODO language resolution strategy here; stricter validation
  const { name, language } = tmplOpts;

  // TODO no check of directory existence?!
  const email = new EmailTemplate(path.join(this.templatesDir, name, language));

  // reason for not using `renderHtml`: no documentation yet
  email.render(tmplData, (err, result) => {
    if (err) {
      logger.error('Error rendering template %s with %j', name, tmplData, err.stack, {});
      return cb(err);
    }

    return cb(null, result);
  });
};
