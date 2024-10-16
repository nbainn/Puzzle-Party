import React, { useState, useEffect } from "react";
import "./ClueList.css";
import { styled } from "@mui/material/styles";
function ClueList({
  ablyClient,
  roomId,
  puzzle,
  setCurrentClue,
  acrossCluess,
  downCluess,
  userId,
  setQueuedChange,
  setSelectGrid,
}) {
  const [downClues, setDown] = useState(["No Down Clues!"]);
  const [acrossClues, setAcross] = useState(["No Across Clues!"]);
  const [channel, setChannel] = useState(null);
  const Label = styled("div")({
    position: "absolute",
    top: "-5px",
    left: "-5px",
    backgroundColor: "#7e9eee",
    color: "white",
    padding: "4px",
    borderRadius: "4px",
    zIndex: "9999",
    marginTop: "5px",
    marginLeft: "5px",
  });
  useEffect(() => {
    if (ablyClient) {
      console.log("Ably client provided to ClueList", ablyClient);

      const onConnected = () => {
        console.log(
          "Ably client connected, now subscribing to channel:",
          `room:${roomId}`
        );
        const channel = ablyClient.channels.get(`room:${roomId}`);
        const onClue = (clue) => {
          console.log("Clues received:", clue.across);
          setAcross(clue.data.across);
          setDown(clue.data.down);
        };
        channel.subscribe("clue", onClue);

        return () => {
          channel.unsubscribe("clue", onClue);
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
        console.log("what?");
        const across = puzzle.puzzle.clues.across;

        const acrossC = across.map((item) => ({
          display: `${item.number}. ${item.clue}`,
          number: item.number,
          row: item.row,
          col: item.column,
        }));
        setAcross(acrossC);

        const down = puzzle.puzzle.clues.down;
        const downC = down.map((item) => ({
          display: `${item.number}. ${item.clue}`,
          number: item.number,
          row: item.row,
          col: item.column,
        }));
        setDown(downC);

        const ably = async () => {
          if (ablyClient) {
            const channel = ablyClient.channels.get(`room:${roomId}`);
            try {
              await channel.publish("clue", {
                across: acrossC,
                down: downC,
              });
              console.log("clues sent:" + acrossC + downC);
            } catch (error) {
              console.error("Error sending clues:", error);
            }
          } else {
            console.log("Ably client not initialized.");
          }
        };
        ably();
      
    }
  }, [ablyClient, puzzle, roomId]);
  /*   // Example clues for demonstration
  const acrossClues = [
    '1. A common pet',
    '3. Not day',
    '5. Opposite of buy',
    '7. Skull Emoji',
    '9. Crying Emoji',
    // Add more clues as needed
  ]; */

  /*   const downClues = [
    '2. A place for cooking',
    '4. To perceive sound',
    '6. A type of fruit',
    '8. A cool thingy',
    '10. A not cool thingy',
    // Add more clues as needed
  ]; */

  return (
    <div className="clue-list-container">
      <div className="clue-section">
        <h3 className="clue-header">Across</h3>
        <ul className="clue-list">
          {acrossClues.map((clue, index) => (
            <li
              style={{ cursor: "pointer" }}
              key={index}
              onClick={async () => {
                let currentChange = {
                  user: userId,
                  location: [[clue.row, clue.col]],
                  direction: "across",
                  value: null,
                };
                setSelectGrid(true);
                console.log("set select grid to true");
                setQueuedChange(currentChange);
                //setCurrentClue(acrossCluess[clue.number]);
              }}
            >
              {puzzle ? clue.display : "No Across Clues!"}
            </li>
          ))}
        </ul>
      </div>
      <div className="clue-section">
        <h3 className="clue-header">Down</h3>
        <ul className="clue-list">
          {downClues.map((clue, index) => (
            <li
              style={{ cursor: "pointer" }}
              key={index}
              onClick={() => {
                setCurrentClue(downCluess[clue.number]);
                let currentChange = {
                  user: userId,
                  location: [[clue.row, clue.col]],
                  direction: "down",
                  value: null,
                };
                setSelectGrid(true);
                console.log("set select grid to true");
                setQueuedChange(currentChange);
              }}
            >
              {puzzle ? clue.display : "No Down Clues!"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ClueList;
