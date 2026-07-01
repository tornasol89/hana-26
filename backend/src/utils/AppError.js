// backend/src/utils/AppError.js
export default class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.esOperacional = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;