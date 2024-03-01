// ***IMPORTS****************************************************
const express = require("../node_modules/express");
const { ExpressPeerServer } = require("../node_modules/peer");
const config = require("../config.js");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();

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
// Creates an empty puzzle object with only the size of the puzzle specified
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

// Creates an empty clue object
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

// Adds a clue to the puzzle object
function addClueToPuzzle(puzzle, clue) {
  if (clue.direction === "across") {
    puzzle.clues.across.push(clue);
  } else {
    puzzle.clues.down.push(clue);
  }
  let row = clue.row;
  let column = clue.column;
  let answer = clue.answer;
  let direction = clue.direction;
  for (let i = 0; i < answer.length; i++) {
    if (direction === "across") {
      puzzle.grid[row][column + i] = answer[i];
    } else {
      puzzle.grid[row + i][column] = answer[i];
    }
  }
}

// Sorts the clues in the puzzle object by number so that they can be displayed easily
function sortClues(puzzle) {
  puzzle.clues.across.sort((a, b) => a.number - b.number);
  puzzle.clues.down.sort((a, b) => a.number - b.number);
}

// Function for querying words from the database
// Array as argument in form {index1, character1, index2, character2, ...} for specifications
function queryWord(specifications, seed) {}

// Function that builds a crossword puzzle using all above functions
// Queries words one at a time and adds them to crossword puzzle
function buildPuzzle(seed, size) {
  puzzle;
  // Creating the puzzle object
  switch (size) {
    case "small":
      puzzle = createPuzzleObject(5);
    case "medium":
      puzzle = createPuzzleObject(10);
    case "large":
      puzzle = createPuzzleObject(15);
    default:
      puzzle = createPuzzleObject(10);
  }

  // Adding clues to the puzzle object

  return puzzle;
}

// ***ROOM CREATION****************************************************

app.post("/add-entry", async (req, res) => {
  try {
    const { roomCode } = req.body;
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
    const  roomCode  = req.body;
    const foundRoom = await Room.findOne({ 
      where: {room_code: roomCode },
      attributes: ['host']
    });
    if (foundRoom) {
      res.status(200).send(foundRoom.host);
    } else {
      res.status(404).send('Room not found');
    }
  } catch (error) {
    console.error('Error finding field:', error);
    res.status(500).send('Error finding field');
  }
});

