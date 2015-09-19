import _ from 'lodash';

export default class SignUp {

  /**
   * @constructs
   *
   * @param {string} templateFolderName
   * @param {Object} [mailopts]
   * @param {Object} [extraData]
   */
  constructor(templateFolderName, mailOpts = {}, extraData = {}) {
    if (!templateFolderName) throw new Error('`templateFolderName` is required');
    this.templateFolderName = templateFolderName;

    //TODO verify if `from` is a valid email address
    if (!(mailOpts.from && mailOpts.subject)) throw new Error('`from` and `subject` are required');
    this.from    = mailOpts.from;
    this.subject = mailOpts.subject;

    // no validation on this piece of data
    this.extraData = extraData;
  }

  /**
   * Prepare data used in the template
   * It's hard to come up with consistent interface for the data strucuture
   *
   * @param {Object} user
   * @return {Object}
   */
  data(user) {
    return _.extend(this.extraData, {
      first: user.first,
      last:  user.last,
      email: user.username,

      // url to be decided
      url: 'TODO'
    });
  }
}
