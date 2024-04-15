import React, { useState, useEffect } from "react";
import { TextField, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import Cell from "./Cell";
import "./Crossword.css";

// Styling for the grid container using Material UI
// Uses CSS grid layout to organize cells, with flexibility to accommodate different grid sizes
const GridContainer = styled(Box)(({ size, gridSize }) => ({
  display: "grid",
  gridTemplateRows: `repeat(${gridSize}, 1fr)`,
  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
  gap: "-4px", // Uniform gap between cells for visual clarity
  padding: "10px",
  maxWidth: "100%",
  margin: "auto",
  width: `${size}px`, // Dynamic width based on screen size
}));

const Grid = ({
  userId,
  players,
  ablyClient,
  roomId,
  puzzle,
  setPuzzle,
  hints,
  guesses,
  revealGrid,
  setRevealGrid,
  revealHint,
  setRevealHint,
  checkWord,
  setCheckWord,
  checkGrid,
  setCheckGrid,
}) => {
  let prep_grid;
  //Current direction is accross or down
  const [currentDirection, setCurrentDirection] = useState("across");

  //Stores the user's favorite color
  let tempFavColors = [];
  for (let i = 0; i < players.length; i++) {
    tempFavColors[players[i]] = "green";
  }
  const [favColors, setFavColors] = useState(tempFavColors);

  //Stores the size of the grid (not rows and columns, but the size of the grid in pixels)
  const [size, setSize] = useState(300);

  //Represents the location of the cell that is currently selected in (rows, columns) format
  const [location, setLocation] = useState([0, 0]);

  //Used to refresh the grid
  const [refresh, setRefresh] = useState(null);
  const [heavyRefresh, setHeavyRefresh] = useState(null);

  //Ably channel
  const [channel, setChannel] = useState(null);

  //Stores the number of letters in the puzzle, used to determine when the puzzle is completed
  const [numLetters, setNumLetters] = useState(0);

  //Stores the number of rows and columns in the grid
  let numRows = 10;
  let numCols = 10;
  if (puzzle) {
    numRows = puzzle.puzzle.size.rows;
    numCols = puzzle.puzzle.size.columns;
  }

  //Grid that hold all of the cells and their properties
  //These cells will individually be passed as props to the cell components so they can be rendered
  const [grid, setGrid] = useState(
    Array(numRows).fill(
      Array(numCols).fill({
        value: "",
        hidden: true,
        number: 0,
        flagged: false,
        players_primary: [],
        players_secondary: [],
      })
    )
  );

  useEffect(() => {
    if (ablyClient) {
      console.log("Ably client provided to Grid", ablyClient);

      const onConnected = () => {
        console.log(
          "Ably client connected, now subscribing to channel:",
          `room:${roomId}`
        );
        const channel = ablyClient.channels.get(`room:${roomId}`);
        const onGrid = (grid) => {
          console.log("Grid received:", grid);
          setGrid(grid.data.grid);
        };
        channel.subscribe("grid", onGrid);
        const onPuzzle = (puzzle) => {
          console.log("puzzle received:", puzzle);
          setPuzzle(grid.data.puzzle);
        };
        channel.subscribe("puzzle", onPuzzle);

        return () => {
          channel.unsubscribe("grid", onGrid);
          channel.unsubscribe("puzzle", onPuzzle);
          ablyClient.connection.off("connected", onConnected);
        };
      };

      if (ablyClient.connection.state === "connected") {
        onConnected();
      } else {
        ablyClient.connection.once("connected", onConnected);
      }
    }
  }, [ablyClient, roomId]);

  useEffect(() => {
    setChannel(ablyClient.channels.get(`room:${roomId}`));
  }, [ablyClient, roomId]);

  useEffect(() => {
    if (puzzle) {
      let tempGrid = [];
      numRows = puzzle.puzzle.size.rows;
      numCols = puzzle.puzzle.size.columns;
      for (let i = 0; i < numRows; i++) {
        tempGrid.push(new Array(numCols).fill(null));
      }
      let letters = 0;
      for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
          //console.log(puzzle.puzzle.grid[i][j]);
          if (puzzle.puzzle.grid[i][j] === " ") {
            tempGrid[i][j] = {
              value: "",
              hidden: true,
              number: 0,
              flagged: false,
              players_primary: [],
              players_secondary: [],
            };
          } else {
            tempGrid[i][j] = {
              value: "",
              hidden: false,
              number: 0,
              flagged: false,
              players_primary: [],
              players_secondary: [],
            };
            letters += 1;
          }
        }
      }
      setNumLetters(letters);

      for (let i = 0; i < puzzle.puzzle.clues.across.length; i++) {
        let row = puzzle.puzzle.clues.across[i].row;
        let col = puzzle.puzzle.clues.across[i].column;
        let number = puzzle.puzzle.clues.across[i].number;
        tempGrid[row][col].number = number;
      }

      for (let i = 0; i < puzzle.puzzle.clues.down.length; i++) {
        let row = puzzle.puzzle.clues.down[i].row;
        let col = puzzle.puzzle.clues.down[i].column;
        let number = puzzle.puzzle.clues.down[i].number;
        tempGrid[row][col].number = number;
      }

      setGrid(tempGrid);
      let tempPuzzle = puzzle;
      console.log("Grid set to:", tempGrid);
      const ably = async () => {
        if (ablyClient) {
          const channel = ablyClient.channels.get(`room:${roomId}`);
          try {
            await channel.publish("puzzle", {
              puzzle: tempPuzzle,
            });
            console.log("puzzle sent:", tempPuzzle);
          } catch (error) {
            console.error("Error sending grid:", error);
          }
        } else {
          console.log("Ably client not initialized.");
        }
      };
      ably();
    }
  }, [puzzle]);

  useEffect(() => {
    if (revealGrid) {
      let tempGrid = [];
      numRows = puzzle.puzzle.size.rows;
      numCols = puzzle.puzzle.size.columns;
      for (let i = 0; i < numRows; i++) {
        tempGrid.push(new Array(numCols).fill(null));
      }
      for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
          //console.log(puzzle.puzzle.grid[i][j]);
          if (puzzle.puzzle.grid[i][j] === " ") {
            tempGrid[i][j] = {
              value: "",
              hidden: true,
              number: grid[i][j].number,
              flagged: false,
              players_primary: [],
              players_secondary: [],
            };
          } else {
            tempGrid[i][j] = {
              value: puzzle.puzzle.grid[i][j],
              hidden: false,
              number: grid[i][j].number,
              flagged: false,
              players_primary: [],
              players_secondary: [],
            };
          }
        }
      }
      setGrid(tempGrid);
      console.log("GRID REVEALED", tempGrid);
    }
    setRevealGrid(false);
  }, [revealGrid]);

  useEffect(() => {
    if (hints) {
      console.log(location);
      if (revealHint) {
        const resetGrid = grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (
              !cell.hidden &&
              rowIndex === location[0] &&
              colIndex === location[1]
            ) {
              console.log("HINT", puzzle.puzzle.grid[rowIndex][colIndex]);
              return {
                ...cell,
                value: puzzle.puzzle.grid[rowIndex][colIndex],
                //color: "#86fe9e",
              };
            } else {
              return { ...cell };
            }
          })
        );
        setGrid(resetGrid);
      }
    }
    setRevealHint(false);
  }, [revealHint]);

  useEffect(() => {
    if (guesses) {
      if (checkWord) {
        const resetGrid = grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (
              !cell.hidden &&
              cell.value !== "" &&
              (cell.players_primary[userId] ||
                cell.players_secondary[userId]) &&
              cell.value !== puzzle.puzzle.grid[rowIndex][colIndex]
            ) {
              return { ...cell, /*color: "#ffda4d"*/ flagged: true };
            } else {
              return { ...cell };
            }
          })
        );
        setGrid(resetGrid);
      } else {
        console.log("WHATTTTT?");
      }
    } else {
      console.log("Guesses is not enabled!");
    }
    setCheckWord(false);
  }, [checkWord]);

  useEffect(() => {
    async function fetchData() {
      let numCorrect = 0;
      if (guesses) {
        if (checkGrid) {
          const resetGrid = grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              if (
                !cell.hidden &&
                cell.value !== "" &&
                cell.value !== puzzle.puzzle.grid[rowIndex][colIndex]
              ) {
                return { ...cell, /*color: "#ffda4d"*/ flagged: true };
              } else {
                if (
                  !cell.hidden &&
                  cell.value === puzzle.puzzle.grid[rowIndex][colIndex]
                ) {
                  numCorrect += 1;
                }
                return { ...cell };
              }
            })
          );
          console.log(numCorrect, numLetters);
          if (numCorrect === numLetters) {
            alert("Congratulations! You have completed the puzzle!");
            try {
              const response = await axios.post("/addWin", {
                userId: userId,
              });
              if (response.status === 200) {
                console.log("win stat added!");
              } else if (response.status === 404) {
                console.log("Error", response.data);
              } else {
                console.error("Unexpected response status:", response.status);
              }
            } catch (error) {
              console.error("Error contacting server", error);
              console.log("error");
            }
          }
          setGrid(resetGrid);
        } else {
          console.log("WHATTTTT?");
        }
      } else {
        console.log("Guesses is not enabled!");
      }
      setCheckGrid(false);
    }

    fetchData();
  }, [checkGrid]);

  /*resetGrid[rowIndex][i].players_primary.some((id) => id === userId) ||
    resetGrid[rowIndex][i].players_primary.push(userId);*/

  useEffect(() => {
    if (puzzle && (refresh || heavyRefresh)) {
      let rowIndex = location[0];
      let colIndex = location[1];
      let resetGrid;
      if (heavyRefresh) {
        resetGrid = heavyRefresh.map((row) =>
          row.map((cell) => ({
            ...cell,
            players_primary: [],
            players_secondary: [],
          }))
        );
      } else {
        resetGrid = grid.map((row) =>
          row.map((cell) => ({
            ...cell,
            players_primary: [],
            players_secondary: [],
          }))
        );
      }

      if (currentDirection === "across") {
        let i = colIndex;
        console.log("ACROSSSSSS");
        while (i > 0 && puzzle.puzzle.grid[rowIndex][i - 1] !== " ") {
          i--;
        }
        while (i < numCols && puzzle.puzzle.grid[rowIndex][i] !== " ") {
          console.log("HIGHLIGHTEDDDDDDDDDD");
          if (i === colIndex) {
            resetGrid[rowIndex][i].players_primary.push(userId);
            resetGrid[rowIndex][i].flagged = false;
          } else if (!resetGrid[rowIndex][i].flagged) {
            resetGrid[rowIndex][i].players_secondary.push(userId);
          }
          i++;
        }
      } else if (currentDirection === "down") {
        let i = rowIndex;
        while (i > 0 && puzzle.puzzle.grid[i - 1][colIndex] !== " ") {
          i--;
        }
        console.log("DOWNNNNNNN");
        console.log(rowIndex);
        console.log(grid[i][colIndex].value);
        while (i < numRows && puzzle.puzzle.grid[i][colIndex] !== " ") {
          console.log("HIGHLIGHTEDDDDDDDDDD");
          if (i === rowIndex) {
            resetGrid[i][colIndex].players_primary.push(userId);
            resetGrid[i][colIndex].flagged = false;
          } else if (!resetGrid[i][colIndex].flagged) {
            resetGrid[i][colIndex].players_secondary.push(userId);
          }
          i++;
        }
      }
      const ably = async () => {
        if (ablyClient) {
          const channel = ablyClient.channels.get(`room:${roomId}`);
          try {
            await channel.publish("grid", {
              grid: resetGrid,
            });
          } catch (error) {
            console.error("Error sending grid:", error);
          }
        } else {
          console.log("Ably client not initialized.");
        }
      };
      ably();
      setRefresh(null);
      setHeavyRefresh(null);
    }
  }, [refresh, heavyRefresh]);

  //useEffect(() => {
  const handleKeyPress = async (event, rowIndex, colIndex) => {
    if (event.keyCode === 32) {
      // Spacebar key
      console.log("SPACEBAR PRESSED");
      setCurrentDirection(currentDirection === "across" ? "down" : "across");
      setLocation([rowIndex, colIndex]);
      setRefresh(1);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      event.preventDefault();
    } else if (/^[a-zA-Z]$/.test(event.key)) {
      const updatedGrid = grid.map((row, i) =>
        i === rowIndex
          ? row.map((cell, j) =>
              j === colIndex
                ? { ...cell, value: event.key.toUpperCase(), flagged: false }
                : cell
            )
          : row
      );
      event.preventDefault();
      rowIndex =
        currentDirection === "down" &&
        rowIndex < numRows - 1 &&
        puzzle.puzzle.grid[rowIndex + 1][colIndex] != " "
          ? rowIndex + 1
          : rowIndex;
      colIndex =
        currentDirection === "across" &&
        colIndex < numCols - 1 &&
        puzzle.puzzle.grid[rowIndex][colIndex + 1] != " "
          ? colIndex + 1
          : colIndex;
      setLocation([rowIndex, colIndex]);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      document.getElementById(`cell-${rowIndex}-${colIndex}`).focus();
      updatedGrid[rowIndex][colIndex].flagged = false;
      //setGrid(updatedGrid);
      setHeavyRefresh(updatedGrid);
      console.log("UPDATED GRID");
      /*if (ablyClient) {
        const channel = ablyClient.channels.get(`room:${roomId}`);
        try {
          await channel.publish("grid", {
            grid: updatedGrid,
          });
          console.log("Grid sent:", updatedGrid);
        } catch (error) {
          console.error("Error sending grid:", error);
        }
      } else {
        console.log("Ably client not initialized.");
      }*/
    } else if (event.keyCode === 38) {
      // Arrow Up pressed
      rowIndex =
        rowIndex > 0 && puzzle.puzzle.grid[rowIndex - 1][colIndex] != " "
          ? rowIndex - 1
          : rowIndex;
      setLocation([rowIndex, colIndex]);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      document.getElementById(`cell-${rowIndex}-${colIndex}`).focus();
      setRefresh(1);
    } else if (event.keyCode === 40) {
      // Arrow Down pressed
      rowIndex =
        rowIndex < numRows - 1 &&
        puzzle.puzzle.grid[rowIndex + 1][colIndex] != " "
          ? rowIndex + 1
          : rowIndex;
      setLocation([rowIndex, colIndex]);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      document.getElementById(`cell-${rowIndex}-${colIndex}`).focus();
      setRefresh(1);
    } else if (event.keyCode === 37) {
      // Arrow Left pressed
      colIndex =
        colIndex > 0 && puzzle.puzzle.grid[rowIndex][colIndex - 1] != " "
          ? colIndex - 1
          : colIndex;
      setLocation([rowIndex, colIndex]);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      document.getElementById(`cell-${rowIndex}-${colIndex}`).focus();
      setRefresh(1);
    } else if (event.keyCode === 39) {
      // Arrow Right pressed
      colIndex =
        colIndex < numCols - 1 &&
        puzzle.puzzle.grid[rowIndex][colIndex + 1] != " "
          ? colIndex + 1
          : colIndex;
      setLocation([rowIndex, colIndex]);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      document.getElementById(`cell-${rowIndex}-${colIndex}`).focus();
      setRefresh(1);
    } else if (event.keyCode !== 8 && event.keyCode !== 46) {
      event.preventDefault();
    } else {
      //backsapce or delete key
      const updatedGrid = grid.map((row, i) =>
        i === rowIndex
          ? row.map((cell, j) =>
              j === colIndex ? { ...cell, value: "" } : cell
            )
          : row
      );
      rowIndex =
        currentDirection === "down" &&
        rowIndex > 0 &&
        puzzle.puzzle.grid[rowIndex - 1][colIndex] != " "
          ? rowIndex - 1
          : rowIndex;
      colIndex =
        currentDirection === "across" &&
        colIndex > 0 &&
        puzzle.puzzle.grid[rowIndex][colIndex - 1] != " "
          ? colIndex - 1
          : colIndex;
      setLocation([rowIndex, colIndex]);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      document.getElementById(`cell-${rowIndex}-${colIndex}`).focus();
      setHeavyRefresh(updatedGrid);
      event.preventDefault();
    }
  };

  //window.addEventListener("keydown", handleKeyPress);

  //return () => {
  //window.removeEventListener("keydown", handleKeyPress);
  //};
  //}, [currentDirection]);
  const handleCellClick = (rowIndex, colIndex) => {
    if (location[0] === rowIndex && location[1] === colIndex) {
      setCurrentDirection(currentDirection === "across" ? "down" : "across");
      setRefresh(1);
    } else {
      setLocation([rowIndex, colIndex]);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      setRefresh(1);
    }
  };

  // Dynamically updates grid size based on window dimensions
  // Ensures grid is responsive and fits within the view
  const updateGridSize = () => {
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 150;
    const maxGridSize = Math.min(maxWidth, maxHeight);
    setSize(maxGridSize);
  };
  // Effect hook for responsive grid sizing
  useEffect(() => {
    window.addEventListener("resize", updateGridSize);
    updateGridSize();
    return () => {
      window.removeEventListener("resize", updateGridSize);
    };
  }, []);

  return (
    <div className="crossword-grid">
      <GridContainer size={size} gridSize={numRows}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              cell={cell}
              userId={userId}
              rowIndex={rowIndex}
              colIndex={colIndex}
              handleKeyPress={handleKeyPress}
              handleCellClick={handleCellClick}
              favColors={favColors}
            />
          ))
        )}
      </GridContainer>
    </div>
  );
};

export default Grid;
