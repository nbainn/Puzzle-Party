// ***IMPORTS****************************************************
const express = require("../node_modules/express");
const { ExpressPeerServer } = require("../node_modules/peer");
const rootConfig = require("../config.js");
const config = require("./config.js");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const Ably = require("ably");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const axios = require("axios");
//const ColorThief = require('color-thief-node');
app.use(bodyParser.json());
// Import Sequelize and your models
const { sq, testDbConnection, fetchWords, User } = require("./sequelize.tsx");
const { queries } = require("@testing-library/react");
const { fabClasses } = require("@mui/material");
const { Room, Word, Puzzle } = sq.models;
// Secret key for JWT signing and encryption
const jwtSecret = config.JWT_SECRET;
// Ably API Key
const ablyApiKey = config.ABLY_API_KEY;
// Google Client ID
const CLIENT_ID = config.CLIENT_ID;


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

// ***SIGNUP/LOGIN ENDPOINT****************************************************

// Function to generate a consistent JWT payload
function generateJwtPayload(user) {
  return {
    id: user.id,
    nickname: user.nickname || user.email.split('@')[0], // Fallback to part of the email if nickname is null
    userColor: user.userColor || '#FFFFFF', // Default color if null
  };
}

// Email+Password Signup Endpoint
app.post("/signup", async (req, res) => {
  try {
    const { email, password, nickname, userColor } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = await User.create({
      email,
      hashedPassword: password, // Pass the plain password; hashing is handled by the model in sequelize
      nickname,
      userColor,
    });

    // Generate a token
    const token = jwt.sign(
      generateJwtPayload(newUser),
      jwtSecret,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      token,
      userId: newUser.id,
      email: newUser.email,
      nickname: newUser.nickname,
      userColor: newUser.userColor,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating new user", error });
  }
});

// Email+Password Login Endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a token
    const token = jwt.sign(
      generateJwtPayload(user),
      jwtSecret,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
      userColor: user.userColor
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login", error });
  }
});

// Google OAuth Verification
const verifyGoogleToken = async (token) => {
  try {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
    const response = await axios.get(url);

    if (response.status === 200) {
      const payload = response.data;

      // Check if the aud field in the payload matches your app's client ID
      if (payload.aud !== CLIENT_ID) {
        throw new Error("Token's client ID does not match app's.");
      }

      // Check if the token is not expired
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      if (currentTime >= payload.exp) {
        throw new Error("Token is expired.");
      }

      // Check if the issuer is correct
      if (
        payload.iss !== "https://accounts.google.com" &&
        payload.iss !== "accounts.google.com"
      ) {
        throw new Error("Token's issuer is invalid.");
      }

      // If you've reached here, the token is valid
      return payload; // This contains the user's information
    } else {
      throw new Error("Token verification failed");
    }
  } catch (error) {
    console.error("Error during Google token verification:", error);
    throw error;
  }
};

// Function to get the dominant color from an image URL
async function getDominantColor(imageUrl) {
  try {
    //const dominantColor = await ColorThief.getColorFromURL(imageUrl);
    // Convert the RGB array to a hex string
    //const hexColor = `#${dominantColor.map(c => c.toString(16).padStart(2, '0')).join('')}`;
    const hexColor = '#FFFFFF';
    return hexColor;
  } catch (error) {
    console.error("Error fetching dominant color:", error);
    // Return a default color if something goes wrong
    return '#FFFFFF';
  }
}

// Google OAuth Login Endpoint
app.post("/googleLogin", async (req, res) => {
  console.log("Received ID token:", req.body.token);
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token not provided." });
    }
    const payload = await verifyGoogleToken(token);
    const googleId = payload["sub"];
    const email = payload["email"];
    const givenName = payload["given_name"]; //  given name (first name)

    // Check if user already exists in database
    let user = await User.findOne({ where: { email } });

    // If user exists, create a token for them
    if (user) {
      const token = jwt.sign(
        generateJwtPayload(user),
        jwtSecret,
        { expiresIn: "1h" }
      );
      res.json({
        token,
        userId: user.id,
        email: user.email,
        nickname: user.nickname,
        userColor: user.userColor
      });
    } else {
      // If the user does not exist, create a new user entry in your database
      
      const pictureUrl = payload["picture"]; // URL of profile picture
      const userColor = await getDominantColor(pictureUrl); // Get the dominant color from the profile picture
      user = await User.create({
        email,
        nickname: givenName, // Use the given name as the user's nickname
        userColor: userColor, // Use the dominant color of their PFP as the user's color
        hashedPassword: googleId, // Pass the plain googleId; hashing is handled by the model in sequelize
      });

      // Create a token for the new user
      const newToken = jwt.sign(
        generateJwtPayload(user),
        jwtSecret,
        { expiresIn: "1h" }
      );

      // Send the token and user info back to the client
      res.status(201).json({
        token: newToken,
        userId: user.id,
        email: user.email,
        nickname: givenName,
        userColor: user.userColor,
      });
    }
  } catch (error) {
    console.error("Error during Google Login:", error);
    res.status(500).json({ message: "Server error during Google login", error });
  }
});

