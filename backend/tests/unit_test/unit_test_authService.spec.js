const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock User model
jest.mock('../../models/User', () => {
  const User = jest.fn(function(userData) {
    this.email = userData.email;
    this.password = userData.password;
    this.save = jest.fn().mockResolvedValue();
  });
  User.findOne = jest.fn();
  return User;
});

const User = require('../../models/User');

const authService = require('../../authService');

describe('validatePassword', () => {
  it('returns true for a strong password', () => {
    expect(authService.validatePassword('StrongP@ss1')).toBe(true);
  });
  it('returns false for a weak password', () => {
    expect(authService.validatePassword('weak')).toBe(false);
  });
});

describe('registerUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns error if email exists', async () => {
    User.findOne.mockResolvedValue({ email: 'test@example.com' });
    const result = await authService.registerUser('test@example.com', 'StrongP@ss1');
    expect(result).toHaveProperty('error', 'Email already exists');
  });

  it('returns error if password is weak', async () => {
    User.findOne.mockResolvedValue(null);
    const result = await authService.registerUser('test@example.com', 'weak');
    expect(result).toHaveProperty('error');
    expect(result.error).toMatch(/Password must be at least 8/);
  });

  it('registers user with hashed password', async () => {
    User.findOne.mockResolvedValue(null);
    // Mock bcrypt
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPW');
    const mockSave = jest.fn().mockResolvedValue();
    User.mockImplementation(function(userData) {
      this.email = userData.email;
      this.password = userData.password;
      this.save = mockSave;
    });

    const result = await authService.registerUser('test@example.com', 'StrongP@ss1');
    expect(result).toHaveProperty('message', 'User registered successfully');
    expect(mockSave).toHaveBeenCalled();
  });
});

describe('loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns error if user not found', async () => {
    User.findOne.mockResolvedValue(null);
    const result = await authService.loginUser('notfound@example.com', 'StrongP@ss1');
    expect(result).toHaveProperty('error', 'Invalid email');
  });

  it('returns error if password is wrong', async () => {
    User.findOne.mockResolvedValue({ email: 'test@example.com', password: 'hashedPW' });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
    const result = await authService.loginUser('test@example.com', 'wrongPW');
    expect(result).toHaveProperty('error', 'Wrong password');
  });

  it('returns token if login is correct', async () => {
    User.findOne.mockResolvedValue({ email: 'test@example.com', password: 'hashedPW' });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    jest.spyOn(jwt, 'sign').mockReturnValue('faketoken');
    const result = await authService.loginUser('test@example.com', 'StrongP@ss1');
    expect(result).toHaveProperty('token', 'faketoken');
    expect(result).toHaveProperty('message', 'Login successful ');
  });
});

// Middleware (authenticateToken) test example:
describe('authenticateToken', () => {
  it('rejects missing token', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    authService.authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token is required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalidtoken' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    jest.spyOn(jwt, 'verify').mockImplementation((_token, _secret, cb) => cb(true, null));
    authService.authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts valid token', () => {
    const req = { headers: { authorization: 'Bearer validtoken' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    jest.spyOn(jwt, 'verify').mockImplementation((_token, _secret, cb) => cb(null, { email: 'a@b.com' }));
    authService.authenticateToken(req, res, next);
    expect(req.user).toEqual({ email: 'a@b.com' });
    expect(next).toHaveBeenCalled();
  });
});
