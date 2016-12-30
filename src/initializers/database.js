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

  const { debug, ...mongoOption } = mongodbOpts;
  mongoose.set('debug', !!debug);

  // TODO filter sensitive information (e.g., password)
  logger.info('Connecting to Mongo on "%s" with %j', mongodbURI, mongoOption, {});
  mongoose.connect(mongodbURI, mongodbOpts);

  ['open', 'connecting', 'connected', 'reconnected', 'disconnected', 'close', 'fullsetup']
    .forEach(evt => {
      mongoose.connection.on(evt, () => {
        logger.info(`Mongoose connection is ${evt}.`);
      });
    });

  mongoose.connection.on('error', error => {
    logger.error(`Error connecting to MongoDB : ${error.message}`, error);
  });

  // monitor the replicaset
  if (mongoose.connection.db.serverConfig.s.replset) {
    ['joined', 'left'].forEach(evt => {
      mongoose.connection.db.serverConfig.s.replset.on(evt, (type, serverObj) => {
        logger.info(`Replset event: ${type} ${evt}`, serverObj.ismaster);
      });
    });

    mongoose.connection.db.serverConfig.s.replset.on('error', error => {
      logger.error(`Replset error: ${error.message}`, error);
    });
  }

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      process.exit(0);
    });
  });

  return mongoose;
}

module.exports = initialize;