// Middleware to authenticate and decode JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// User profile endpoint
app.get("/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ email: user.email, name: user.name }); // Adjust according to the fields in your User model
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update profile endpoint
app.post("/updateProfile", authenticateToken, async (req, res) => {
  try {
    const { nickname, userColor } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.nickname = nickname || user.nickname;
    user.userColor = userColor || user.userColor;
    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
});

// ***ABLY TOKEN ENDPOINT****************************************************
// Endpoint to get an Ably token
app.post("/getAblyToken", async (req, res) => {
  console.log("Received Ably token request with body:", req.body);
  const { clientId } = req.body;
  if (!clientId) {
    console.error("No clientId provided in the token request.");
    return res.status(400).send("clientId is required");
  }

  const ably = new Ably.Rest({ key: ablyApiKey });
  const tokenParams = { clientId: clientId };

  ably.auth.createTokenRequest(tokenParams, (err, tokenRequest) => {
    if (err) {
      console.error("Error creating Ably token request:", err);
      res.status(500).send("Error requesting token: " + err.message);
    } else {
      console.log(
        "Ably token request successful for clientId:",
        clientId,
        "Token Request:",
        tokenRequest
      );
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(tokenRequest));
    }
  });
});

// ***SERVER SETUP****************************************************
// Allows server to serve react build files
app.use(express.static(path.join(__dirname, "../Frontend/build")));

// Listening for http requests on port 3000
const server = app.listen(rootConfig.PORT, "0.0.0.0", () => {
  console.log(`Server running at ${rootConfig.BASE_URL}:${rootConfig.PORT}`);
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
  const size = req.body.size;
  console.log("SIZE:" + size + "\n");
  console.log("got seed");
  let puzzle = await buildPuzzle(seed, size);
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
      break;
    case "medium":
      puzzle = createPuzzleObject(10, 10);
      break;
    case "large":
      puzzle = createPuzzleObject(15, 15);
      break;
    default:
      puzzle = createPuzzleObject(10, 10);
  }

  // Adding clues to the puzzle object
  let number = 1;
  let increased = false;
  for (let i = 0; i < puzzle.size.rows; i++) {
    for (let j = 0; j < puzzle.size.columns; j++) {
      let queries = await determineAvailability(puzzle, i, j, "across");
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

  sortClues(puzzle);

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
      public_status: true,
    });
    res.send("New field added successfully!");
  } catch (error) {
    console.error("Error adding field:", error);
    res.status(500).send("Error adding field");
  }
});

app.post("/room-status", async (req, res) => {
  try {
    const roomCode = req.body.roomId;
    let foundRoom = await Room.findOne({
      where: { room_code: roomCode },
      attributes: ["public_status"],
    });
    if (foundRoom) {
      console.log(foundRoom.public_status);
      res.status(200).send(foundRoom.public_status);
    } else {
      res.status(404).send(null);
    }
  } catch (error) {
    console.error("Error finding field:", error);
    res.status(500).send("Error finding field");
  }
});

app.post("/change-status", async (req, res) => {
  try {
    const roomCode = req.body.roomId; // Access roomCode directly from req.body
    const status = req.body.status;
    let newStatus;
    console.log(status);
    if (status == "public") {
      newStatus = false;
    } else {
      newStatus = true;
    }
    if (!roomCode) {
      throw new Error("Room code is missing in the request body");
    }
    console.log("Changing private/public status", roomCode);
    await Room.update(  
      { public_status: newStatus },
      { where: { room_code: roomCode } }
    );
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
      where: { public_status: true },
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
