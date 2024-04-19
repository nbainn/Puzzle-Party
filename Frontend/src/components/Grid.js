import React, { useState, useEffect } from "react";
import { TextField, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import Cell from "./Cell";
import "./Crossword.css";
import "./Grid.css";

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
  width: "100%", // Dynamic width based on screen size
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
  favColor,
  acrossClues,
  downClues,
  setCurrentClue,
  queuedChange,
  setQueuedChange,
}) => {
  //User always stores the userId of the player who made the change
  //Location[0] stores the primary location of the cursor (needs to be updated if direction stores "continue")
  //Location[>0] stores the secondary locations of the cursor
  //Direction stores the direction of the cursor
  //Direction can also store "switch" to indicate that the user wants to switch directions
  //..or it can store "continue" to indicate that the user wants to continue in the same direction
  //Value stores the value of the cell that was changed, or null if no value was changed
  //LocationV stores the location of the cell that was changed if a value was changed
  let changeLog = [];
  const [currentChange, setCurrentChange] = useState(null);
  // Function to add an entry to the changelog
  const queueChange = async (user, location, direction, value) => {
    // Create a new entry object containing the location and value
    const newEntry = { user, location, direction, value };
    // Update the changelog by appending the new entry
    changeLog.push(newEntry);
    if (currentChange === null) {
      setCurrentChange(changeLog.shift());
    }
  };

  const [lastChange, setLastChange] = useState({
    [userId]: {
      user: userId,
      location: [[0, 0]],
      direction: "across",
      value: "",
    },
  });

  //True when the user is receiving data from the server
  const [receiving, setReceiving] = useState(false);

  //Stores the user's favorite color
  const [favColors, setFavColors] = useState({ [userId]: favColor });

  useEffect(() => {
    setFavColors((prevFavoriteColors) => ({
      ...prevFavoriteColors,
      [userId]: favColor,
    }));
  }, [favColor]);

  //Stores the size of the grid (not rows and columns, but the size of the grid in pixels)
  const [size, setSize] = useState(300);

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
    if (queuedChange) {
      console.log("Queued change:", queuedChange);
      queueChange(
        queuedChange.user,
        queuedChange.location,
        queuedChange.direction,
        queuedChange.value
      );
      setQueuedChange(null);
    }
  }, [queuedChange]);

  useEffect(() => {
    if (ablyClient) {
      console.log("Ably client provided to Grid", ablyClient);

      const onConnected = () => {
        console.log(
          "Ably client connected, now subscribing to channel:",
          `room:${roomId}`
        );
        let thisPuzzle = puzzle;
        const channel = ablyClient.channels.get(`room:${roomId}`);
        const onPuzzle = (puzzle) => {
          console.log("puzzle received:", puzzle);
          setReceiving(true);
          setPuzzle(puzzle.data.puzzle);
        };
        const onGrid = (grid) => {
          if (grid.clientId != userId) {
            console.log("Grid received:", grid);
            setGrid(grid.data.grid);
          }
        };
        const onChange = (change) => {
          if (change.clientId != userId) {
            console.log("Change received:", change);
            setFavColors((prevColors) => ({
              ...prevColors,
              [change.clientId]: change.data.favColor,
            }));
            queueChange(
              change.data.change.user,
              change.data.change.location,
              change.data.change.direction,
              change.data.change.value
            );
          }
        };
        channel.subscribe("puzzle", onPuzzle);
        channel.subscribe("grid", onGrid);
        channel.subscribe("change", onChange);

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
    if (puzzle) {
      for (let i = 0; i < players.length; i++) {
        setLastChange((prevChanges) => ({
          ...prevChanges,
          [players[i]]: {
            user: players[i],
            location: [[0, 0]],
            direction: "across",
            value: "",
          },
        }));
      }
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
      if (!receiving) {
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
      } else {
        setReceiving(false);
      }
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
      if (revealHint) {
        const resetGrid = grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (
              !cell.hidden &&
              rowIndex === lastChange[userId].location[0][0] &&
              colIndex === lastChange[userId].location[0][1]
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
        console.log("CHECKinggggg");
        const resetGrid = grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (
              !cell.hidden &&
              cell.value !== "" &&
              (cell.players_primary.includes(userId) ||
                cell.players_secondary.includes(userId)) &&
              cell.value !== puzzle.puzzle.grid[rowIndex][colIndex]
            ) {
              console.log(
                "GUESSssssssss",
                cell.value,
                puzzle.puzzle.grid[rowIndex][colIndex]
              );
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
            if (typeof userId !== "string") {
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

  let processingChanges = false;
  useEffect(() => {
    if (currentChange == null && changeLog.length > 0) {
      setCurrentChange(changeLog.shift());
    }
    if (currentChange && !processingChanges) {
      console.log("Processing change:", currentChange);
      processingChanges = true;
      let resetGrid;
      resetGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
      for (let i = 0; i < lastChange[currentChange.user].location.length; i++) {
        resetGrid[lastChange[currentChange.user].location[i][0]][
          lastChange[currentChange.user].location[i][1]
        ].players_primary = resetGrid[
          lastChange[currentChange.user].location[i][0]
        ][lastChange[currentChange.user].location[i][1]].players_primary.filter(
          (id) => id !== lastChange[currentChange.user].user
        );
        resetGrid[lastChange[currentChange.user].location[i][0]][
          lastChange[currentChange.user].location[i][1]
        ].players_secondary = resetGrid[
          lastChange[currentChange.user].location[i][0]
        ][
          lastChange[currentChange.user].location[i][1]
        ].players_secondary.filter(
          (id) => id !== lastChange[currentChange.user].user
        );
      }
      //If location has only primary (one argument), then we must fill in the gaps
      if (currentChange.location.length === 1) {
        if (currentChange.direction === "keep") {
          currentChange.direction = lastChange[currentChange.user].direction;
        } else if (currentChange.direction === "switch") {
          currentChange.location[0][0] =
            lastChange[currentChange.user].location[0][0];
          currentChange.location[0][1] =
            lastChange[currentChange.user].location[0][1];
          lastChange[currentChange.user].direction === "across"
            ? (currentChange.direction = "down")
            : (currentChange.direction = "across");
        } else if (currentChange.direction === "continue") {
          //finding the next cell in the direction
          /*resetGrid[lastChange[currentChange.user].location[0][0]][
            lastChange.location[0][1]
          ].value = currentChange.value;*/
          console.log(
            "changed value ",
            currentChange.value,
            " at ",
            currentChange.location[0][0],
            currentChange.location[0][1]
          );
          currentChange.direction = lastChange[currentChange.user].direction;
          currentChange.location[0][0] =
            currentChange.direction === "down" &&
            lastChange[currentChange.user].location[0][0] < numRows - 1 &&
            puzzle.puzzle.grid[
              lastChange[currentChange.user].location[0][0] + 1
            ][lastChange[currentChange.user].location[0][1]] != " "
              ? lastChange[currentChange.user].location[0][0] + 1
              : lastChange[currentChange.user].location[0][0];
          currentChange.location[0][1] =
            currentChange.direction === "across" &&
            lastChange[currentChange.user].location[0][1] < numCols - 1 &&
            puzzle.puzzle.grid[lastChange[currentChange.user].location[0][0]][
              lastChange[currentChange.user].location[0][1] + 1
            ] != " "
              ? lastChange[currentChange.user].location[0][1] + 1
              : lastChange[currentChange.user].location[0][1];
        } else if (currentChange.direction === "backtrack") {
          //finding the previous cell in the direction
          currentChange.direction = lastChange[currentChange.user].direction;
          currentChange.location[0][0] =
            currentChange.direction === "down" &&
            lastChange[currentChange.user].location[0][0] > 0 &&
            puzzle.puzzle.grid[
              lastChange[currentChange.user].location[0][0] - 1
            ][lastChange[currentChange.user].location[0][1]] != " "
              ? lastChange[currentChange.user].location[0][0] - 1
              : lastChange[currentChange.user].location[0][0];
          currentChange.location[0][1] =
            currentChange.direction === "across" &&
            lastChange[currentChange.user].location[0][1] > 0 &&
            puzzle.puzzle.grid[lastChange[currentChange.user].location[0][0]][
              lastChange[currentChange.user].location[0][1] - 1
            ] != " "
              ? lastChange[currentChange.user].location[0][1] - 1
              : lastChange[currentChange.user].location[0][1];
        } else if (currentChange.direction === "rightt") {
          currentChange.direction = lastChange[currentChange.user].direction;
          currentChange.location[0][0] =
            lastChange[currentChange.user].location[0][0];
          currentChange.location[0][1] =
            lastChange[currentChange.user].location[0][1] < numCols - 1 &&
            puzzle.puzzle.grid[lastChange[currentChange.user].location[0][0]][
              lastChange[currentChange.user].location[0][1] + 1
            ] != " "
              ? lastChange[currentChange.user].location[0][1] + 1
              : lastChange[currentChange.user].location[0][1];
        } else if (currentChange.direction === "leftt") {
          currentChange.direction = lastChange[currentChange.user].direction;
          currentChange.location[0][0] =
            lastChange[currentChange.user].location[0][0];
          currentChange.location[0][1] =
            lastChange[currentChange.user].location[0][1] > 0 &&
            puzzle.puzzle.grid[lastChange[currentChange.user].location[0][0]][
              lastChange[currentChange.user].location[0][1] - 1
            ] != " "
              ? lastChange[currentChange.user].location[0][1] - 1
              : lastChange[currentChange.user].location[0][1];
        } else if (currentChange.direction === "upp") {
          currentChange.direction = lastChange[currentChange.user].direction;
          currentChange.location[0][1] =
            lastChange[currentChange.user].location[0][1];
          currentChange.location[0][0] =
            lastChange[currentChange.user].location[0][0] > 0 &&
            puzzle.puzzle.grid[
              lastChange[currentChange.user].location[0][0] - 1
            ][lastChange[currentChange.user].location[0][1]] != " "
              ? lastChange[currentChange.user].location[0][0] - 1
              : lastChange[currentChange.user].location[0][0];
        } else if (currentChange.direction === "downn") {
          currentChange.direction = lastChange[currentChange.user].direction;
          currentChange.location[0][1] =
            lastChange[currentChange.user].location[0][1];
          currentChange.location[0][0] =
            lastChange[currentChange.user].location[0][0] < numRows - 1 &&
            puzzle.puzzle.grid[
              lastChange[currentChange.user].location[0][0] + 1
            ][lastChange[currentChange.user].location[0][1]] != " "
              ? lastChange[currentChange.user].location[0][0] + 1
              : lastChange[currentChange.user].location[0][0];
        }

        let rowIndex = currentChange.location[0][0];
        let colIndex = currentChange.location[0][1];

        if (
          (rowIndex === 0 ||
            (rowIndex > 0 &&
              puzzle.puzzle.grid[rowIndex - 1][colIndex] === " ")) &&
          (rowIndex === numRows - 1 ||
            (rowIndex < numRows - 1 &&
              puzzle.puzzle.grid[rowIndex + 1][colIndex] === " "))
        ) {
          currentChange.direction = "across";
        } else if (
          (colIndex === 0 ||
            (colIndex > 0 &&
              puzzle.puzzle.grid[rowIndex][colIndex - 1] === " ")) &&
          (colIndex === numCols - 1 ||
            (colIndex < numCols - 1 &&
              puzzle.puzzle.grid[rowIndex][colIndex + 1] === " "))
        ) {
          currentChange.direction = "down";
        }

        if (currentChange.direction === "across") {
          let i = colIndex;
          while (i > 0 && puzzle.puzzle.grid[rowIndex][i - 1] !== " ") {
            i--;
          }
          while (i < numCols && puzzle.puzzle.grid[rowIndex][i] !== " ") {
            if (i === currentChange.location[0][1]) {
              resetGrid[rowIndex][i].players_primary.push(currentChange.user);
              resetGrid[rowIndex][i].flagged = false;
            } else if (!resetGrid[rowIndex][i].flagged) {
              resetGrid[rowIndex][i].players_secondary.push(currentChange.user);
              currentChange.location.push([rowIndex, i]);
            }
            i++;
          }
        } else if (currentChange.direction === "down") {
          let i = rowIndex;
          while (i > 0 && puzzle.puzzle.grid[i - 1][colIndex] !== " ") {
            i--;
          }
          while (i < numRows && puzzle.puzzle.grid[i][colIndex] !== " ") {
            if (i === currentChange.location[0][0]) {
              resetGrid[i][colIndex].players_primary.push(currentChange.user);
              resetGrid[i][colIndex].flagged = false;
            } else if (!resetGrid[i][colIndex].flagged) {
              resetGrid[i][colIndex].players_secondary.push(currentChange.user);
              currentChange.location.push([i, colIndex]);
            }
            i++;
          }
        }
        //If direction is not given, then we assume that another player has calculated what cells are highlighted
      } else {
        resetGrid[currentChange.location[0][0]][
          currentChange.location[0][1]
        ].players_primary.push(currentChange.user);
        for (let k = 1; k < currentChange.location.length; k++) {
          let i = currentChange.location[k][0];
          let j = currentChange.location[k][1];
          resetGrid[i][j].players_secondary.push(currentChange.user);
        }
      }
      if (currentChange.value != null) {
        resetGrid[lastChange[currentChange.user].location[0][0]][
          lastChange[currentChange.user].location[0][1]
        ].value = currentChange.value;
      }
      setCurrentClue(() => {
        if (currentChange.direction === "across") {
          let clueNumber =
            puzzle.puzzle.clueGrids.across[currentChange.location[0][0]][
              currentChange.location[0][1]
            ];
          return acrossClues[clueNumber];
        } else if (currentChange.direction === "down") {
          let clueNumber =
            puzzle.puzzle.clueGrids.down[currentChange.location[0][0]][
              currentChange.location[0][1]
            ];
          return downClues[clueNumber];
        }
      });
      setLastChange((prev) => ({
        ...prev,
        [currentChange.user]: currentChange,
      }));
      if (currentChange.user === userId) {
        const ably = async () => {
          if (ablyClient) {
            const channel = ablyClient.channels.get(`room:${roomId}`);
            try {
              await channel.publish("change", {
                change: currentChange,
                favColor: favColor,
              });
            } catch (error) {
              console.error("Error sending change:", currentChange);
            }
          } else {
            console.log("Ably client not initialized.");
          }
        };
        ably();
      }
      setGrid(resetGrid);
      processingChanges = false;
      setCurrentChange(null);
      //setChangeLog((prevChangelog) => prevChangelog.slice(1));
    }
  }, [currentChange]);

  //useEffect(() => {
  const handleKeyPress = async (event, rowIndex, colIndex) => {
    if (event.keyCode === 32) {
      // Spacebar key
      console.log("SPACEBAR PRESSED");
      //setCurrentDirection(currentDirection === "across" ? "down" : "across");
      //setLocation([rowIndex, colIndex]);
      queueChange(userId, [[rowIndex, colIndex]], "switch", null);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      event.preventDefault();
    } else if (/^[a-zA-Z]$/.test(event.key)) {
      /*const updatedGrid = grid.map((row, i) =>
        i === rowIndex
          ? row.map((cell, j) =>
              j === colIndex
                ? { ...cell, value: event.key.toUpperCase(), flagged: false }
                : cell
            )
          : row
      );*/
      let tempValue = event.key.toUpperCase();
      event.preventDefault();
      /*rowIndex =
        lastChange.direction === "down" &&
        rowIndex < numRows - 1 &&
        puzzle.puzzle.grid[rowIndex + 1][colIndex] != " "
          ? rowIndex + 1
          : rowIndex;
      colIndex =
        lastChange.direction === "across" &&
        colIndex < numCols - 1 &&
        puzzle.puzzle.grid[rowIndex][colIndex + 1] != " "
          ? colIndex + 1
          : colIndex;
      setLocation([rowIndex, colIndex]);*/
      //location[0] = rowIndex;
      //location[1] = colIndex;
      //document.getElementById(`cell-${rowIndex}-${colIndex}`).focus();
      //updatedGrid[rowIndex][colIndex].flagged = false;
      //setGrid(updatedGrid);
      //setHeavyRefresh(updatedGrid);
      queueChange(userId, [[rowIndex, colIndex]], "continue", tempValue);
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
      /*rowIndex =
        rowIndex > 0 && puzzle.puzzle.grid[rowIndex - 1][colIndex] != " "
          ? rowIndex - 1
          : rowIndex;
      setLocation([rowIndex, colIndex]);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      document.getElementById(`cell-${rowIndex}-${colIndex}`).focus();
      setRefresh(1);*/
      queueChange(userId, [[rowIndex, colIndex]], "upp", null);
    } else if (event.keyCode === 40) {
      // Arrow Down pressed
      /*rowIndex =
        rowIndex < numRows - 1 &&
        puzzle.puzzle.grid[rowIndex + 1][colIndex] != " "
          ? rowIndex + 1
          : rowIndex;
      setLocation([rowIndex, colIndex]);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      document.getElementById(`cell-${rowIndex}-${colIndex}`).focus();
      setRefresh(1);*/
      queueChange(userId, [[rowIndex, colIndex]], "downn", null);
    } else if (event.keyCode === 37) {
      // Arrow Left pressed
      /*colIndex =
        colIndex > 0 && puzzle.puzzle.grid[rowIndex][colIndex - 1] != " "
          ? colIndex - 1
          : colIndex;
      setLocation([rowIndex, colIndex]);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      document.getElementById(`cell-${rowIndex}-${colIndex}`).focus();
      setRefresh(1);*/
      queueChange(userId, [[rowIndex, colIndex]], "leftt", null);
    } else if (event.keyCode === 39) {
      // Arrow Right pressed
      /*colIndex =
        colIndex < numCols - 1 &&
        puzzle.puzzle.grid[rowIndex][colIndex + 1] != " "
          ? colIndex + 1
          : colIndex;*/
      //setLocation([rowIndex, colIndex]);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      //document.getElementById(`cell-${rowIndex}-${colIndex}`).focus();
      //setRefresh(1);
      queueChange(userId, [[rowIndex, colIndex]], "rightt", null);
    } else if (event.keyCode !== 8 && event.keyCode !== 46) {
      event.preventDefault();
    } else {
      //backsapce or delete key
      /*const updatedGrid = grid.map((row, i) =>
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
          : colIndex;*/
      queueChange(userId, [[rowIndex, colIndex]], "backtrack", "");
      //setLocation([rowIndex, colIndex]);
      //location[0] = rowIndex;
      //location[1] = colIndex;
      //setHeavyRefresh(updatedGrid);
      event.preventDefault();
    }
  };

  //window.addEventListener("keydown", handleKeyPress);

  //return () => {
  //window.removeEventListener("keydown", handleKeyPress);
  //};
  //}, [currentDirection]);
  const handleCellClick = (rowIndex, colIndex) => {
    if (
      lastChange[userId].location[0][0] === rowIndex &&
      lastChange[userId].location[0][1] === colIndex
    ) {
      //setCurrentDirection(currentDirection === "across" ? "down" : "across");
      //setRefresh(1);
      queueChange(userId, [[rowIndex, colIndex]], "switch", null);
    } else {
      //location[0] = rowIndex;
      //location[1] = colIndex;
      //setRefresh(1);
      queueChange(userId, [[rowIndex, colIndex]], "keep", null);
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
              favColor={favColor}
              numRows={numRows}
            />
          ))
        )}
      </GridContainer>
    </div>
  );
};

export default Grid;
