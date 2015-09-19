import Email from '../collections/email';
import logger from 'winston';

export default class EmailService {

  constructor(mailer) {
    if (!mailer) throw new Error('`mailer` is required');
    this._mailer = mailer;
  }

  /** 
   * Send and create an email
   *
   * NB: persist failure after send could happen
   *
   * @param {Object} emailInfo Data used to create instance of `Email` collection
   * @param {Function} cb
   *
   * To see the parameters returned in `mailer.send` callback
   */
  create(emailInfo, cb) {
    let email = new Email(emailInfo);

    const doc = email.toObject();
    const {name, language, data = {}} = doc.template;

    // @see {@link https://github.com/andris9/Nodemailer#sending-mail}
    this._mailer.send(doc.meta, { name, language }, data, function(err, info) {
      logger.debug('info from `send`', info);
      if (err) {
        logger.error('Failed to send "%s" with template "%s"', email.meta.to, name);
        return cb(err);
      }

      email.set('deliveredAt', Date.now());
      email.save(function(saveErr, saved) {
        // how to prevent "undefined"?
        if (saveErr) {
          logger.error('Failed to persist email after send', saveErr);
          return cb(saveErr);
        }
        cb(null, saved);
      });
    });
  }
}
