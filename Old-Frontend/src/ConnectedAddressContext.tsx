import React, { createContext, useContext, useState, ReactNode } from "react";

interface ConnectedAddressContextType {
  connectedAddress: string;
  setConnectedAddress: (address: string) => void;
}

// Create a context with a default value
const ConnectedAddressContext = createContext<ConnectedAddressContextType | undefined>(undefined);

// Define the props type to include `children`
interface ConnectedAddressProviderProps {
  children: ReactNode; // This type is suitable for any valid React child (string, number, JSX, etc.)
}

// Create a provider component
export const ConnectedAddressProvider: React.FC<ConnectedAddressProviderProps> = ({ children }) => {
  const [connectedAddress, setConnectedAddress] = useState<string>("");

  return (
    <ConnectedAddressContext.Provider value={{ connectedAddress, setConnectedAddress }}>
      {children}
    </ConnectedAddressContext.Provider>
  );
};

// Custom hook to use the context
export const useConnectedAddress = () => {
  const context = useContext(ConnectedAddressContext);
  if (context === undefined) {
    throw new Error("useConnectedAddress must be used within a ConnectedAddressProvider");
  }
  return context;
};