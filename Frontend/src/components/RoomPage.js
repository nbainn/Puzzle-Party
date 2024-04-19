import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ChatBox from "./ChatBox";
import ClueList from "./ClueList";
import PlayerList from "./PlayerList";
import ExitRoom from "./ExitRoom";
import RoomStatus from "./RoomStatus";
import SuggestionBox from "./SuggestionBox";
import GeneratePuzzleForm from "./GeneratePuzzleForm";
import Cheating from "./Cheating";
import CrosswordGrid from "./Crossword";
import Grid from "./Grid";
import LoadingScreen from "./LoadingScreen";
import RoomSettings from "./RoomSettings";
import ProfileDropdown from "./ProfileDropdown";
import CurrentCLueBox from "./CurrentClueBox";
import Invite from "./Invite";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import { Button, ButtonGroup } from "@mui/material";
import "./RoomPage.css";
import { useNavigate } from "react-router-dom";
import catSleep from "../assets/PartyCatSleep.gif";
import { MuiColorInput } from "mui-color-input";
import TimeMe from "timeme.js";

const theme = createTheme({
  typography: {
    fontFamily: "C&C Red Alert [INET]",
  },
});
TimeMe.initialize({
  currentPageName: "room", // current page
  idleTimeoutInSeconds: 30, // seconds
});

const StyledButton = styled(Button)({
  //background color of button
  backgroundColor: "#ffcaca",
  border: "1px solid #ca8f8f",
  color: "black",
  //size of button
  width: "50px",
  fontSize: "10px",
  fontFamily: "inherit",
  lineHeight: 0,
  minWidth: "50px",
  marginLeft: 10,
});

