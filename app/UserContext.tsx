import React, { createContext, useContext } from 'react';
import type { User as UserType } from './LoginScreen';
export type { User } from './LoginScreen';

export type UserContextType = {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

// Default export for Expo Router
export default useUser;
