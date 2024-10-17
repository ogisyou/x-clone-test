// AvatarContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';


interface AvatarContextType {
  avatar: string;
  setAvatar: React.Dispatch<React.SetStateAction<string>>;
}


const AvatarContext = createContext<AvatarContextType | undefined>(undefined);


interface AvatarProviderProps {
  children: ReactNode;
}


export const AvatarProvider: React.FC<AvatarProviderProps> = ({ children }) => {
  const [avatar, setAvatar] = useState<string>('');

  return (
    <AvatarContext.Provider value={{ avatar, setAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};


export const useAvatar = (): AvatarContextType => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};
