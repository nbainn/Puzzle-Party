// Define the loadScript function
export function loadScript() {
    const libraryUrl = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = libraryUrl;
    script.onload = () => {
        // The library has been loaded, you can now use it
        const Peer = window.Peer; // Declare Peer variable
        let hostID;
        const peer = new Peer();
        // Function that uses the Peer object
        const createHost = () => {
            //const peer = new Peer();
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

        const createPeer = () => {
            const peer = new Peer();
            var peerID
            peer.on('open', (id) => {
                console.log('My peer ID is: ' + id);
                peerID = id
            });
            connectToPeer(hostID)
        }

        const connectToPeer = (peerId) => {
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

        // Expose createHost and createPeer functions globally
        window.createHost = createHost;
        window.createPeer = createPeer;
    };
    document.head.appendChild(script);
}

