import { ApiClientError } from './api-client';

describe('ApiClientError', () => {
  it('should create error with message and status code', () => {
    const error = new ApiClientError('Not found', 404);
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('ServerClientError');
  });

  it('should create error with validation errors', () => {
    const validationErrors = [
      { path: 'email', message: 'Invalid email' },
      { path: 'name', message: 'Required' },
    ];
    const error = new ApiClientError('Validation failed', 400, validationErrors);
    expect(error.errors).toEqual(validationErrors);
    expect(error.statusCode).toBe(400);
  });

  it('should be an instance of Error', () => {
    const error = new ApiClientError('test', 500);
    expect(error).toBeInstanceOf(Error);
  });
});
