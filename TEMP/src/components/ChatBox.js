import React, { useState, useEffect } from 'react';
import Ably from 'ably/promises';
import './ChatBox.css';

/*
Notes:
- API Key for Backend: u-tBhA.LAJA1A:D5_Sa8D3Grz3QdLdE4K5N6ZMMiZnA87OABpBUemj1gs
- Token Fetching: component fetches an Ably token when it mounts and sets up the Ably client; fetchToken function can be changed to match backend's API
- User and Room IDs: component expects userId and roomId as props. These should be provided based on the logged-in user's ID and the ID of the room they're in
- Message Format: Messages are sent with the user ID and text
- Error Handling: need to add error handling for network requests and Ably operations
*/

function ChatBox({ userId, roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ably, setAbly] = useState(null);

  // fetches Ably token from backend server and initializes Ably client (still need to implement backend)
  useEffect(() => {
    // fetch Ably token from the backend
    const fetchToken = async () => {
      // sends an HTTP POST request to the /getAblyToken endpoint on server
      const response = await fetch('/getAblyToken', {
        method: 'POST',
        body: JSON.stringify({ roomId }),
        // inform server that request body format is JSON
        headers: {
          'Content-Type': 'application/json',
          // if our server requires authentication (probably should), would also include authentication headers here
        },
      });
      // reads response body (token request needed to initialize Ably client) and converts it from JSON to a JavaScript object
      const tokenRequest = await response.json();
      // new instance of the Ably Realtime client is created using the token request
      const ablyClient = new Ably.Realtime.Promise({ tokenRequest });
      // updates the state 'ably' with the newly created Ably client; will be used later to subscribe to Ably channels and send/receive messages
      setAbly(ablyClient);
    };

    // execute the token fetching process
    fetchToken();
  // effect will re-run whenever the value of roomId changes
  }, [roomId]);

  // sets up subscription to an Ably real-time channel for receiving messages
  useEffect(() => {
    // checks if ably object is defined (since set asynchronously in previous useEffect, might be a moment when it's undefined)
    if (ably) {
      // gets channel from Ably client; channel's name is dynamically determined based on roomId
      const channel = ably.channels.get(`room:${roomId}`);

      // subscribes to channel; 'message' event is listened for, and when a new message is published to channel, callback function is executed
      channel.subscribe('message', (message) => {
        setMessages((prevMessages) => [message.data, ...prevMessages]);
      });

      // function is returned by the effect and is called when the component unmounts or before the effect runs again (due to a change in its dependencies)
      // it unsubscribes from the channel for cleanup purposes if the component is no longer in use or if the subscription needs to be reset (change in ably/roomId)
      return () => channel.unsubscribe();
    }
  // effect will re-run whenever either ably or roomId changes
  }, [ably, roomId]);

  // handles the submission of a new message to an Ably channel
  const handleSendMessage = async (event) => {
    // prevents default form submission behavior
    event.preventDefault();
    // checks if the ably object is defined (if Ably client has been initialized yet) and if message isn't just empty spaces
    if (ably && newMessage.trim() !== '') {
      // retrieves Ably channel associated with roomId
      const channel = ably.channels.get(`room:${roomId}`);
      // publishes a message to the Ably channel (send a message to all subscribers of the channel)
      // first argument 'message' is the event name, second argument contains the userId and the message text 'newMessage'
      await channel.publish('message', { userId, text: newMessage });
      // resets newMessage state to an empty string, clearing the input field
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message.userId !== userId ? <b>{message.userId}: </b> : null}
            {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="chat-form">
        <input
          type="text"
          className="chat-input"
          placeholder="Type here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
}

export default ChatBox;
