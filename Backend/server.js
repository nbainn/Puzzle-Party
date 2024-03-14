// ***IMPORTS****************************************************
const express = require("../node_modules/express");
const { ExpressPeerServer } = require("../node_modules/peer");
const config = require("../config.js");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const Ably = require("ably");
const app = express();
app.use(bodyParser.json());
// Import Sequelize and your models
const { sq, testDbConnection, fetchWords } = require("./sequelize.tsx");
const { queries } = require("@testing-library/react");
const { Room, Word, Puzzle } = sq.models;

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

// ***ABLY TOKEN ENDPOINT****************************************************
// Endpoint to get an Ably token
app.post("/getAblyToken", async (req, res) => {
  const { clientId } = req.body;
  if (!clientId) {
    return res.status(400).send("clientId is required");
  }

  const ably = new Ably.Rest({
    key: "u-tBhA.LAJA1A:D5_Sa8D3Grz3QdLdE4K5N6ZMMiZnA87OABpBUemj1gs",
  });

  const tokenParams = { clientId };
  ably.auth.createTokenRequest(tokenParams, (err, tokenRequest) => {
    if (err) {
      res.status(500).send("Error requesting token: " + err.message);
    } else {
      res.send(tokenRequest);
    }
  });
});

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
/*const peerServer = ExpressPeerServer(server, {
  proxied: true,
  debug: true,
  path: "/myapp",
  ssl: {},
});*/

// Using peerServer to handle peerJS requests through defined path
//app.use(peerServer);

// ***HTTP REQUESTS****************************************************
// Root of the webpage, serves the react build to be displayed
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

// Request for puzzle generaation
app.post("/puzzle", async (req, res) => {
  console.log("Puzzle request received");
  const seed = req.body.seed;
  console.log("got seed");
  let puzzle = await buildPuzzle(seed, "medium");
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
async function addClueToPuzzle(puzzle, clue) {
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
// Takes dictionary as argument with indexes matching to characters
async function queryWord(specifications, seed, maxLength) {
  let words = await fetchWords(specifications, maxLength);
  let wordsLength = words.length;
  if (wordsLength === 0) {
    return null;
  }
  wordIndex = seed % wordsLength;

  descriptions = words[wordIndex].descriptions.split(",");
  descriptionsLength = descriptions.length;
  descriptionIndex = seed % descriptionsLength;

  return (word = {
    word: words[wordIndex].word,
    description: descriptions[descriptionIndex],
  });
}

// Function that determines all possible combinations of words that can fit...
// ...in a specific location and direction
async function determineAvailability(puzzle, row, column, direction) {
  let queries = [];
  let query = {
    specifications: {},
    maxLength: 0,
  };
  let current = 1;

  if (direction == "across") {
    if (
      puzzle.size.columns - column >= 3 &&
      (column == 0 || puzzle.grid[row][column - 1] == " ") &&
      puzzle.grid[row][column + 1] == " "
    ) {
      for (let i = column; i < puzzle.size.columns; i++) {
        if (puzzle.grid[row][i] === " ") {
          if (
            (puzzle.grid[row + 1] !== undefined &&
              puzzle.grid[row + 1][i] !== " ") ||
            (puzzle.grid[row - 1] !== undefined &&
              puzzle.grid[row - 1][i] !== " ")
          ) {
            if (current - 1 >= 3) {
              query.maxLength = current - 1;
              queries.push(JSON.parse(JSON.stringify(query)));
            }
            return queries;
          }
        } else {
          if (current - 2 >= 3) {
            query.maxLength = current - 2;
            queries.push(JSON.parse(JSON.stringify(query)));
          }
          query.specifications[current] = puzzle.grid[row][i];
        }
        current++;
      }
      query.maxLength = current - 1;
      queries.push(JSON.parse(JSON.stringify(query)));
    }
  } else if (direction == "down") {
    if (
      puzzle.size.rows - row >= 3 &&
      (row == 0 || puzzle.grid[row - 1][column] == " ") &&
      puzzle.grid[row + 1][column] == " "
    ) {
      for (let i = row; i < puzzle.size.rows; i++) {
        if (puzzle.grid[i][column] === " ") {
          if (
            (puzzle.grid[i][column + 1] !== undefined &&
              puzzle.grid[i][column + 1] !== " ") ||
            (puzzle.grid[i][column - 1] !== undefined &&
              puzzle.grid[i][column - 1] !== " ")
          ) {
            if (current - 1 >= 3) {
              query.maxLength = current - 1;
              queries.push(JSON.parse(JSON.stringify(query)));
            }
            return queries;
          }
        } else {
          if (current - 2 >= 3) {
            query.maxLength = current - 2;
            queries.push(JSON.parse(JSON.stringify(query)));
          }
          query.specifications[current] = puzzle.grid[i][column];
        }
        current++;
      }
      query.maxLength = current - 1;
      queries.push(JSON.parse(JSON.stringify(query)));
    }
  }

  return queries;
}

// Function that builds a crossword puzzle using all above functions
// Queries words one at a time and adds them to crossword puzzle
async function buildPuzzle(seed, size) {
  seed = parseInt(seed);
  let puzzle;
  // Creating the puzzle object
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
  let number = 1;
  let increased = false;
  for (let i = 0; i < puzzle.size.rows; i++) {
    for (let j = 0; j < puzzle.size.columns; j++) {
      let queries = await determineAvailability(puzzle, i, j, "across");
      console.log(queries);
      let info = null;
      if (queries.length > 0) {
        for (let k = queries.length - 1; k >= 0; k--) {
          info = await queryWord(
            queries[k].specifications,
            seed,
            queries[k].maxLength
          );
          if (info != null) {
            let clue = createClueObject();
            clue.number = number;
            increased = true;
            number++;
            clue.answer = info.word;
            clue.clue = info.description;
            clue.row = i;
            clue.column = j;
            clue.direction = "across";
            await addClueToPuzzle(puzzle, clue);
            break;
          }
        }
      }
      seed += 29;
      queries = await determineAvailability(puzzle, i, j, "down");
      console.log(queries);
      info = null;
      if (queries.length > 0) {
        for (let k = queries.length - 1; k >= 0; k--) {
          info = await queryWord(
            queries[k].specifications,
            seed,
            queries[k].maxLength
          );
          if (info != null) {
            let clue = createClueObject();
            if (increased) {
              clue.number = number - 1;
            } else {
              clue.number = number;
              number++;
            }
            clue.answer = info.word;
            clue.clue = info.description;
            clue.row = i;
            clue.column = j;
            clue.direction = "down";
            await addClueToPuzzle(puzzle, clue);
            break;
          }
        }
      }
      seed += 29;
      increased = false;
    }
  }

  console.log(puzzle);

  return puzzle;
}

// SAMPLE FUNCTION TO CHECK GUESSES**** will go client side later
function checkAllWords(realPuzzle, guessPuzzle) {
  for (let i = 0; i < guessPuzzle.size.rows; i++) {
    for (let j = 0; j < guessPuzzle.size.columns; j++) {
      if (guessPuzzle.grid[i][j] !== realPuzzle.grid[i][j]) {
        guessPuzzle.grid[i][j] = "/";
      }
    }
  }
  return guessPuzzle;
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

app.get("/find-rooms", async (req, res) => {
  try {
    const limit = req.query.limit;
    console.log("Limit: ", limit);
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
