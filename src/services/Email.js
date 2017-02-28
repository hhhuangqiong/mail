import logger from 'winston';
import Email from '../collections/email';
import Promise from 'bluebird';
import MongooseError from 'mongoose/lib/error';

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

    // temporary set the subject which is required field
    email.set('meta.subject', '{{Empty}}');
    logger.info('Will `send` with template data: %j', tmplData, {});

    email.save().then(() => {
      const sendMail = Promise.promisify(this.mailer.send, { context: this.mailer });
      return sendMail(doc.meta, tmplOpts, tmplData);
    }).then(info => {
      const { to } = email.meta;
      logger.debug(`Sending email to ${to}`);
      logger.debug('Nodemailer\'s transport#sendMail result', info);

      email.set('deliveredAt', Date.now());
      email.set('meta.subject', info.render.subject);
      return email.save();
    }).catch(emailErr => {
      const message = emailErr instanceof MongooseError ? 'Fail to persist' : 'Fail to send';
      logger.error(message, emailErr);
      throw emailErr;
    }).asCallback(cb);
  }
}
