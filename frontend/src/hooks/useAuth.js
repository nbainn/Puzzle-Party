import { useContext } from 'react';
import { AuthContext } from '../AuthContext';

// This custom hook allows any component that imports it to access the authentication context
export function useAuth() {
  return useContext(AuthContext);
}