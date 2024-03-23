import React, { useState, useEffect } from 'react';
import Ably from 'ably/promises';
import { Box, TextField, IconButton, List, ListItem, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

/*
Notes:
- API Key for Backend: u-tBhA.LAJA1A:D5_Sa8D3Grz3QdLdE4K5N6ZMMiZnA87OABpBUemj1gs
- Token Fetching: component fetches an Ably token when it mounts and sets up the Ably client; fetchToken function can be changed to match backend's API
- User and Room IDs: component expects userId and roomId as props. These should be provided based on the logged-in user's ID and the ID of the room they're in
- Message Format: Messages are sent with the user ID and text
- Error Handling: need to add error handling for network requests and Ably operations
*/

// eventually pass userId as a prop, for now just generate it for testing purposes
function ChatBox({ userId, roomId, userColor }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ably, setAbly] = useState(null);

  useEffect(() => {
    async function fetchUserIdAndToken() {
      try {
        // Fetch the userId from backend
        const userRes = await fetch('/getUserId');
        if (!userRes.ok) {
          throw new Error('UserId fetch failed with status: ' + userRes.status);
        }
        const { userId } = await userRes.json();
  
        // Log the userId for debugging purposes
        console.log('Retrieved userId:', userId);
  
        // Now fetch the Ably token using the retrieved userId
        const tokenRes = await fetch('/getAblyToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: userId }),
        });
        if (!tokenRes.ok) {
          throw new Error('Token request failed with status: ' + tokenRes.status);
        }
  
        const tokenDetails = await tokenRes.json();
        // Log the token details for debugging purposes
        console.log('Token Details:', tokenDetails);
  
        const ablyClient = new Ably.Realtime.Promise({ tokenDetails });
        // Log the Ably client initialization for debugging purposes
        console.log('Ably client initialized with token details:', tokenDetails);
        
        setAbly(ablyClient);
      } catch (error) {
        console.error('Error fetching Ably token:', error);
      }
    }
  
    fetchUserIdAndToken();
  }, []);  

  useEffect(() => {
    if (ably) {
      const channel = ably.channels.get(`room:${roomId}`);
      const onMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message.data]);
      };
      channel.subscribe('message', onMessage);
      return () => {
        channel.unsubscribe('message', onMessage);
      };
    }
  }, [ably, roomId]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (ably && newMessage.trim() !== '') {
      const channel = ably.channels.get(`room:${roomId}`);
      try {
        await channel.publish('message', { userId, text: newMessage, color: userColor });
        setNewMessage('');  // Clear the input after sending
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
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
      padding: '10px', // Padding to ensure the text is aligned within the input box
      fontFamily: "'Bubblegum Sans', cursive", 
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none', // No additional border around the input field
    },
  };

  const sendButtonStyles = {
    bgcolor: 'transparent', 
    '&:hover': {
      bgcolor: 'transparent', // Transparent background even on hover
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
        flexDirection: 'column-reverse',
        p: 1,
        flexGrow: 1,
      }}>
        {messages.map((message, index) => (
          <ListItem key={index} sx={{
            backgroundColor: message.color || 'white', // Use the user's color or default to white
            margin: '10px 0',
            borderRadius: '10px',
            padding: '10px',
            border: userId === message.userId ? '2px solid black' : 'none', // Distinguish the user's own messages
          }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 'bold',
                color: message.userId === userId ? 'black' : 'grey',
                fontFamily: 'Bubblegum Sans',
              }}
            >
              {message.userId !== userId ? `${message.userId}: ` : null}
              {message.text}
            </Typography>
          </ListItem>
        ))}
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