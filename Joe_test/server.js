const express = require('../config/node_modules/express');
const app = express();
const port = 3000;

// ********
// We dont actually need this, this is just so that live server works with http requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Endpoint to handle GET requests
app.get('/api/data', (req, res) => {
  // Send a JSON response
  res.json({ message: 'Hello from the server!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
