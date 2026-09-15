export default class AppError extends Error {
  constructor(message, statusCode, { expose = true } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.expose = expose;
    Error.captureStackTrace(this, this.constructor);
  }
}
