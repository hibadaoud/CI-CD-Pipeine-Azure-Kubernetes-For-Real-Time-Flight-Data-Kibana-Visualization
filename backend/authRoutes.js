// authRoutes.js
const express = require('express');
const { registerUser, loginUser, authenticateToken } = require('./authService');
const { spawn } = require('child_process');
const path = require('path');
const OS = require('os');


const router = express.Router();

router.get('/live', async (req, res) => {
    console.log("Live Status endpoint hit");
    res.setHeader('Content-Type', 'application/json');
    res.send({
        status: "live"
    });
});

router.get('/os', async (req, res) => {
    console.log("Os endpoint hit");
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "os": OS.hostname(),
        "env": process.env.NODE_ENV
    });
});

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const result = await registerUser(email, password);
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(201).json({ message: result.message });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  if (result.error) {
    return res.status(401).json({ error: result.error });
  }
  return res.json(result);
});

router.get('/dashboard', authenticateToken, (_req, res) => {
    const scriptPath = path.join(__dirname, 'producer_app.py');
    const producer = spawn('../python_env/bin/python', [ scriptPath]);
    let responded = false;

    producer.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`Producer stdout: ${output}`);
        if (!responded && output.includes('[INFO] API responded with status: 200')) {
            responded = true;
            res.status(200).json({ message: 'Access is granted and API is up and responding with 200!' });
        }
    });

    producer.stderr.on('data', (data) => {
        console.error(`Producer stderr: ${data.toString()}`);
    });

    producer.on('close', (code) => {
        if (responded) return;
        responded = true;
        if (code === 0) {
            console.log('Producer completed successfully but but did not output expected message.');
            res.status(200).json({ message: 'Access granted & Producer completed but did not output expected message.' });
        } else {
            console.error(`Producer exited with code ${code}`);
            res.status(500).json({ error: 'Access granted but Producer exited with errors' });
        }
    });
});

router.post('/start-producer', (_req, res) => {
  const scriptPath = path.join(__dirname, 'producer_app.py');
  const producer = spawn('../python_env/bin/python', [ scriptPath]);
  let responded = false;

  producer.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`Producer stdout: ${output}`);
    if (!responded && output.includes('[INFO] API responded with status: 200')) {
      responded = true;
      res.status(200).json({ message: 'API is up and responding with 200!' });
    }
  });

  producer.stderr.on('data', (data) => {
      console.error(`Producer stderr: ${data.toString()}`);
  });

  producer.on('close', (code) => {
    if (responded) return;
    responded = true;
    if (code === 0) {
        console.log('Producer completed successfully but but did not output expected message.');
        res.status(200).json({ message: 'Access granted & Producer completed but did not output expected message.' });
    } else {
        console.error(`Producer exited with code ${code}`);
        res.status(500).json({ error: 'Producer exited with errors' });
    }
  });
});

module.exports = router;
