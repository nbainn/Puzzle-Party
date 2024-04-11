import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Ably from 'ably/promises';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [userId, setUserId] = useState(null);
  const [nickname, setNickname] = useState(null);
  const [userColor, setUserColor] = useState(null);
  const [ablyClient, setAblyClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAblyReady, setIsAblyReady] = useState(false);

  const fetchAndSetAblyClient = useCallback(async (clientId) => {
    if (ablyClient) {
      // Ably client already exists. No need to fetch a new token
      return;
    }
    console.log('Creating new Ably client with clientId:', clientId);
  
    // Ensure clientId is a string
    const clientIdString = String(clientId);
  
    const client = new Ably.Realtime.Promise({
      authCallback: async (tokenParams, callback) => {
        console.log('Ably authCallback called with tokenParams:', tokenParams);
        try {
          const response = await fetch('/getAblyToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clientId: clientIdString })
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const tokenDetails = await response.json();
          console.log('Received token details:', tokenDetails);
          callback(null, tokenDetails);
        } catch (error) {
          console.error('Error in Ably authCallback:', error);
          callback(error, null);
        }
      }
    });
  
    client.connection.on('connected', () => {
      console.log('Ably client connected');
      setIsAblyReady(true);
    });
  
    client.connection.on('failed', () => {
      console.error('Ably client connection failed');
      setIsAblyReady(false);
    });
  
    setAblyClient(client);
  }, [ablyClient]);

  useEffect(() => {
    const authenticateUser = async () => {
      setIsLoading(true);
      try {
        // Check with the server to validate the token
        const response = await axios.get('/verifyToken', { withCredentials: true });
        if (response.status === 200 && response.data.user) {
          setIsAuthenticated(true);
          setUserId(response.data.user.id);
          setNickname(response.data.user.nickname);
          setUserColor(response.data.user.userColor);
          await fetchAndSetAblyClient(response.data.user.id);
        } else {
          // User is not authenticated with token
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
  
    authenticateUser();
  }, []);

// I don't think we need this but I'm keeping it just in case
/*
  useEffect(() => {
    // This effect runs when isAuthenticated becomes true and when userId is set
    if (isAuthenticated && userId) {
      console.log('User Re-authenticated. Setting up Ably client:', userId);
      fetchAndSetAblyClient(userId);
    }
  }, [isAuthenticated, userId, fetchAndSetAblyClient]);
*/
  const login = async () => {
    try {
      const response = await axios.get('/user/profile');
      if (response.status === 200 && response.data) {
        setIsAuthenticated(true);
        setUserId(response.data.id || null);
        setNickname(response.data.nickname || null);
        setUserColor(response.data.userColor || '#FFFFFF');
        fetchAndSetAblyClient(response.data.id);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setIsAuthenticated(false);
    }
  };

  // Function to generate a random hex color
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const generateGuestUserId = () => {
    const timestamp = Date.now().toString(); // Get timestamp as string
    const lastFourDigits = timestamp.slice(-4); // Take last 4 digits for uniqueness
    const randomThreeDigits = Math.floor(100 + Math.random() * 900); // Random number between 100 and 999

    return `guest_${lastFourDigits}${randomThreeDigits}`; // Combine them
  };

  const guestLogin = async () => {
    const guestUserId = generateGuestUserId();
    setNickname(guestUserId);
    const randomColor = getRandomColor();
    setUserColor(randomColor);
    setIsAuthenticated(true);
    setIsGuest(true);
    setUserId(guestUserId);
    await fetchAndSetAblyClient(guestUserId);
  };

  const logout = async () => {
    await axios.get('/logout'); // Make an API call to logout
    setIsAuthenticated(false);
    setIsGuest(false);
    setUserId(null);
    if (ablyClient) {
      ablyClient.close();
      console.log('Ably client disconnected');
      setAblyClient(null);
    }
  };

  // Expose the states and functions through context
  return (
    <AuthContext.Provider value={{ isAuthenticated, isGuest, userId, nickname, userColor, ablyClient, login, guestLogin, logout, isLoading, isAblyReady }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook that allows other components to access the auth context
export const useAuth = () => useContext(AuthContext);