const { send } = require("process");

// Define the loadScript function
function loadScript() {
    const libraryUrl = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = libraryUrl;
    script.onload = () => {
        // The library has been loaded, you can now use it
        const peer = new Peer();
        var conn;
        var peerID;

        // Function that uses the Peer object
        const createHost = () => {
            const peer = new Peer();
            peer.on('open', (id) => {
                console.log('My peer ID is: ' + id);
                hostID = "e27d9e0d-d881-4a45-b511-b877823f5f4f"
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

        const sendCoordinates = (x, y) => {
            createPeer();
            console.log(x)
            conn.on('open', function() {
                console.log("Coordinates: " + x + ", "+ y);
                conn.send("Coordinates: " + x + ", "+ y);
                
            })
            conn.on('data', function(data) {
                console.log('Received data:' + data);
            });

        }
        const sendColor = (color) => {
            createPeer();
            console.log(color)
            conn.on('open', function() {
                console.log("Color: " + color);
                conn.send("Color" + color);
                
            })
            conn.on('data', function(data) {
                console.log('Received data:' + data);
            });
        }

        const createPeer = () => {
            const peer = new Peer();
            peerID
            peer.on('open', (id) => {
                console.log('My peer ID is: ' + id);
                peerID = id
            });
            connectToPeer(hostID)
        }

        const connectToPeer = (peerId) => {
            conn = peer.connect(peerId);

            conn.on('open', function() {
                console.log('Connected to peer ' + peerId);
                // Now you can send data through the connection
                conn.send('Hello from client!');
            });

            conn.on('data', function(data) {
                console.log('Received data from peer ' + peerId + ':', data);
            });
        }

        // Expose createHost and createPeer functions globally
        window.createHost = createHost;
        window.createPeer = createPeer;
        window.sendCoordinates = sendCoordinates;
        window.sendColor = sendColor;
    };
    document.head.appendChild(script);
}
