export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AppState {
  isLoading: boolean;
  user: User | null;
}

export type ThemeMode = 'light' | 'dark';