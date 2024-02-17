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
    const peer = new Peer();
    
    // Function that uses the Peer object
    function myFunction() {
        peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
        });
    }
    
    // Call the function
    myFunction();
});
