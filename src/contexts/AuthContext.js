// AuthContext.js - Defines a React Context for managing global authentication state.

import { createContext } from 'react';

// Create a context with a default shape.
export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
});
