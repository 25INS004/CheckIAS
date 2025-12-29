import { useState, useCallback } from 'react';

export const useToggle = (initialState: boolean = false): [boolean, () => void] => {
  const [state, setState] = useState<boolean>(initialState);

  const toggle = useCallback(() => {
    setState(prev => !prev);
  }, []);

  return [state, toggle];
};