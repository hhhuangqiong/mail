import logger from 'winston';
import Email from '../collections/email';

export default class EmailService {

  /**
   * @param {Object} mailer
   */
  constructor(mailer) {
    if (!mailer) throw new Error('`mailer` is required');
    this.mailer = mailer;
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
    const email = new Email(emailInfo);

    // have to trigger the generation manually
    const tokenInfo = Email.generateToken();
    email.set('token', tokenInfo);

    const doc = email.toObject();

    const { name, language } = doc.template;

    const tmplOpts = { name, language };
    const tmplData = { ...emailInfo.template.data, ...tokenInfo };

    logger.info('Will `send` with template data: %j', tmplData, {});

    this.mailer.send(doc.meta, tmplOpts, tmplData, (err, info) => {
      const { to } = email.meta;

      logger.debug(`Sending email to ${to}`);
      logger.debug('Nodemailer\'s transport#sendMail result', info);

      if (err) {
        logger.error('Failed to send "%s" with template "%s"', to, name);
        return cb(err);
      }

      email.set('deliveredAt', Date.now());
      email.set('meta.subject', info.render.subject);

      return email.save((saveErr, saved) => {
        if (saveErr) {
          logger.error('Failed to persist email after send', saveErr);
          return cb(saveErr);
        }
        return cb(null, saved);
      });
    });
  }
}
