const express = require("../config/node_modules/express");
//const cors = require("../config/node_modules/cors");
const http = require("http");
const path = require("path");
const app = express();
const port = 3000;

//app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Serve static files from the 'config' directory
app.use(express.static(path.join(__dirname, "../config")));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Route handler for the root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Endpoint to handle GET requests
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const { ExpressPeerServer } = require("../config/node_modules/peer");

const peerServer = ExpressPeerServer(server, {
  proxied: true,
  debug: true,
  path: "/myapp",
  ssl: {},
});

app.use(peerServer);
