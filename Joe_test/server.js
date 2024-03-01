// ***IMPORTS****************************************************
const express = require("../node_modules/express");
const { ExpressPeerServer } = require("../node_modules/peer");
const config = require("../config.js");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
// Import Sequelize and your models
const { sq, testDbConnection } = require("./sequelize.tsx");
const { Character, Description, Room } = sq.models;

// Use the testDbConnection function to authenticate and sync models
testDbConnection();

// Example: Create a new character
/*
const newCharacter = Character.create({
  index: 1,
  value: "a",
  isParent: true,
});

// Example: Query all characters
const allCharacters = Character.findAll();

// Example: Update a character
Character.update({ value: "b" }, { where: { id: newCharacter.id } });
*/

// ***SERVER SETUP****************************************************
// Allows server to serve react build files
app.use(express.static(path.join(__dirname, "build")));

// Listening for http requests on port 3000
const server = app.listen(config.PORT, "0.0.0.0", () => {
  console.log(`Server running at ${config.BASE_URL}:${config.PORT}`);
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

// ***HTTP REQUESTS****************************************************
// Root of the webpage, serves the react build to be displayed
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

// Sample http request to the server
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Request for puzzle generaation
app.get("/puzzle", (req, res) => {
  createClueObject();
  createPuzzleObject();
  res.json({ message: "Hello from the server!" });
});

// ***PUZZLE GENERATION****************************************************
function createPuzzleObject(rows, columns) {
  return (puzzle = {
    size: {
      rows: rows,
      columns: columns,
    },
    clues: {
      across: [],
      down: [],
    },
    grid: Array.from({ length: rows }, () => Array(columns).fill("")),
  });
}

function createClueObject() {
  return (clue = {
    number: 0,
    clue: "",
    answer: "",
    row: 0,
    column: 0,
    direction: "",
  });
}

// ***ROOM CREATION****************************************************

app.post("/add-entry", async (req, res) => {
  try {
    const roomCode = req.body.roomCode; // Access roomCode directly from req.body
    if (!roomCode) {
      throw new Error("Room code is missing in the request body");
    }
    console.log("Adding room to db server side", roomCode);
    await Room.create({ 
      room_code: roomCode, 
      host: "testHost", 
      num_players: 1, 
      isActive: true
    });
    res.send("New field added successfully!");
  } catch (error) {
    console.error("Error adding field:", error);
    res.status(500).send("Error adding field");
  }
});

app.post('/search-entry', async (req, res) => {
  try {
    const roomCode = req.body.roomCode;
    if (!roomCode) {
      throw new Error("Room code is missing in the request body");
    }
    let foundRoom = await Room.findOne({ 
      where: {room_code: roomCode },
      attributes: ['host']
    });
    if (foundRoom) {
      res.status(200).send(JSON.stringify(foundRoom.host));
    } else {
      res.status(404).send(null);
    }
  } catch (error) {
    console.error('Error finding field:', error);
    res.status(500).send('Error finding field');
  }
});