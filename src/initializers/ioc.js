import Bottle from 'bottlejs';
import path from 'path';

import EmailService from '../services/Email';

const transport = require('../mailer/transports/smtp');
const Mailer = require('../mailer/mailer');
const TemplateMailer = require('../mailer/templateMailer');

/**
 * Initialize the IoC container
 *
 * The registered factory(s) seems to be lazied loaded.
 *
 * @param {*} nconf nconf instance
 */
module.exports = function init(nconf) {
  // intentionally not calling with `new`;
  // otherwise `fetchContainerInstance` cannot work
  const ioc = Bottle(nconf.get('containerName')); // eslint-disable-line new-cap

  ioc.factory('SmtpTransport', () => transport(nconf.get('mailer:smtp:transport')));

  ioc.service('Mailer', Mailer, 'SmtpTransport');

  ioc.constant('MAILER_TEMPLATE_ROOT', path.resolve(nconf.get('PROJECT_ROOT'),
                                                    nconf.get('mailer:template_root')));
  ioc.constant('MAILER_TEMPLATE_CONFIG', { templatesDir: ioc.container.MAILER_TEMPLATE_ROOT });

  // mailer that supports templates
  ioc.service('TemplateMailer', TemplateMailer, 'Mailer', 'MAILER_TEMPLATE_CONFIG');

  ioc.service('EmailService', EmailService, 'TemplateMailer');

  return ioc;
};
