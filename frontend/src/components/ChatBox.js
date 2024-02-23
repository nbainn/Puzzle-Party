import React, { useState } from 'react';
import './ChatBox.css'; 

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (newMessage.trim() !== '') {
      setMessages([newMessage, ...messages]); // Add new message at the start of the array
      setNewMessage(''); // Clear the input after sending
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message}
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
