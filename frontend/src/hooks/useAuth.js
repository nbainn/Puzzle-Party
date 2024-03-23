import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check local storage or authentication token logic
    const userToken = localStorage.getItem('userToken');
    setIsAuthenticated(!!userToken);
  }, []);

  return { isAuthenticated };
}