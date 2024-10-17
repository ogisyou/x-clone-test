// app/contexts/BackgroundContext.tsx
import React, { createContext, useContext, useState } from 'react';

type BackgroundURL = string | null;

export interface BackgroundContextType {
  backgroundURLs: BackgroundURL[];
  setBackgroundURLs: React.Dispatch<React.SetStateAction<BackgroundURL[]>>;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backgroundURLs, setBackgroundURLs] = useState<BackgroundURL[]>([]);

  return (
    <BackgroundContext.Provider value={{ backgroundURLs, setBackgroundURLs }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = (): BackgroundContextType => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};