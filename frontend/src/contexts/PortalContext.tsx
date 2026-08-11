import React, { createContext, useContext, useState, useEffect } from 'react';

export type PortalType = 'admin' | 'officials' | 'members';

interface PortalContextType {
  currentPortal: PortalType;
  setPortal: (portal: PortalType) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [currentPortal, setCurrentPortal] = useState<PortalType>(() => {
    try {
      const authData = localStorage.getItem('user');
      if (authData) {
        const user = JSON.parse(authData);
        if (user.role === 'MEMBER') return 'members';
        if (user.role === 'CHAMA_ADMIN') return 'officials';
      }
    } catch (e) {
      // fallback
    }
    return 'admin';
  });

  useEffect(() => {
    // Current portal is now initialized correctly from localStorage
  }, []);

  const setPortal = (portal: PortalType) => {
    setCurrentPortal(portal);
  };

  return (
    <PortalContext.Provider value={{ currentPortal, setPortal }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (context === undefined) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
