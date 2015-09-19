let logger = require('winston');

/**
 * This mailer is a thin wrapping using the passed transporter combined with
 * the templating feature provided by "email-template" module for sending out emails
 *
 * @module mailer/mailer
 *
 * @constructor
 * @param {Object} transporters 1 of the supported transporter (#sendMail method)
 */
var Mailer = module.exports = function(transporter) {
  if (!transporter) {
    throw new Error('transporter is required');
  }

  this._transporter = transporter;
};

/**
 * Send email with HTML content specified
 *
 * @param {Object} opts
 * @param {String} content Content in HTML format
 * @param {Function} cb
 */
Mailer.prototype.sendHtmlContent = function(mailOpts, content, cb) {
  //TODO validate mailOpts
  if (!mailOpts || !content) {
    throw new Error('`mailOpts & `content` are required');
  }

  mailOpts.html = content;
  this._transporter.sendMail(mailOpts, function(err, info) {
    logger.debug('`sendMail` info: %j', info, {});

    if (err) {
      return cb(err);
    }

    logger.info('Sending email with %j', mailOpts, {});
    cb(null, info);
  });
};
