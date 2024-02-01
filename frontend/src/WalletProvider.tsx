import { createContext, useContext, useState, FC, ReactNode } from 'react';

interface WalletContextProps {
  address: string | null;
  setAddress: (address: string | null) => void;
}

const WalletContext = createContext<WalletContextProps | null>(null);

export const useWallet = () => {
    const context = useContext(WalletContext);
  
    if (!context) {
      throw new Error('useWallet must be used within a WalletProvider');
    }
  
    return context;
  };

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);

  return (
    <WalletContext.Provider value={{ address, setAddress }}>
      {children}
    </WalletContext.Provider>
  );
};