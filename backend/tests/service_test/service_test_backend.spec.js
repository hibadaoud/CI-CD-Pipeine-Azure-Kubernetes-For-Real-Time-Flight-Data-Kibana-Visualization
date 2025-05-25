const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const createApp = require("../../createApp");


let app
beforeAll(async() => {
	try{
	  const mongoUri = process.env.MONGO_TEST_URI ;
    options = {
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASSWORD,
			connectTimeoutMS: 10000, // Connection timeout in milliseconds
     	family: 4, // Force IPv4
    };     
    // Connect to MongoDB
		console.log("Trying to conenct to Test Database");
    await mongoose.connect(mongoUri, options);
		console.log("Connected to Test Database at", process.env.MONGO_TEST_URI);
	}catch(err){
		console.error("Database connection error:",  err.stack || err);
		console.log("Attempting to connect to database at:", process.env.MONGO_TEST_URI );
	}
	app = createApp(); 

});

afterAll(async () => {
		await mongoose.connection.dropDatabase();
		await mongoose.connection.close();
	});

// Mock child_process.spawn
jest.mock('child_process', () => {
  const events = require('events');
  return {
    spawn: jest.fn(() => {
      console.log('[MOCK] spawn was called!');
      // Simulate a child process
      const mockChild = new events.EventEmitter();
      mockChild.stdout = new events.EventEmitter();
      mockChild.stderr = new events.EventEmitter();

      // Simulate Python output and close event
      setTimeout(() => {
        mockChild.stdout.emit('data', '[INFO] API responded with status: 200');
        mockChild.emit('close', 0);
      }, 10);

      return mockChild;
    }),
  };
});


describe('User Registration and Login', () => {
  it('should register a user', async () => {
    const res = await request(app)
      .post('/register')
      .send({ email: 'test@example.com', password: 'StrongP@ss1' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should not register with weak password', async () => {
    const res = await request(app)
      .post('/register')
      .send({ email: 'test2@example.com', password: 'weak' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.');
  });

  it('should not register duplicate email', async () => {
    await request(app).post('/register').send({ email: 'dupe@example.com', password: 'StrongP@ss1' });
    const res = await request(app).post('/register').send({ email: 'dupe@example.com', password: 'StrongP@ss1' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email already exists');
  });

  it('should login user and get JWT', async () => {
    await request(app).post('/register').send({ email: 'login@example.com', password: 'StrongP@ss1' });
    const res = await request(app).post('/login').send({ email: 'login@example.com', password: 'StrongP@ss1' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token', 'message', 'Login successful ');
  });

  it('should reject login with invalid email', async () => {
    const res = await request(app).post('/login').send({ email: 'nobody@example.com', password: 'whatever' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid email');
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/register').send({ email: 'login@example.com', password: 'StrongP@ss1' });
    const res = await request(app).post('/login').send({ email: 'login@example.com', password: 'whatever' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Wrong password');
  });
});

describe('Protected Dashboard and producer start', () => {
  let token;
  beforeEach(async () => {
    await request(app).post('/register').send({ email: 'user@example.com', password: 'StrongP@ss1' });
    const res = await request(app).post('/login').send({ email: 'user@example.com', password: 'StrongP@ss1' });
    token = res.body.token;
  });

  it('should reject dashboard without token', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error', 'Token is required');

  });

  it('should reject dashboard with invalid token', async () => {
    // Make a JWT with the wrong secret key
    const wrongToken = jwt.sign({ email: 'user@example.com' }, 'wrongsecret', { expiresIn: '1h' });

    const res = await request(app).get('/dashboard').set('Authorization', `Bearer ${wrongToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error', 'Invalid or expired token');
  });

 

  it('should access dashboard with valid token and start the producer successfully', async () => {
    const res = await request(app).get('/dashboard').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Access is granted and API is up and responding with 200!');
    const { spawn } = require('child_process');
    expect(spawn).toHaveBeenCalled(); // proves your mock ran!
  });
});

describe('POST /start-producer', () => {
  it('should respond 200 when producer reports API 200', async () => {
    const res = await request(app).post('/start-producer');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'API is up and responding with 200!');
  });
});
