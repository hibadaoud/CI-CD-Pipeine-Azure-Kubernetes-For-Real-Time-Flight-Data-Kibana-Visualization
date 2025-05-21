// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./authRoutes');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(
  MONGO_URI,
  {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASSWORD,
  }
)
  .then(() => console.log('Connected to MongoDB'))
  .catch(_err => console.error('MongoDB connection error:', _err));

app.use('/', authRoutes);

if (require.main === module) {
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
module.exports = app;
