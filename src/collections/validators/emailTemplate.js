let mongoose = require('mongoose');

/**
 * @param {*} val = {}
 * @return {Boolean} result
 */
export function templateValidator(val = {}) {
  //TODO more flexible checking on `language` i.e. allow both 'en-US' and 'en'
  let {name, language} = val;
  return !!name && !!language;
}

// NB: property not defined here can also be created?!
export const templateSchema = {
  name: {
    type: String,
    trim: true,
    required: true
  },
  language: {
    type: String,
    trim: true,
    required: true
    // TODO enable below?
    // default: "en-US"
  },
  data: {
    default: {},
    type: mongoose.Schema.Types.Mixed
  }
};

