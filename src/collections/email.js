const mongoose = require('mongoose');
const randtoken = require('rand-token');

import _ from 'lodash';

import { metaSchema, metaValidator } from './validators/emailMeta';
import { templateSchema, templateValidator } from './validators/emailTemplate';

const collectionName = 'Email';
const schema = new mongoose.Schema({
  appMeta: {
    type: mongoose.Schema.Types.Mixed,
  },
  meta: {
    required: true,
    type: metaSchema,
    validate: [metaValidator, '"{PATH}" must have "from", "to", and "subject"'],
  },
  template: {
    required: true,
    type: templateSchema,
    validate: [templateValidator, '"{PATH}" must have "name"'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deliveredAt: {
    type: Date,
  },
  token: {
    value: {
      type: String,
      required: true,
      // unique: true?
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
}, {
  collection: collectionName,
});

/**
 * @method withToken
 *
 * @param {String} val, token value
 * @param {Function} cb callback
 */
function withToken(val, cb) {
  return this.findOne({ 'token.value': val }, cb);
}
schema.static('withToken', withToken);

function generateToken() {
  return {
    value: randtoken.generate(16), // stick to this strategy for now
    createdAt: Date.now(),
  };
}

/**
 * If succeeded, a new token will be returned in the callback
 */
schema.static('refreshToken', function (val, cb) {
  const newToken = generateToken();

  this.findOneAndUpdate({ 'token.value': val }, { token: newToken }, (err, old) => {
    if (err) return cb(err);
    if (!old) return cb(new Error(`Token (${val}) not found`));

    return cb(null, newToken);
  });
});

// TODO helper method to make quering with date easier

/**
 * @method generateToken
 *
 * useful for refreshing token & related properties
 *
 * @return {Object}
 */
schema.static('generateToken', generateToken);


schema.pre('validate', function (next) {
  // NB: mongoose seems to create the token part automatically
  if (!_.get(this.token, 'value')) {
    this.token = this.constructor.generateToken();
  }
  next();
});

/**
 * Generated getters/setters:
 *
 * - templateName(), templateName(name)
 * - templateData(), templateData({ ... })
 *
 * @chainable
 */
['name', 'data'].forEach((m) => {
  const mn = ['template', m.substring(0, 1).toUpperCase(), m.substring(1)].join('');
  schema.methods[mn] = function (val) {
    if (!val) {
      return this.template[m];
    }

    this.template[m] = val;
    return this;
  };
});

schema.index({ 'token.value': 1 });

module.exports = mongoose.model(collectionName, schema);
