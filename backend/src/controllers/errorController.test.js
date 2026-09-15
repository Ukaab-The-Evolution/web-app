import { jest } from '@jest/globals';
import AppError from '../utils/appError.js';
import errorController from './errorController.js';

describe('errorController', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.restoreAllMocks();
  });

  test('does not expose internal error details in production', () => {
    process.env.NODE_ENV = 'production';
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    errorController(new AppError('database password leaked', 500, { expose: false }), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Something went very wrong!',
    });
  });
});
