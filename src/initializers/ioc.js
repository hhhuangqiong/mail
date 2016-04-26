import Bottle from 'bottlejs';
import path from 'path';

/**
 * Initialize the IoC container
 *
 * The registered factory(s) seems to be lazied loaded.
 *
 * @param {*} nconf nconf instance
 */
export default function init(nconf) {
  // intentionally not calling with `new`;
  // otherwise `fetchContainerInstance` cannot work
  const ioc = Bottle(nconf.get('containerName')); // eslint-disable-line new-cap

  ioc.factory('SmtpTransport', () => {
    const transport = require('../mailer/transports/smtp');
    return transport(nconf.get('mailer:smtp:transport'));
  });

  ioc.service('Mailer', require('../mailer/mailer'), 'SmtpTransport');

  ioc.constant('MAILER_TEMPLATE_ROOT', path.resolve(nconf.get('PROJECT_ROOT'),
                                                    nconf.get('mailer:template_root')));
  ioc.constant('MAILER_TEMPLATE_CONFIG', { templatesDir: ioc.container.MAILER_TEMPLATE_ROOT });

  // mailer that supports templates
  ioc.service('TemplateMailer', require('../mailer/templateMailer'), 'Mailer',
              'MAILER_TEMPLATE_CONFIG');

  ioc.service('EmailService', require('../services/Email.js'), 'TemplateMailer');

  return ioc;
}
