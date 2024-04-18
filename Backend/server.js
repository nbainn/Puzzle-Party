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
const cookieParser = require('cookie-parser');
const fs = require("fs");
//import wu from "./wordUpdater";
//const ColorThief = require('color-thief-node');
app.use(bodyParser.json());
// Import Sequelize and your models
const { sq, testDbConnection, fetchWords, User } = require("./sequelize.tsx");
const { queries } = require("@testing-library/react");
const { fabClasses } = require("@mui/material");
const { Room, Word, Puzzle, Statistics} = sq.models;
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
app.use(cookieParser());

// Function to generate a consistent JWT payload
function generateJwtPayload(user) {
  return {
    id: user.id,
    nickname: user.nickname || user.email.split("@")[0], // Fallback to part of the email if nickname is null
    userColor: user.userColor || "#FFFFFF", // Default color if null
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
    const token = jwt.sign(generateJwtPayload(newUser), jwtSecret, {
      expiresIn: "1h",
    });

    // Set the cookie with the token
    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 3600000), // 1 hour
      sameSite: 'strict',
      //secure: true,
    };
    res.cookie('token', token, cookieOptions);

    // Send response
    res.status(201).json({ 
      userId: newUser.id, 
      email: newUser.email, 
      nickname: newUser.nickname, 
      userColor: newUser.userColor 
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
    const token = jwt.sign(generateJwtPayload(user), jwtSecret, {
      expiresIn: "1h",
    });

    // Set the cookie with the token
    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 3600000), // 1 hour
      sameSite: 'strict',
      //secure: true,
    };
    res.cookie('token', token, cookieOptions);

    // Send response
    res.json({ 
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

// Temporary random color generator
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Function to get the dominant color from an image URL
async function getDominantColor(imageUrl) {
  try {
    //const dominantColor = await ColorThief.getColorFromURL(imageUrl);
    // Convert the RGB array to a hex string
    //const hexColor = `#${dominantColor.map(c => c.toString(16).padStart(2, '0')).join('')}`;
    const hexColor = getRandomColor();
    return hexColor;
  } catch (error) {
    console.error("Error fetching dominant color:", error);
    // Return a default color if something goes wrong
    return "#FFFFFF";
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
    const givenName = payload["given_name"]; // given name (first name)

    // Check if user already exists in database
    let user = await User.findOne({ where: { email } });

    // If user exists, create a token for them
    if (user) {
      const token = jwt.sign(generateJwtPayload(user), jwtSecret, {
        expiresIn: "1h",
      });

      // Set the cookie with the token
      const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 3600000), // 1 hour
        sameSite: 'strict',
        //secure: true,
      };
      res.cookie('token', token, cookieOptions);

      // Send response
      res.json({
        userId: user.id,
        email: user.email,
        nickname: user.nickname,
        userColor: user.userColor,
      });
    } else {
      // If the user does not exist, create a new user entry in database
      const pictureUrl = payload["picture"]; // URL of profile picture
      const userColor = await getDominantColor(pictureUrl); // Get the dominant color from the profile picture
      user = await User.create({
        email,
        nickname: givenName, // Use the given name as the user's nickname
        userColor: userColor,
        hashedPassword: googleId, // Pass the plain googleId; hashing is handled by the model in sequelize
      });

      // Create a token for the new user
      const newToken = jwt.sign(generateJwtPayload(user), jwtSecret, {
        expiresIn: "1h",
      });

      // Set the cookie with the token
      const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 3600000), // 1 hour
        sameSite: 'strict',
        //secure: true,
      };
      res.cookie('token', token, cookieOptions);

      // Set the cookie with the new token
      res.cookie('token', newToken, cookieOptions);

      // Send response
      res.status(201).json({
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

// Middleware to authenticate and decode Token
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token is invalid' });
    req.user = user;
    next();
  });
};

// User profile endpoint
app.get("/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ 
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      userColor: user.userColor
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update profile endpoint
app.post("/updateProfile", authenticateToken, async (req, res) => {
  const { nickname, userColor } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      user.nickname = nickname || user.nickname;
      user.userColor = userColor || user.userColor;
      await user.save();
      res.json({ message: "Profile updated successfully" });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Failed to update user profile", error);
    res.status(500).send("Failed to update user profile");
  }
});

// Verify Token Endpoint
app.get('/verifyToken', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    // No token provided
    return res.status(200).json({ user: null });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      // Token is invalid
      return res.status(200).json({ user: null });
    }
    // Token is valid, return the user information
    return res.status(200).json({ user });
  });
});

// Logout Endpoint
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

// ***WORD/DESCRIPTIONS SUGGESTIONS****************************************
app.post("/suggestion", async (req, res) => {
  console.log("Suggestion request received");
  const word = req.body.word;
  const description = req.body.description;
  let suggestion = word + "," + description + "\n";
  fs.appendFile("wordsDescriptions.txt", suggestion, (err) => {
    if (err) {
      console.error("Error writing to file:", err);
      return;
    }
  });
});

// ***PUZZLE GENERATION****************************************************
// Creates an empty puzzle object with only the size of the puzzle specified

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
// STATS ENDPOINT
app.post('/addTime', async (req, res) => {

  const userId = req.body.userId;
  const time = req.body.time;

  await addUserTime(userId, time);
  res.status(200).send("Time added successfully");
});

