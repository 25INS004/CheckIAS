import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppState, User } from '../types';

interface AppContextType extends AppState {
  setUser: (user: User | null) => void;
}

const defaultState: AppState = {
  isLoading: false,
  user: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  const setUser = (user: User | null) => {
    setState(prev => ({ ...prev, user }));
  };

  return (
    <AppContext.Provider value={{ ...state, setUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};