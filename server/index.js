const path = require('path');
// Ensure .env is loaded from this directory even if started from project root
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const mongoose = require('mongoose');

const app = express();
app.use(cors());
// Debugging: Force CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
const port = process.env.PORT || 5001;

// Middleware
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cashdash';
console.log('Connecting to MongoDB at:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Make sure MongoDB is running on your local machine');
    console.log('To start MongoDB: brew services start mongodb/brew/mongodb-community');
  });

// Basic route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// API routes
app.use('/api', require('./routes/api'));

app.listen(port, '0.0.0.0', () => {
  // Get network interfaces to show available IP addresses
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = {};

  // Collect all network interfaces
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  console.log(`Server running on port ${port}`);
  console.log('Available on these network addresses:');
  
  // Log all available IP addresses
  for (const [interface, addresses] of Object.entries(results)) {
    for (const addr of addresses) {
      console.log(`  http://${addr}:${port}`);
    }
  }
  console.log(`  http://localhost:${port}`);
  console.log('\nAPI endpoints available at [server-address]/api');
});
