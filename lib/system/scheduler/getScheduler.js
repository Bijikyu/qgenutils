/**
 * Get the singleton TaskScheduler instance.
 *
 * @returns {TaskScheduler} Shared scheduler instance
 */

const TaskScheduler = require('./TaskScheduler');

function getScheduler() {
  return TaskScheduler.getInstance();
}

module.exports = getScheduler;
