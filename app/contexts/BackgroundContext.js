// src/contexts/BackgroundContext.js
import React, { createContext, useState, useContext } from 'react';

const BackgroundContext = createContext();

export const BackgroundProvider = ({ children }) => {
  const [backgroundURL, setBackgroundURL] = useState(null);

  return (
    <BackgroundContext.Provider value={[backgroundURL, setBackgroundURL]}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => useContext(BackgroundContext);
