let express = require('express');
let router  = express.Router();
let Email   = require('../collections/email');

import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import logger from 'winston';
import nconf from 'nconf';

const fetchDep             = _.partial(require('../utils/ioc').fetchDep, nconf.get('containerName'));
const MAILER_TEMPLATE_ROOT = fetchDep('MAILER_TEMPLATE_ROOT');
const emailService         = fetchDep('EmailService');
const emailClient         = fetchDep('EmailClient');

/**
 * Generate paths for handling different template
 * If the template is not available, the path won't exists
 *
 * All the templates are looked up under template path with the folder name as
 * its identifer.
 */
fs.readdirSync(MAILER_TEMPLATE_ROOT).forEach(function(f){ 
  let templateDir = path.join(MAILER_TEMPLATE_ROOT, f);

  if(fs.statSync(templateDir).isDirectory()) {
    //TODO configurable base?
    let routePath = `/emails/${f}`;

    router.post(routePath, validateEmailInfo, assembleEmailInfo, function (req, res, next) {
      let payload = req._data.payload;

      emailService.create(payload, function(err, doc){
        if(err) {
          logger.error('Error creating email', err);

          return res.status(500).json({
            message: `Failed to deliver email to ${payload.meta.to}`
          });
        }
        res.status(201).json({ token: doc.token.value });
      });
    });

    logger.info('POST "%s" registered', routePath);
  }
});

function validateEmailInfo(req, res, next) {
  req.checkBody('subject', 'Subject is required').notEmpty();
  
  // 'from' could fall back to default
  ['to'].forEach(function(f){
    req.checkBody(f, `Invalid "${f}"`).isEmail();
  });

  ['cc', 'bcc'].forEach(function(f){
    // TODO verify each value is a valid email
    req.checkBody(f, `Invalid "${f}"`).optional();
  });

  let errors = req.validationErrors();
  if (errors) {
    // what to do?
    res.status(400).json({ errors: errors });
  } else {
    next();
  }
}

/**
 * Data required for `Email` collection will be attached to `req._data.payload`
 */
function assembleEmailInfo(req, res, next) {
  let from    = req.sanitizeBody('from').trim() || nconf.get('mailer:defaults:from');
  let to      = req.sanitizeBody('to').trim();
  let cc      = req.sanitizeBody('cc').trim();
  let bcc     = req.sanitizeBody('bcc').trim();
  let data    = req.sanitizeBody('data').trim();
  let subject = req.sanitizeBody('subject').trim();

  let language = req.sanitizeBody('language').trim() || nconf.get('mailer:defaults:language');

  /**
   * This part should be safe
   * because if it's not available, it can be invoked
   *
   * Also, path won't include have any querystring
   */
  let tmplName = _.last(req.path.split('/'));

  // TODO check if path can handle querystring
  let payload = { meta: { from, to, subject }, template: {
    name: tmplName, language: language, data: data
  }};

  req._data = { payload };
  next();
}

router.get('/tokens/:token', function(req, res) {
  let token = req.sanitize('token').trim();

  Email.withToken(token, function (err, tokenInfo) {
    if(err) return genericErrorResponse(res, err);

    if(!tokenInfo) return res.status(404).json({ token: '' })

    res.json({ token: tokenInfo.token });
  })
}); 

router.post('/tokens/:token', function(req, res) {
  let token = req.sanitize('token').trim();

  Email.refreshToken(token, function (err, newTokenInfo) {
    if(err) return genericErrorResponse(res, err);

    res.json({ token: newTokenInfo });
  })
}); 

function genericErrorResponse(res, err, status = 500) {
  // TBC message appropriate?
  res.status(status).json({message: err.message });
}

module.exports = router;
