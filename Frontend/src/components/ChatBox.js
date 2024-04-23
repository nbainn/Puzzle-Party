import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  Typography,
  styled,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
import Filter from "bad-words";
import CommentIcon from "@mui/icons-material/Comment";
import "./ChatBox.css";
import axios from "axios";

/*const ResizeHandle = styled("div")({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "5px",
  cursor: "ns-resize",
  "&:hover": {
    borderTopColor: "#666",
  },
  zIndex: 10,
});*/
const theme = createTheme({
  typography: {
    fontFamily: "C&C Red Alert [INET]",
  },
});

const filter = new Filter();

function ChatBox({
  userToken,
  updateAuthContext,
  setUserColor,
  setNickname,
  roomId,
  userColor,
  nickname,
  ablyClient,
  userId,
  favColor,
  setSelectGrid,
  selectChat,
  setSelectChat,
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatHeight, setChatHeight] = useState(165);
  const messagesEndRef = useRef(null);
  const defaultColor = "#aaff69";
  const chatBoxRef = useRef(null);
  const [showChatBox, setShowChatBox] = useState(false);
  //const [players, setPlayers] = useState([]); // State variable to store unique nicknames

  useEffect(() => {
    if (ablyClient) {
      console.log("Ably client provided to ChatBox", ablyClient);

      const onConnected = () => {
        console.log(
          "Ably client connected, now subscribing to channel:",
          `room:${roomId}`
        );
        console.log("Nickname:", nickname);
        const channel = ablyClient.channels.get(`room:${roomId}`);
        const onMessage = (message) => {
          console.log("Message received:", message);
          setMessages((prevMessages) => [...prevMessages, message.data]);
        };
        channel.subscribe("message", onMessage);

        return () => {
          channel.unsubscribe("message", onMessage);
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
    if (selectChat) {
      document.getElementById("chat-input").focus();
      console.log("ChatBox focused");
      setSelectChat(false);
    }
  }, [selectChat]);

  useEffect(() => {
    // Function to fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/user/profile", {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (response.data) {
          // Update the auth context with the latest data
          setNickname(response.data.nickname);
          setUserColor(response.data.userColor);
          updateAuthContext(response.data.nickname, response.data.userColor);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [userToken, setNickname, setUserColor, updateAuthContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (event) => {
    setSelectGrid(true);
    event.preventDefault();
    if (ablyClient && newMessage.trim() !== "") {
      const safeMessage = filter.clean(newMessage);
      console.log("Sending message:", safeMessage);
      const channel = ablyClient.channels.get(`room:${roomId}`);
      try {
        await channel.publish("message", {
          userId: userId,
          nickname: nickname,
          text: safeMessage,
          color: favColor || defaultColor,
        });
        console.log("Message sent:", safeMessage);
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.log("Ably client not initialized or no message to send.");
    }
  };

  // Function to determine message bubble styling based on the sender
  const getMessageBubbleStyles = (message) => {
    const bubbleColor = message.color;
    return {
      bgcolor: bubbleColor,
      margin: "2px",
      maxWidth: "80%",
      alignSelf: message.userId === userId ? "flex-end" : "flex-start",
      textAlign: "left",
      padding: "0px",
      paddingLeft: "4px",
      borderRadius: "4px",
      color: getContrastYIQ(bubbleColor),
      boxShadow: "0 2px 2px rgba(0,0,0,0.2)",
      wordBreak: "break-word",
    };
  };

  // Function to get a contrasting text color based on the background color
  const getContrastYIQ = (hexcolor) => {
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000" : "#fff";
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = chatBoxRef.current.clientHeight;

    const handleMouseMove = (moveEvent) => {
      // Calculate the new height
      let newHeight = startHeight - (moveEvent.clientY - startY);

      // Calculate the maximum allowable height
      const maxAvailableHeight = chatBoxRef.current.offsetTop;

      // Clamp new height within the minimum and maximum limits
      newHeight = Math.max(newHeight, 100); // Minimum 100px
      newHeight = Math.min(newHeight, maxAvailableHeight);

      setChatHeight(newHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const chatBoxStyles = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    height: `${chatHeight}px`,
    position: "relative",
    width: "24%",
    marginTop: "-165px",
    marginBottom: "4px",
    marginLeft: "4px",
    padding: "0px",
    right: 0,
    left: 0,
    bgcolor: "#DDE4FF",
    border: "2px solid #000",
    borderRadius: "4px",
    overflow: "hidden",
    fontFamily: "inherit",
    "& .MuiBox-root": {
      padding: "0px",
    },
  };

  const chatInputStyles = {
    padding: "0px 12px",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#F9EAFF",
      borderRadius: "4px",
      border: "2px solid #000",
    },
    "& .MuiOutlinedInput-input": {
      padding: "10px",
      fontFamily: "inherit",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    "& input": {
      height: "3px", // Adjust padding for better visual alignment
      fontSize: "1rem", // Adjust font size for better text alignment
    },
  };

  const sendButtonStyles = {
    bgcolor: "transparent",
    "&:hover": {
      bgcolor: "transparent",
    },
    "& .MuiIconButton-root": {
      borderRadius: "4px",
    },
    "& .MuiSvgIcon-root": {
      color: "black",
    },
  };

  return (
    <div className="shit">
      <ThemeProvider theme={theme}>
        <Box ref={chatBoxRef} sx={chatBoxStyles}>
          <List
            sx={{
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              p: 1,
              flexGrow: 1,
            }}
          >
            {messages.map((message, index) => (
              <ListItem
                key={index}
                className="chat-mes"
                sx={getMessageBubbleStyles(message)}
              >
                <Typography variant="body1" sx={{ lineHeight: "0.8" }}>
                  {message.nickname !== nickname
                    ? `${message.nickname}: `
                    : null}
                  {message.text}
                </Typography>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
          <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{ display: "flex", alignItems: "center", p: 1 }}
          >
            <TextField
              id="chat-input"
              fullWidth
              variant="outlined"
              placeholder="Type here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              sx={chatInputStyles}
              autoComplete="off"
            />
            <IconButton type="submit" sx={sendButtonStyles}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </ThemeProvider>
    </div>
  );
}

export default ChatBox;
