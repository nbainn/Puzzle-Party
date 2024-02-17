// test_client.js

// Create a new Peer instance
const peer = new Peer();

peer.on('open', (id) => {
  console.log('Client peer ID is: ' + id);
});

let connection;

peer.on('connection', (conn) => {
  connection = conn;
  console.log('Connected to host');
  
  connection.on('data', (data) => {
    // Update HTML based on the received data
    updateHTML(data);
  });
});

function updateHTML(message) {
  const displayTextElement = document.getElementById('displayText');
  displayTextElement.textContent = message;
}
