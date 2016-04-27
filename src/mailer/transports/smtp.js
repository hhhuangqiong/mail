const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

/**
 * All options are passed through to the SMTP transporter
 *
 * @module mailer/transports
 * @param {Object} opts
 *
 * @see {@link https://github.com/andris9/nodemailer-smtp-transport#usage}
 */
module.exports = function (opts = {}) {
  return nodemailer.createTransport(smtpTransport(opts));
};
