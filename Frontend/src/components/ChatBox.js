import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, IconButton, List, ListItem, Typography, styled } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Filter from 'bad-words';

const ResizeHandle = styled("div")({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "5px",
  cursor: "ns-resize",
  borderTop: "5px solid #000",
  '&:hover': {
    borderTopColor: "#666",
  },
  zIndex: 10,
});

const filter = new Filter();

function ChatBox({ roomId, userColor, nickname, ablyClient }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatHeight, setChatHeight] = useState(300);
  const messagesEndRef = useRef(null);
  const defaultGuestColor = "#aaff69";
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (ablyClient) {
      console.log("Ably client provided to ChatBox", ablyClient);

      const onConnected = () => {
        console.log(
          "Ably client connected, now subscribing to channel:",
          `room:${roomId}`
        );
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (ablyClient && newMessage.trim() !== "") {
      const safeMessage = filter.clean(newMessage);
      console.log("Sending message:", safeMessage);
      const channel = ablyClient.channels.get(`room:${roomId}`);
      try {
        await channel.publish("message", {
          nickname: nickname,
          text: safeMessage,
          color: userColor || defaultGuestColor,
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
      margin: "10px",
      maxWidth: "80%",
      alignSelf: message.nickname === nickname ? "flex-end" : "flex-start",
      textAlign: "left",
      padding: "10px",
      borderRadius: "16px",
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

  // Function to calculate the maximum height
  const calculateMaxHeight = () => {
    const chatBoxTop = chatBoxRef.current.getBoundingClientRect().top;
    return window.innerHeight - chatBoxTop;
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
    width: "100%",
    right: 0,
    left: 0,
    bgcolor: "#D7E8EF",
    border: "2px solid #000",
    borderRadius: "16px",
    overflow: "hidden",
    fontFamily: "'Bubblegum Sans', cursive",
  };

  const chatInputStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#F9EAFF",
      borderRadius: "16px",
      border: "2px solid #000",
    },
    "& .MuiOutlinedInput-input": {
      padding: "10px",
      fontFamily: "'Bubblegum Sans', cursive",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
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
      color: "#FF00B6",
    },
  };

  return (
    <Box ref={chatBoxRef} sx={chatBoxStyles}>
      <ResizeHandle onMouseDown={handleMouseDown} />
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
          <ListItem key={index} sx={getMessageBubbleStyles(message)}>
            <Typography
              variant="body1"
              sx={{
                fontFamily: "Bubblegum Sans",
              }}
            >
              {message.nickname !== nickname ? `${message.nickname}: ` : null}
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
          fullWidth
          variant="outlined"
          placeholder="Type here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={chatInputStyles}
        />
        <IconButton type="submit" sx={sendButtonStyles}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default ChatBox;