app.post('/addWin', async (req, res) => { 
  const userId = req.body.userId;
  try {
    let stat = await Statistics.findOne(
    {where: {
      userId: userId
    }
  });
  if (!stat) {
    stat = await Statistics.create({
      userId: userId,
      gamesPlayed: 1,
      gamesWon: 0,
      timePlayed: 0,
    });
  }
  stat.gamesWon = stat.gamesWon + 1;
  stat.save();
  res.status(200).send("Win added successfully");
} catch (error) { 
  res.status(404).send("Error adding win" + error);
}
});
app.post('/addPlay', async (req, res) => {
  const userId = req.body.userId;
  try {
    let stat = await Statistics.findOne({
    where: {
      userId: userId
    }
  });
  if (!stat) {
    stat = await Statistics.create({
      userId: userId,
      gamesPlayed: 0,
      gamesWon: 0,
      timePlayed: 0,
    });
  }
  console.log("STATS ADDING PLAYFKNALSDFNA:OISFJ:IOAF")
  stat.gamesPlayed += 1;
  await stat.save();
  res.status(200).send("Play added successfully");
} catch (error) {
  res.status(404).send("Error adding play" + error);
}
});


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

async function addUserTime(userId, time) {
  let stat = await Statistics.findOne({
    where: {
      userId: userId
    }
  });
  
  if (!stat) {
    stat = await Statistics.create({
      userId: userId,
      gamesPlayed: 1,
      gamesWon: 0,
      timePlayed: 0,
    });
  }

  // Convert milliseconds to seconds and round off to the nearest whole number
  
  stat.timePlayed += time / 1000;
  await stat.save();
}

async function getUserStatistics(userId) {
  let stat = await Statistics.findOne({
    where: {
      userId: userId
    }
  });
  if (!stat) {
    return null;
  } 
  return { timePlayed: Math.round(stat.timePlayed), gamesPlayed: stat.gamesPlayed, gamesWon: stat.gamesWon };
}

async function getGlobalStatistics() { 
  let totalTime = Math.round(await Statistics.sum("timePlayed"));
  let totalGames = await Statistics.sum("gamesPlayed");
  let totalWins = await Statistics.sum("gamesWon");
  return { timePlayed: totalTime, gamesPlayed: totalGames, gamesWon: totalWins, gamesLost: totalGames - totalWins};
}

async function addUserWins(userId) {
  let stat = await Statistics.findOne(
    {where: {
      userId: userId
    }
  });
  if (!stat) {
    stat = await Statistics.create({
      userId: userId,
      gamesPlayed: 1,
      gamesWon: 0,
      timePlayed: 0,
    });
  }
  stat.wins = stat.wins + 1;
  stat.save();
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

app.post("/fetch-nickname", async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findByPk(userId);
    if (user) {
      res.status(200).send(user.nickname);
    } else {
      res.status(404).send(null);
    }
  } catch (error) {
    console.error("Error finding field:", error);
    res.status(500).send("Error finding field");
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
      attributes: ["host", "banned_players"],
    });
    if (foundRoom) {
      console.log(foundRoom.host);
      res.status(200).send(foundRoom);
    } else {
      res.status(404).send(null);
    }
  } catch (error) {
    console.error("Error finding field:", error);
    res.status(500).send("Error finding field");
  }
});

app.post("/search-friend", async (req, res) => {
  try {
    const friendName = req.body.friendName;
    if (!friendName) {
      throw new Error("Room code is missing in the request body");
    }
    let foundFriend = await User.findOne({
      where: { nickname: friendName },
    });
    if (foundFriend) {
      res.status(200).send(null);
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

app.post("/user-friends", async (req, res) => {
  try {
    const userId = req.body.userId;
    console.log(req.body);
    console.log(userId);
    if (!userId) {
      throw new Error("User id missing");
    }
    let foundFriends = await User.findOne({
      where: { id: userId},
      attributes: ["friends"],
    });
    if (foundFriends) {
      console.log(foundFriends.friends);
      console.log(foundFriends);
      res.status(200).send(foundFriends);
    } else {
      res.status(404).send(null);
    }
  } catch (error) {
    console.error("Error finding field:", error);
    res.status(500).send("Error finding field");
  }
});

app.get("/get-statistics", async(req, res) => {
  try {
    const userId = req.query.userId;
    console.log("stats userid:", userId)
    const stats = await getUserStatistics(userId);
    if (stats) {
      res.status(200).send(stats);
    } else {
      res.status(404).send(null);
    }

  } catch (error) {
    console.error("Error finding field:", error);
    res.status(500).send("Error finding field");
  }
});

app.get("/get-global-statistics", async(req, res) => {
  try {
    const stats = await getGlobalStatistics();
    if (stats) {
      res.status(200).send(stats);
    } else {
      res.status(404).send(null);
    }
  } catch (error) {
    console.error("Error finding field:", error);
    res.status(500).send("Error finding field");
  }
});

app.post("/add-ban", async (req, res) => {
  try {
    const roomCode = req.body.roomId;
    const player = req.body.player;
    console.log(roomCode, "and player", player);
    if (!roomCode || !player) {
      throw new Error("Room code or player is missing in the request body");
    }
    console.log("Banning player", player);
    const room = await Room.findOne({ where: { room_code: roomCode } });
    if (!room) {
      throw new Error("Room not found");
    }
    let bannedPlayers = room.banned_players || []; // Initialize to empty array if null
    bannedPlayers.push(player); // Add the player to the banned list
    await Room.update(
      { banned_players: bannedPlayers },
      { where: { room_code: roomCode } }
    );
    res.send("Player banned successfully!");
  } catch (error) {
    console.error("Error banning player:", error);
    res.status(500).send("Error banning player");
  }
});

// Catch-all route to serve React app for any other route not handled by API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/build', 'index.html'));
});