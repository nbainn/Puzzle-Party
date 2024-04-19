import React, { useState, useEffect } from "react";
import "./RoomSettings.css";
import { styled } from "@mui/material/styles";
import { Button, ButtonGroup } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Invite from "./Invite";
import axios from "axios";

const StyledButton = styled(Button)({
  fontSize: "1rem",
  color: "black",
  fontFamily: "inherit",
});
const StyledButtonGroup = styled(ButtonGroup)({
  color: "black",
});

function RoomSettings({
  userId,
  timer,
  hints,
  guesses,
  setTimer,
  setHints,
  setGuesses,
  roomId,
  ablyClient,
  nickname,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenInvite, setIsOpenInvite] = useState(false);
  const [friends, setFriends] = useState([]);
  const [realPlayers, setRealPlayers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0); // Initial time left in seconds
  const [time, setTime] = useState("00:00");
  const navigate = useNavigate();

  const handleExitRoom = async (event) => {
    const channel = ablyClient.channels.get(`room:${roomId}`);
    event.preventDefault();
    await channel.detach();
    setIsActive(false);
    navigate(`/home`);
  };

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
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Fetch the initial status of the room from the database
    const fetchRoomStatus = async () => {
      try {
        const response = await axios.post("/room-status", { roomId });
        //console.log('response.data', response.data);
        const pub_stat = response.data;
        console.log("pub_stat", pub_stat);
        setStatus(pub_stat === true ? "public" : "private");
      } catch (error) {
        console.error("Error fetching room status:", error);
        setStatus("public");
      }
    };

    fetchRoomStatus();
  }, [roomId]);

  const handleRoomStatus = async (event) => {
    event.preventDefault();
    setStatus((prevStatus) => (prevStatus === "public" ? "private" : "public"));
    try {
      // Generate a 6-digit room code and navigate to the RoomPage
      await axios.post("/change-status", { roomId: roomId, status: status });
    } catch (error) {
      console.error("Could not change status:", error);
    }
  };

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const fetchNicknames = async () => {
      const realPlayersList = await Promise.all(
        friends.map(async (friend) => {
          const integerValue = parseInt(friend);
          if (!isNaN(integerValue)) {
            try {
              const response = await axios.post("/fetch-nickname", {
                userId: friend,
              });
              if (response.status === 200) {
                return response.data;
              }
            } catch (error) {
              console.error("Error fetching nickname for user:", error);
            }
          }
          return friend;
        })
      );
      setRealPlayers(realPlayersList);
    };

    fetchNicknames();
  }, [friends]);

  const handleInvite = async () => {
    setIsOpenInvite(!isOpenInvite);
    //request friends list from db w invite buttons
    try {
      const response = await axios.post("/user-friends", { userId });
      if (response.data.friends) {
        setFriends(response.data.friends);
      } // Update requested list
    } catch (error) {
      console.error("Error fetching nickname for user:", error);
    }
  };

  const inviting = async (friend) => {
    console.log("inviting");
    //event.preventDefault();
    if (ablyClient) {
      const channel = ablyClient.channels.get(`inviting`);
      try {
        await channel.publish("invite", {
          userId: nickname,
          friend: friend,
          room: roomId,
        });
        //console.log("Message sent:", kickmes);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.log("Ably client not initialized or no message to send.");
    }
  };

  const handleTimerChange = () => {
    setTimer(!timer);
  };

  const handleHintsChange = () => {
    setHints(!hints);
  };

  const handleGuessesChange = () => {
    setGuesses(!guesses);
  };

  return (
    <div className="settings-popup">
      <Invite />
      <StyledButtonGroup
        size="small"
        variant="text"
        aria-label="Small button group"
      >
        <StyledButton
          variant="text"
          onClick={togglePopup}
          className="settings-button"
        >
          ⚙️
        </StyledButton>
        <StyledButton
          variant="text"
          onClick={handleExitRoom}
          className="exit-room-button"
        >
          Exit Room
        </StyledButton>
        <StyledButton
          variant="text"
          onClick={handleRoomStatus}
          className="room-status-button"
        >
          {status === "public" ? "Public" : "Private"}
        </StyledButton>
        <StyledButton
          variant="text"
          onClick={handleInvite}
          className="room-status-button"
        >
          Invite
        </StyledButton>
      </StyledButtonGroup>
      {isOpen && (
        <div className="popup-content">
          <h2>Settings</h2>
          <label>
            <input
              type="checkbox"
              checked={hints}
              onChange={handleHintsChange}
            />
            Enable Hints
          </label>
          <label>
            <input
              type="checkbox"
              checked={guesses}
              onChange={handleGuessesChange}
            />
            Enable Guesses
          </label>
        </div>
      )}
      {isOpenInvite && (
        <div className="popup-content">
          <h2>Friends:</h2>
          {friends.length > 0 ? (
            <ul>
              {friends.map((friend, index) => (
                <div key={friend}>
                  <li>
                    {realPlayers[index]}
                    <StyledButton
                      variant="text"
                      onClick={() => {
                        inviting(friend);
                      }}
                      className="room-status-button"
                    >
                      Invite
                    </StyledButton>
                  </li>
                </div>
              ))}
            </ul>
          ) : (
            <p>No friends</p>
          )}
        </div>
      )}
    </div>
  );
}

export default RoomSettings;
