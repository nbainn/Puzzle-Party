// Express framework
const express = require("../config/node_modules/express");
// Might not need http and path
const http = require("http");
const path = require("path");
const app = express();
const port = 3000;

// Used to make live server somewhat compatible, mostly garbage
// const cors = require("../config/node_modules/cors");
/*app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});*/

// Serve static files from the 'config' directory
app.use(express.static(path.join(__dirname, "../config")));

// Serve static files from the 'public' folder
// What this does is allow server.js to grab index.html (or other files)
// from the public folder and give them to the client
app.use(express.static(path.join(__dirname, "public")));

// Route handler for the root path
// When the webpage is opened, this is the initial http request
// The index.html file is sent to the client so they can render it
// req stands for request, and res stands for response
// The single "/" represents the root directy of the server, which is
// the initial request sent
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// If you were to go to localhost:3000/api/data (arbitrary path), then the server
// would return this instead of an html file
// Used for getting information from the server, or new webpages
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Start the server at the port given above and listens for incoming connections
// Initial connection are at the root directory, which we have set to serve the html above
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// This grabs the ExpressPeerServer object from peer library (using relative path as
// noted by lack of inital forward slash)
// require is like import
const { ExpressPeerServer } = require("../config/node_modules/peer");

// This lets the peer JS server run on the same port as local host because we can define a path
// denoted by /myapp (arbitrary)
// Going to localhost:3000/myapp would be the same thing as going to peerJS servers available online
const peerServer = ExpressPeerServer(server, {
  proxied: true,
  debug: true,
  path: "/myapp",
  ssl: {},
});

// Using peerServer
// app is express embodied
app.use(peerServer);
