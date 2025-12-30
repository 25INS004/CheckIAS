import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserData {
  name: string;
  email: string;
  plan: 'Free' | 'Starter' | 'Pro' | 'Achiever';
  submissionsLeft: number;
  totalSubmissions: number;
  daysLeft: number;
  announcement?: string;
  guidanceCallsLeft: number;
  totalGuidanceCalls: number;
  callsCompletedThisMonth: number;
}

interface UserContextType {
  user: UserData | null;
  login: (email: string, plan: 'Free' | 'Starter' | 'Pro' | 'Achiever') => void;
  logout: () => void;
  decrementSubmissions: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to Pro user for dev convenience, or null for real auth
  const [user, setUser] = useState<UserData | null>({
    name: 'Pro User',
    email: 'pro@checkias.com',
    plan: 'Pro',
    submissionsLeft: 999,
    totalSubmissions: 999,
    daysLeft: 24,
    announcement: 'Due to high demand, evaluation times are extended to 48 hours this week.',
    guidanceCallsLeft: 4,
    totalGuidanceCalls: 6,
    callsCompletedThisMonth: 2
  });

  const login = (email: string, plan: 'Free' | 'Starter' | 'Pro' | 'Achiever') => {
    switch (plan) {
      case 'Free':
        setUser({
          name: 'Free User',
          email,
          plan: 'Free',
          submissionsLeft: 2,
          totalSubmissions: 2,
          daysLeft: 0,
          announcement: 'Upgrade to Pro to get detailed model answers!',
          guidanceCallsLeft: 0,
          totalGuidanceCalls: 0,
          callsCompletedThisMonth: 0
        });
        break;
      case 'Starter':
        setUser({
          name: 'Starter User',
          email,
          plan: 'Starter',
          submissionsLeft: 999,
          totalSubmissions: 999,
          daysLeft: 30,
          announcement: 'Welcome to Starter plan!',
          guidanceCallsLeft: 1,
          totalGuidanceCalls: 2,
          callsCompletedThisMonth: 0
        });
        break;
      case 'Achiever':
        setUser({
          name: 'Achiever User',
          email,
          plan: 'Achiever',
          submissionsLeft: 999,
          totalSubmissions: 999,
          daysLeft: 365,
          announcement: 'Exclusive mentorship session this Friday!',
          guidanceCallsLeft: 10,
          totalGuidanceCalls: 12,
          callsCompletedThisMonth: 1
        });
        break;
      case 'Pro':
      default:
        setUser({
          name: 'Pro User',
          email,
          plan: 'Pro',
          submissionsLeft: 999,
          totalSubmissions: 999,
          daysLeft: 30,
          announcement: 'Due to high demand, evaluation times are extended to 48 hours this week.',
          guidanceCallsLeft: 4,
          totalGuidanceCalls: 6,
          callsCompletedThisMonth: 2
        });
        break;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const decrementSubmissions = () => {
    if (user && user.submissionsLeft > 0) {
      setUser({ ...user, submissionsLeft: user.submissionsLeft - 1 });
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, decrementSubmissions }}>
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
