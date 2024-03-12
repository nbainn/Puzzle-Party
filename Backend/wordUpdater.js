const { sq, testDbConnection } = require("./sequelize.tsx");
const { Word } = sq.models;
const readline = require("readline");
const fs = require("fs");
testDbConnection();

async function addWord(word, description) {
  try {
    description = description.replace(/\b\w/g, (match) => match.toUpperCase());
    description = description.trim();
    word = word.toUpperCase();
    word = word.trim();
    // Check if the word already exists in the database
    const result = await Word.findOne({ where: { word: word } });

    if (result) {
      // If the word exists and the description is not already present, update the description
      if (!result.descriptions.includes(description)) {
        await result.update({
          descriptions: result.descriptions.concat("," + description),
        });
      }
    } else {
      // If the word doesn't exist, create a new record
      await Word.create({ word: word, descriptions: description });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function addWords() {
  const filePath = "wordsDescriptions.txt";
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // Ignore CR (carriage return) to handle Windows line endings
  });
  rl.on("line", (line) => {
    const [word, description] = line.split(",");
    addWord(word, description);
  });
}

async function removeAllWords() {
  try {
    // Remove all records from the Words table
    const result = await Word.destroy({
      where: {}, // Empty where object means no condition, so it removes all records
      truncate: true, // Reset the auto-increment counter
    });

    console.log(`Deleted ${result} records from the Words table.`);
  } catch (error) {
    console.error("Error:", error);
  }
}

addWords();
//removeAllWords();
