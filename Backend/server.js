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
app.use(express.static(path.join(__dirname, "../Frontend/build")));

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

// Request for puzzle generaation
app.post("/puzzle", (req, res) => {
  console.log("Puzzle request received");
  const seed = req.body.seed;
  console.log("got seed");
  let puzzle = buildPuzzle(seed, "medium");
  console.log("built puzzle");
  res.json({ puzzle });
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
    grid: Array.from({ length: rows }, () => Array(columns).fill(" ")),
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
function queryWord(specifications, seed) {
  switch (specifications[0]) {
    case 0:
      return "apple";
    case 1:
      return "avalanche";
    case 2:
      return "pear";
    case 3:
      return "elephant";
    default:
      return "";
  }
}

// Function that builds a crossword puzzle using all above functions
// Queries words one at a time and adds them to crossword puzzle
function buildPuzzle(seed, size) {
  let puzzle;
  // Creating the puzzle object
  size = "medium";
  switch (size) {
    case "small":
      puzzle = createPuzzleObject(5, 5);
    case "medium":
      puzzle = createPuzzleObject(10, 10);
    case "large":
      puzzle = createPuzzleObject(15, 15);
    default:
      puzzle = createPuzzleObject(10, 10);
  }

  // Adding clues to the puzzle object
  for (let i = 0; i < 4; i++) {
    let rows = [0, 0, 0, 0];
    let columns = [0, 0, 2, 4];
    let directions = ["across", "down", "down", "down"];
    let specifications = [i];
    let clue = createClueObject();
    clue.number = i + 1;
    clue.clue = "This is a test clue";
    clue.answer = queryWord(specifications, seed);
    console.log(clue.answer);
    clue.row = rows[i];
    clue.column = columns[i];
    clue.direction = directions[i];
    addClueToPuzzle(puzzle, clue);
  }

  console.log(puzzle);

  return puzzle;
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
      isActive: true,
    });
    res.send("New field added successfully!");
  } catch (error) {
    console.error("Error adding field:", error);
    res.status(500).send("Error adding field");
  }
});

app.post("/search-entry", async (req, res) => {
  try {
    const roomCode = req.body.roomCode;
    if (!roomCode) {
      throw new Error("Room code is missing in the request body");
    }
    let foundRoom = await Room.findOne({
      where: { room_code: roomCode },
      attributes: ["host"],
    });
    if (foundRoom) {
      console.log(foundRoom.host);
      res.status(200).send(foundRoom.host);
    } else {
      res.status(404).send(null);
    }
  } catch (error) {
    console.error("Error finding field:", error);
    res.status(500).send("Error finding field");
  }
});

app.post("/find-rooms", async (req, res) => {
  try {
    const limit = req.query.limit;
    const rooms = await Room.findAll({
      limit: limit,
      //attributes: ["host", "room_code"], 
    });
    if (rooms) {
      console.log(rooms);
      res.status(200).send(rooms);
    } else {
      res.status(404).send(null);
    }
  } catch (error) {
    console.error("Error finding field:", error);
    res.status(500).send("Error finding field");
  }
});
