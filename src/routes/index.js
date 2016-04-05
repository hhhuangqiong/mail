import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import logger from 'winston';
import nconf from 'nconf';
import {Router} from 'express';

const fetchDep = _.partial(require('../utils/ioc').fetchDep, nconf.get('containerName'));
const MAILER_TEMPLATE_ROOT = fetchDep('MAILER_TEMPLATE_ROOT');
const emailService = fetchDep('EmailService');

const Email = require('../collections/email');
const router = Router(); // eslint-disable-line new-cap

/**
 * Generate paths for handling different template
 * If the template is not available, the path won't exists
 *
 * All the templates are looked up under template path with the folder name as
 * its identifer.
 */
fs.readdirSync(MAILER_TEMPLATE_ROOT).forEach(f => {
  const templateDir = path.join(MAILER_TEMPLATE_ROOT, f);

  if (fs.statSync(templateDir).isDirectory()) {
    // TODO configurable base?
    const routePath = `/emails/${f}`;

    router.post(routePath, validateEmailInfo, assembleEmailInfo, (req, res) => { // eslint-disable-line no-use-before-define
      const { emailInfo } = req._data;

      emailService.create(emailInfo, (err, doc) => {
        if (err) {
          logger.error('Error creating email', err);

          return res.status(500).json({
            message: `Failed to deliver email to ${emailInfo.meta.to}`,
          });
        }
        res.status(201).json({ token: doc.token.value });
      });
    });

    logger.info('Route "%s" (POST) registered', routePath);
  }
});

function validateEmailInfo(req, res, next) {
  // 'from' could fall back to default
  ['to'].forEach(f => { req.checkBody(f, `Invalid "${f}"`).isEmail(); });

  const errors = req.validationErrors();

  if (errors) {
    // what to do?
    res.status(400).json({
      errors: errors,
    });
  } else {
    next();
  }
}

/**
 * Data required for `Email` collection will be attached to `req._data.emailInfo`
 */
function assembleEmailInfo(req, res, next) {
  const language = req.sanitizeBody('language').trim() || nconf.get('mailer:defaults:language');
  const from = req.sanitizeBody('from').trim() || nconf.get('mailer:defaults:from');
  const to = req.sanitizeBody('to').trim();

  // TODO validate these, esp. `data` & `appMeta`:
  const {
    cc, bcc, data, appMeta,
  } = req.body;

  /**
   * This part should be safe because if it's not available, it cannot be invoked
   * Also, path won't include have any querystring
   */
  const tmplName = _.last(req.path.split('/'));

  const emailInfo = {
    appMeta,
    // NB: subject from templalte folder
    meta: {
      from, to, cc, bcc,
    },
    template: {
      language,
      data,
      name: tmplName,
    },
  };

  req._data = { emailInfo };

  next();
}

router.get('/tokens/:token', (req, res) => {
  const token = req.sanitize('token').trim();

  Email.withToken(token, (err, emailInfo) => {
    if (err) return genericErrorResponse(res, err); // eslint-disable-line no-use-before-define

    if (!emailInfo) {
      return res.status(404).json({ token: '' });
    }

    res.json({
      token: emailInfo.token,
      appMeta: emailInfo.appMeta,
    });
  });
});

router.post('/tokens/:token', (req, res) => {
  const token = req.sanitize('token').trim();

  Email.refreshToken(token, (err, newTokenInfo) => {
    if (err) return genericErrorResponse(res, err); // eslint-disable-line no-use-before-define

    res.json({
      token: newTokenInfo,
    });
  });
});

function genericErrorResponse(res, err, status = 500) {
  // TBC use 'message' from error?
  res.status(status).json({
    message: err.message,
  });
}

module.exports = router;
