/** @module initializers/database */

import logger from 'winston';
import mongoose from 'mongoose';
import Promise from 'bluebird';

// Use bluebird promises instead of mpromise
mongoose.Promise = Promise;

/**
 * Initialize database connection
 *
 * @param {string} mongoURI MongoDB connection URI
 * @param {Object} mongoOpts MongoDB connection options
 * @param {Function} Initialized mongoose instance
 */
function initialize(mongodbURI, mongodbOpts) {
  if (!mongodbURI || !mongodbOpts) {
    throw new Error('Both uri & options are required');
  }

  // TODO filter sensitive information (e.g., password)
  logger.info('Connecting to Mongo on "%s" with %j', mongodbURI, mongodbOpts, {});
  mongoose.connect(mongodbURI, mongodbOpts);

  ['open', 'connected', 'disconnected', 'close'].forEach((evt) => {
    mongoose.connection.on(evt, () => {
      logger.info('mongoose connection', evt);
    });
  });

  mongoose.connection.on('error', err => {
    logger.error(err);
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      process.exit(0);
    });
  });

  return mongoose;
}

module.exports = initialize;
