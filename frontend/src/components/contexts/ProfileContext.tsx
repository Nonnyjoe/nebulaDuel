import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileType {
  id: number;
  monika: string;
  points: number;
  ai_battles_losses: number;
  ai_battles_won: number;
  avatar_url: string;
  cartesi_token_balance: number;
  characters: string;
  nebula_token_balance: number;
  total_ai_battles: number;
  total_battles: number;
  total_losses: number;
  total_wins: number;
  transaction_history: string;
  wallet_address: string;
}

interface ProfileContextProps {
  profile: ProfileType | null;
  setProfile: (newStruct: ProfileType | null) => void;
}

const ProfileContext = createContext<ProfileContextProps | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileType | null>(() => {
    const savedStruct = localStorage.getItem('struct');
    return savedStruct ? JSON.parse(savedStruct) : null;
  });

//   useEffect(() => {
//     if (profile) {
//       localStorage.setItem('struct', JSON.stringify(profile));
//     } else {
//       localStorage.removeItem('struct');
//     }
//   }, [profile]);

  const updateStruct = (newStruct: ProfileType | null) => {
    setProfile(newStruct);
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile: updateStruct }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = (): ProfileContextProps => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within an AppProvider');
  }
  return context;
};
