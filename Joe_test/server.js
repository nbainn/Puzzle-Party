// Express framework
const express = require("../node_modules/express");
// Importing peer server capabilities
const { ExpressPeerServer } = require("../node_modules/peer");
const config = require("../config.js");
// Express will import http automatically too
const http = require("http");
const path = require("path");
const app = express();
const port = 3000;

// Allows server to serve react build files
app.use(express.static(path.join(__dirname, "build")));

// Root of the webpage, serves the react build to be displayed
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

// Sample http request to the server
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Listening for http requests on port 3000
const server = app.listen(config.PORT, "0.0.0.0", () => {
  console.log(`Server running at ${config.BASE_URL}:${port}`);
});

// This lets the peer JS server run on the same port as local host because we can define a path
// denoted by /myapp (arbitrary)
// Going to localhost:3000/myapp would be the same thing as going to peerJS servers available online
const peerServer = ExpressPeerServer(server, {
  proxied: true,
  debug: true,
  path: "/myapp",
  ssl: {},
});

// Using peerServer to handle peerJS requests through defined path
app.use(peerServer);
