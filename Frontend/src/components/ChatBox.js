import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, List, ListItem, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

/*
Notes:
- Message Format: Messages are sent with the user ID and text; needs to be changed to nickname or email or something else
- Error Handling: need to add error handling for network requests and Ably operations
*/

function ChatBox({ userId, roomId, userColor, ablyClient }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const defaultGuestColor = '#aaff69';

  useEffect(() => {
    if (ablyClient) {
      console.log('Ably client provided to ChatBox', ablyClient);

      const onConnected = () => {
        console.log('Ably client connected, now subscribing to channel:', `room:${roomId}`);
        const channel = ablyClient.channels.get(`room:${roomId}`);
        const onMessage = (message) => {
          console.log('Message received:', message);
          setMessages((prevMessages) => [...prevMessages, message.data]);
        };
        channel.subscribe('message', onMessage);

        return () => {
          channel.unsubscribe('message', onMessage);
          ablyClient.connection.off('connected', onConnected);
        };
      };

      if (ablyClient.connection.state === 'connected') {
        onConnected();
      } else {
        ablyClient.connection.once('connected', onConnected);
      }
    }
  }, [ablyClient, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (ablyClient && newMessage.trim() !== '') {
      console.log('Sending message:', newMessage);
      const channel = ablyClient.channels.get(`room:${roomId}`);
      try {
        await channel.publish('message', { userId, text: newMessage, color: userColor });
        console.log('Message sent:', newMessage);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.log('Ably client not initialized or no message to send.');
    }
  };

  // Note: message bubble color matching userColor functionality isn't working yet; same with the contrasting color stuff

  // Function to determine message bubble styling based on the sender
  const getMessageBubbleStyles = (message) => {
    const bubbleColor = message.color || defaultGuestColor;
    return {
      bgcolor: bubbleColor,
      margin: '10px',
      maxWidth: '80%',
      alignSelf: userId === message.userId ? 'flex-end' : 'flex-start',
      textAlign: 'left',
      padding: '10px',
      borderRadius: '16px',
      color: getContrastYIQ(bubbleColor),
      boxShadow: '0 2px 2px rgba(0,0,0,0.2)',
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

  const chatBoxStyles = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '30%',
    position: 'absolute',
    right: 10,
    bottom: 10,
    left: 10,
    bgcolor: '#D7E8EF', 
    border: '2px solid #000', 
    borderRadius: '16px',
    overflow: 'hidden',
    fontFamily: "'Bubblegum Sans', cursive",
  };

  const chatInputStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#F9EAFF', 
      borderRadius: '16px',
      border: '2px solid #000', 
    },
    '& .MuiOutlinedInput-input': {
      padding: '10px',
      fontFamily: "'Bubblegum Sans', cursive", 
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  };

  const sendButtonStyles = {
    bgcolor: 'transparent', 
    '&:hover': {
      bgcolor: 'transparent',
    },
    '& .MuiIconButton-root': {
      borderRadius: '4px', 
    },
    '& .MuiSvgIcon-root': {
      color: '#FF00B6', 
    },
  };

  return (
    <Box sx={chatBoxStyles}>
      <List sx={{
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        p: 1,
        flexGrow: 1,
      }}>
        {messages.map((message, index) => (
          <ListItem key={index} sx={getMessageBubbleStyles(message)}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 'bold',
                fontFamily: 'Bubblegum Sans',
              }}
            >
              {message.userId !== userId ? `${message.userId}: ` : null}
              {message.text}
            </Typography>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>
      <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
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