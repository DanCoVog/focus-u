'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface ZenContextType {
  isZenMode: boolean;
  toggleZenMode: () => void;
}

const ZenContext = createContext<ZenContextType | undefined>(undefined);

export function ZenProvider({ children }: { children: React.ReactNode }) {
  const [isZenMode, setIsZenMode] = useState(false);

  // Opcional: Persistir estado de Zen Mode si se desea, 
  // pero usualmente es mejor reiniciarlo al entrar para no confundir al usuario.
  
  const toggleZenMode = () => setIsZenMode(prev => !prev);

  return (
    <ZenContext.Provider value={{ isZenMode, toggleZenMode }}>
      {children}
    </ZenContext.Provider>
  );
}

export function useZen() {
  const context = useContext(ZenContext);
  if (context === undefined) {
    throw new Error('useZen must be used within a ZenProvider');
  }
  return context;
}
