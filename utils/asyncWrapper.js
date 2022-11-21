// Simple middleware for handling exceptions inside of async express routes and passing them to your express error handlers
asyncWrapper = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
module.exports = {asyncWrapper};