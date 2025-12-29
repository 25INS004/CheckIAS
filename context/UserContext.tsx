import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  submissionsRemaining: number;
  userTier: 'free' | 'premium';
  userId: string;
  setSubmissionsRemaining: (count: number) => void;
  setUserTier: (tier: 'free' | 'premium') => void;
  decrementSubmissions: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [submissionsRemaining, setSubmissionsRemaining] = useState(2);
  const [userTier, setUserTier] = useState<'free' | 'premium'>('free');
  const userId = 'USR001'; // Mock User ID

  const decrementSubmissions = () => {
    if (userTier === 'free') {
      setSubmissionsRemaining(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <UserContext.Provider value={{
      submissionsRemaining,
      userTier,
      userId,
      setSubmissionsRemaining,
      setUserTier,
      decrementSubmissions
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
