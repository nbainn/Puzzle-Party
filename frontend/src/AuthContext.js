import React, { createContext, useContext, useState, useEffect } from 'react';
import Ably from 'ably/promises';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [userId, setUserId] = useState(null);
  const [nickname, setNickname] = useState(null);
  const [userColor, setUserColor] = useState(null);
  const [ablyClient, setAblyClient] = useState(null);

  useEffect(() => {
    // This effect runs when isAuthenticated becomes true and when userId is set
    if (isAuthenticated && userId) {
      console.log('User authenticated. Setting up Ably client:', userId);
      fetchAndSetAblyClient(userId);
    }
  }, [isAuthenticated, userId]);

  const fetchAndSetAblyClient = async (clientId) => {
    if (ablyClient) {
      // Ably client already exists. No need to fetch a new token
      return;
    }
    console.log('Creating new Ably client with clientId:', clientId);
    const client = new Ably.Realtime.Promise({
      authCallback: async (tokenParams, callback) => {
        console.log('Ably authCallback called with tokenParams:', tokenParams);
        try {
          const response = await fetch('/getAblyToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clientId })
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
    });

    client.connection.on('failed', () => {
      console.error('Ably client connection failed');
    });

    setAblyClient(client);
  };

  const login = async (token, userId, nickname, userColor) => {
    if (!token || !userId) {
      console.error('Invalid login parameters:', { token, userId });
      return;
    }
    // Store user details in localStorage
    localStorage.setItem('userToken', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('nickname', nickname);
    localStorage.setItem('userColor', userColor);
  
    // Set state values
    setIsAuthenticated(true);
    setUserId(String(userId));
    setNickname(nickname);
    setUserColor(userColor);
  };

  const guestLogin = async () => {
    const guestUserId = `guest_${Date.now()}`;
    setIsAuthenticated(true);
    setIsGuest(true);
    setUserId(guestUserId);
    await fetchAndSetAblyClient(guestUserId);
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
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
    <AuthContext.Provider value={{ isAuthenticated, isGuest, userId, nickname, userColor, ablyClient, login, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook that allows other components to access the auth context
export const useAuth = () => useContext(AuthContext);