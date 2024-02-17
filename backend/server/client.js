const { connect } = require("http2");

// Central host id 
var hostID;


// Define the loadScript function
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

// Load the external library
const libraryUrl = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
loadScript(libraryUrl, () => {
    // The library has been loaded, you can now use it

    
    // Function that uses the Peer object
    function createHost() {
        const peer = new Peer();
        peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
            hostID = id
        });
        peer.on('connection', function(conn) {
            conn.on('open', function() {
                // Receive messages
                conn.on('data', function(data) {
                console.log('Received', data);
                });

                // Send messages
                conn.send('Hello!');
            });
        });


    }

    function createPeer() {
        const peer = new Peer();
        var peerID
        peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
            peerID = id
        });
        connectToPeer(hostID)

    }
 
    // Function to establish a connection to another peer
    function connectToPeer(peerId) {
        const conn = peer.connect(peerId);
    
        conn.on('open', function() {
        console.log('Connected to peer ' + peerId);
        // Now you can send data through the connection
        conn.send('Hello from client!');
        });
    
        conn.on('data', function(data) {
        console.log('Received data from peer ' + peerId + ':', data);
        });
    }
    // Call the function
  
});

export default loadScript;
