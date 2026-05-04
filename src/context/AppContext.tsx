import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const AppContext = createContext<AppContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  soundEnabled: true,
  toggleSound: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleSound = () => setSoundEnabled((prev) => !prev);

  return (
    <AppContext.Provider value={{ darkMode, toggleDarkMode, soundEnabled, toggleSound }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
