const mongoose = require('mongoose');

export const metaSchema = {
  from: {
    type: String,
    trim: true,
  },
  to: {
    // single (String) or multiple (Array)
    type: mongoose.Schema.Types.Mixed,
  },
  subject: {
    type: String,
    trim: true,
  },
  cc: { type: Array },
  bcc: { type: Array },
};

/**
 * metaValidator
 *
 * @param {*} val = {}
 * @return {Boolean} result
 */
export function metaValidator(val = {}) {
  const { from, to, subject } = val;

  if (!from || !to || !subject) {
    return false;
  } else { // eslint-disable-line no-else-return
    return true;
  }
}
