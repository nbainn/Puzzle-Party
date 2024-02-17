// test_host.js

// Create a new Peer instance
const peer = new Peer();

// Event handler for when the Peer object is successfully connected to the PeerJS server
peer.on('open', (id) => {
  console.log('Host peer ID is: ' + id);

  // You can use the host peer ID in other parts of your code if needed
  // For example, you might want to display it on the webpage
  displayHostPeerId(id);
});

let connection;

// Event handler for when a data connection is established with a client
peer.on('connection', (conn) => {
  connection = conn;
  console.log('Client connected');
});

// Function to send a message to the connected client
function sendMessage() {
  const textInput = document.getElementById('textInput');
  const message = textInput.value;

  if (connection) {
    connection.send(message);
  }
}

// Function to display the host peer ID on the webpage
function displayHostPeerId(peerId) {
  const peerIdElement = document.getElementById('hostPeerId');
  peerIdElement.textContent = 'Host Peer ID: ' + peerId;
}