import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const fetchAndSetAblyClient = useCallback(async (clientId) => {
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
  }, [ablyClient]);

  const login = async (token, userId, nickname, userColor) => {
    if (!token || !userId) {
      console.error('Invalid login parameters:', { token, userId });
      return;
    }
    console.log('Logging in, received token:', token);
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

  const logout = useCallback(() => {
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
  }, []);

  // Verify token with backend
  const verifyToken = async (token) => {
    try {
      const response = await axios.post('/verifyToken', { token });
      return response.data.isValid;
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  }; 

  useEffect(() => {
    console.log('Checking local storage for token...');
    const initializeAuth = async () => {
      console.log('Set IACC False');
      setIsAuthCheckComplete(false); 
      
      const storedToken = localStorage.getItem('userToken');
      if (storedToken) {
        const isValid = await verifyToken(storedToken);
        if (isValid) {
          const storedUserId = localStorage.getItem('userId');
          const storedNickname = localStorage.getItem('nickname');
          const storedUserColor = localStorage.getItem('userColor');
          setIsAuthenticated(true);
          setUserId(storedUserId);
          setNickname(storedNickname);
          setUserColor(storedUserColor);
          await fetchAndSetAblyClient(storedUserId);
        } else {
          console.log('Logout');
          logout();
        }
      }
      console.log('Set IACC True');
      setIsAuthCheckComplete(true);
    };
  
    initializeAuth();
  }, [logout, fetchAndSetAblyClient]);

  // Expose the states and functions through context
  return (
    <AuthContext.Provider value={{ isAuthenticated, isGuest, userId, nickname, userColor, ablyClient, isAuthCheckComplete, login, guestLogin, logout, handleRedirection, setHandleRedirection }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook that allows other components to access the auth context
export const useAuth = () => useContext(AuthContext);