function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const {
    ablyClient,
    userId,
    userColor,
    userToken,
    nickname,
    isGuest,
    setNickname,
    setUserColor,
  } = useAuth();
  const [ablyReady, setAblyReady] = useState(false);
  const [puzzle, setPuzzle] = useState(null);
  const [players, setPlayers] = useState([]);
  const [realPlayers, setRealPlayers] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(true);
  const [hints, setHints] = useState(true);
  const [guesses, setGuesses] = useState(true);
  const [revealGrid, setRevealGrid] = useState(false);
  const [revealHint, setRevealHint] = useState(false);
  const [checkWord, setCheckWord] = useState(false);
  const [checkGrid, setCheckGrid] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [favColor, setColor] = useState(userColor || "#e08794");
  const [isKicked, setIsKicked] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0); // Initial time left in seconds
  const [time, setTime] = useState("00:00");
  const [currentClue, setCurrentClue] = useState("");
  const [acrossClues, setAcrossClues] = useState(null);
  const [downClues, setDownClues] = useState(null);
  const [queuedChange, setQueuedChange] = useState(null);

  useEffect(() => {
    if (puzzle) {
      let acrossCluess = {};
      let downCluess = {};
      for (let i = 0; i < puzzle.puzzle.clues.across.length; i++) {
        acrossCluess[puzzle.puzzle.clues.across[i].number] =
          puzzle.puzzle.clues.across[i].number +
          " ACROSS: " +
          puzzle.puzzle.clues.across[i].clue;
      }
      for (let i = 0; i < puzzle.puzzle.clues.down.length; i++) {
        downCluess[puzzle.puzzle.clues.down[i].number] =
          puzzle.puzzle.clues.down[i].number +
          " DOWN: " +
          puzzle.puzzle.clues.down[i].clue;
        console.log(
          "DOWN CLUE:" + downCluess[puzzle.puzzle.clues.down[i].number]
        );
      }
      console.log(
        "clue grids",
        puzzle.puzzle.clueGrids.across + "\n" + puzzle.puzzle.clueGrids.down
      );
      setAcrossClues(acrossCluess);
      setDownClues(downCluess);
    }
  }, [puzzle]);
  //const [playerList, setPlayerList] = useState([]);

  // Fetch user data whenever the RoomPage component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/user/profile", {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (response.data) {
          setNickname(response.data.nickname);
          setUserColor(response.data.userColor);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userToken, setNickname, setUserColor]);

  // Effect to update favColor whenever userColor changes
  useEffect(() => {
    setColor(userColor);
  }, [userColor]);

  const handleColor = (newValue) => {
    setColor(newValue);
  };

  useEffect(() => {
    if (ablyClient) {
      // Log the current connection state
      console.log(
        "Current Ably connection state:",
        ablyClient.connection.state
      );

      // Set up a listener for when the connection state changes
      const onConnectionStateChange = (stateChange) => {
        console.log("Ably connection state has changed:", stateChange.current);

        // If Ably is connected, update state accordingly
        if (stateChange.current === "connected") {
          console.log("Ably is now connected.");
          setAblyReady(true);
        } else {
          console.log(
            "Ably is not connected. Current state:",
            stateChange.current
          );
          setAblyReady(false);
        }
      };

      ablyClient.connection.on("connectionstate", onConnectionStateChange);

      // Immediately invoke the callback if already connected
      if (ablyClient.connection.state === "connected") {
        setAblyReady(true);
      }

      // Clean up listener when the component is unmounted
      return () =>
        ablyClient.connection.off("connectionstate", onConnectionStateChange);
    }
  }, [ablyClient]);

  useEffect(() => {
    const fetchNicknames = async () => {
      const realPlayersList = await Promise.all(
        players.map(async (player) => {
          const integerValue = parseInt(player);
          if (!isNaN(integerValue)) {
            try {
              const response = await axios.post("/fetch-nickname", {
                userId: player,
              });
              if (response.status === 200) {
                console.log("Nickname for user", player, "is", response.data);
                return response.data;
              }
            } catch (error) {
              console.error("Error fetching nickname for user:", error);
            }
          }
          return player;
        })
      );
      setRealPlayers(realPlayersList);
    };

    fetchNicknames();
  }, [players]);

  useEffect(() => {
    if (timer) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft + 1);

        let min = Math.floor(timeLeft / 60);
        let sec = timeLeft % 60;

        var minStr = min.toString();
        if (min < 10) {
          minStr = "0" + min.toString();
        }
        var secStr = sec.toString();
        if (sec < 10) {
          secStr = "0" + sec.toString();
        }

        setTime(`${minStr}:${secStr}`);
      }, 1000);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [timer, timeLeft]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (ablyClient) {
        const channel = ablyClient.channels.get(`room:${roomId}`);
        try {
          await channel.presence.subscribe("enter", (member) => {
            //console.log(member.clientId);
            //alert('Member ' + member.clientId + ' entered ' + nickname);
            //console.log(member.clientId, "entered the room");
            //console.log("USER ID: ", userId);
            if (!players.includes(member.clientId)) {
              setIsActive(true);
              setPlayers((prevPlayers) => [...prevPlayers, member.clientId]);
            }
            //if query database for clientID if it is an integer and fetch its nickname, otherwise just print clinetID (cuz it is guest)
          });

          // Subscribe to presence events for members leaving the room
          await channel.presence.subscribe("leave", (member) => {
            //console.log(member.clientId, "left the room");
            //if (players.includes(member.clientId)) {
            setIsActive(false);
            setPlayers((prevPlayers) =>
              prevPlayers.filter((player) => player !== member.clientId)
            );
            //}
          });
          //console.log("before", players);
          await channel.presence.enter();
          const members = await channel.presence.get();
          let existingMembers = members.map((member) => member.clientId);
          existingMembers = Array.from(new Set(existingMembers));
          // Update player list with existing members
          setPlayers(existingMembers);
          //console.log("after", players);
        } catch (error) {
          console.error("Error getting current members:", error);
          // You might want to handle the error more gracefully here
        }
      } else {
        console.log("Ably client not initialized.");
      }
    };
    fetchMembers();
    //console.log("after after", players);
    // Return a cleanup function if needed
    return () => {
      // Perform cleanup actions here if necessary
    };
  }, [roomId, ablyClient]);

  useEffect(() => {
    const focus = function () {
      setStartTime(new Date());
    };
    const handleBeforeUnload = async function () {
      if (userId && typeof userId === "string") {
        return;
      }
      let endTime = new Date();
      let timeSpent = endTime.getTime() - startTime.getTime();
      console.log("Time spent on page:", timeSpent, "seconds");

      try {
        const response = await axios.post("/addTime", {
          userId: userId,
          time: timeSpent,
        });
        if (response.status === 200) {
          console.log("time spent added!");
        } else if (response.status === 404) {
          console.log("User", userId, "not found");
          console.log("Error", response.data);
        } else {
          console.error("Unexpected response status:", response.status);
        }
      } catch (error) {
        console.error("Error contacting server", error);
        console.log("error");
      }
    };

    handleBeforeUnload();

    window.addEventListener("focus", focus);
    window.addEventListener("unload", handleBeforeUnload);

    return () => {
      window.removeEventListener("unload", handleBeforeUnload);
    };
  }, [userId, startTime]);

  useEffect(() => {
    if (ablyClient) {
      console.log("Ably client provided to ChatBox", ablyClient);

      const onConnected = () => {
        console.log(
          "Ably client connected, now subscribing to channel:",
          `room:${roomId}`
        );
        const channel = ablyClient.channels.get(`room:${roomId}`);
        const onKick = (message) => {
          let str = "" + userId;
          if (message.data.text === str) {
            if (message.data.state === "kick") {
              //console.log("Kicked from room");
              setIsKicked(true);
            } else if (message.data.state === "ban") {
              //console.log("Banned from room");
              setIsBanned(true);
            }
          }
        };
        channel.subscribe("kick", onKick);

        return () => {
          channel.unsubscribe("kick", onKick);
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

  const handleKick = async (event, roomId, player) => {
    event.preventDefault();
    if (ablyClient) {
      const kickmes = player;
      const channel = ablyClient.channels.get(`room:${roomId}`);
      try {
        await channel.publish("kick", {
          userId: userId,
          state: "kick",
          text: kickmes,
        });
        //console.log("Message sent:", kickmes);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.log("Ably client not initialized or no message to send.");
    }
  };

  useEffect(() => {
    if (isKicked) {
      handleExitRoom();
      setIsKicked(false);
    }
  }, [isKicked]);
  useEffect(() => {
    if (isBanned) {
      handleExitRoomBan();
      setIsBanned(false);
    }
  }, [isBanned]);

  useEffect(() => {
    const active = async () => {
      if (isActive) {
        try {
          const response = await axios.post("/user-active", { userId, roomId });
          if (response.status === 200) {
            //all good
          } else {
            console.error("Unexpected response status:", response.status);
          }
        } catch (error) {
          console.error("Error fetching nickname for user:", error);
        }
      } else {
        try {
          const response = await axios.post("/user-inactive", { userId });
          if (response.status === 200) {
            //all good
          } else {
            console.error("Unexpected response status:", response.status);
          }
        } catch (error) {
          console.error("Error fetching nickname for user:", error);
        }
      }
    };
    console.log(isActive);
    active();
  }, [isActive]);

  if (isLoading) {
    return <LoadingScreen message="Loading Room..." />;
  }

  const handleExitRoom = async () => {
    const channel = ablyClient.channels.get(`room:${roomId}`);
    createPopup("You have been kicked from the room");
    await channel.detach();
    navigate(`/home`);
  };

  const handleExitRoomBan = async () => {
    const channel = ablyClient.channels.get(`room:${roomId}`);
    createPopup("You have been banned from the room");
    await channel.detach();
    navigate(`/home`);
  };

  const handleBan = async (event, roomId, player) => {
    event.preventDefault();
    console.log("Banning player:", player);
    //implement with database and rooms
    try {
      const response = await axios.post("/add-ban", { roomId, player });
      if (response.status === 200) {
        console.log("Banned:", player);
      } else if (response.status === 404) {
        console.log("Room/player not found:", response.data);
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("Error banning", error);
      console.log("error");
    }
    if (ablyClient) {
      const kickmes = player;
      const channel = ablyClient.channels.get(`room:${roomId}`);
      try {
        await channel.publish("kick", {
          userId: userId,
          state: "ban",
          text: kickmes,
        });
        //console.log("Message sent:", kickmes);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.log("Ably client not initialized or no message to send.");
    }
  };

  const createPopup = (message) => {
    // Implement popup logic here
    alert(message);
  };

  return (
    <ThemeProvider theme={theme}>
      <Invite />
      <div className="room-page">
        {!isGuest && (
          <div className="profile-dropdown">
            <ProfileDropdown />
          </div>
        )}
        <div className="settings">
          <RoomSettings
            setIsActive={setIsActive}
            userId={userId}
            timer={timer}
            hints={hints}
            guesses={guesses}
            setTimer={setTimer}
            setHints={setHints}
            setGuesses={setGuesses}
            roomId={roomId}
            ablyClient={ablyClient}
            nickname={nickname}
          />
        </div>
        <div className="room-header" sx={{ marginBottom: "-15px" }}>
          <h2>Room: {roomId}</h2>
        </div>

        <div className="game-container">
          <div className="players-list">
            <label>{timer && <h3>Time spent: {time}</h3>}</label>
            <hr></hr>
            <GeneratePuzzleForm setPuzzle={setPuzzle} userId={userId} />
            <hr></hr>
            <div className="color-picker">
              <label htmlFor="favcolor" style={{ marginRight: "5px" }}>
                <h3>Select your Cursor Color:</h3>
              </label>
              <MuiColorInput
                format="hex"
                value={favColor}
                onChange={handleColor}
              />
            </div>
            <Cheating
              setRevealGrid={setRevealGrid}
              setRevealHint={setRevealHint}
              setCheckWord={setCheckWord}
              setCheckGrid={setCheckGrid}
            />
            <div>
              <h2>Player List</h2>
              <ul>
                {players.map((player, index) => (
                  <div key={player}>
                    <li>
                      {realPlayers[index]}
                      <StyledButton
                        onClick={(event) => handleKick(event, roomId, player)}
                      >
                        Kick
                      </StyledButton>
                      <StyledButton
                        onClick={(event) => handleBan(event, roomId, player)}
                      >
                        Ban
                      </StyledButton>
                    </li>
                  </div>
                ))}
              </ul>
            </div>
            <hr></hr>
            <SuggestionBox />
          </div>
          <div className="centerPage">
            <Grid
              userId={userId}
              players={players}
              ablyClient={ablyClient}
              roomId={roomId}
              puzzle={puzzle}
              setPuzzle={setPuzzle}
              hints={hints}
              guesses={guesses}
              revealGrid={revealGrid}
              setRevealGrid={setRevealGrid}
              revealHint={revealHint}
              setRevealHint={setRevealHint}
              checkWord={checkWord}
              setCheckWord={setCheckWord}
              checkGrid={checkGrid}
              setCheckGrid={setCheckGrid}
              favColor={favColor}
              acrossClues={acrossClues}
              downClues={downClues}
              setCurrentClue={setCurrentClue}
              queuedChange={queuedChange}
              setQueuedChange={setQueuedChange}
            />
          </div>
          <div className="hints-chat-container">
            <CurrentCLueBox currentClue={currentClue} />
            <ClueList
              puzzle={puzzle}
              ablyClient={ablyClient}
              roomId={roomId}
              setCurrentClue={setCurrentClue}
              acrossCluess={acrossClues}
              downCluess={downClues}
              userId={userId}
              setQueuedChange={setQueuedChange}
            />
            <ChatBox
              ablyClient={ablyClient}
              roomId={roomId}
              userId={userId}
              userColor={userColor}
              nickname={nickname}
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default RoomPage;
