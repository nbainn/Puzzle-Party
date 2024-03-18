// Used to store the base URL of the website...
// ...so that it can be easily changed if the website is hosted elsewhere.
const BASE_URL = "http://localhost";
const PORT = 3000;

// Ably API key
const AblyApiKey = "u-tBhA.LAJA1A:D5_Sa8D3Grz3QdLdE4K5N6ZMMiZnA87OABpBUemj1gs";

module.exports = {
  BASE_URL,
  PORT,
  AblyApiKey,
};

// Import this in all files that need the base URL
