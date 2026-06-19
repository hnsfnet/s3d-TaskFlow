import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Member } from '../types';

interface UserContextValue {
  currentUser: Member;
  allMembers: Member[];
  setAllMembers: (members: Member[]) => void;
  setCurrentUserId: (id: string) => void;
}

const defaultMember: Member = {
  id: '1',
  name: '张三',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
};

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<string>('1');
  const [allMembers, setAllMembers] = useState<Member[]>([defaultMember]);

  const currentUser = useMemo(() => {
    return allMembers.find(m => m.id === currentUserId) || allMembers[0] || defaultMember;
  }, [allMembers, currentUserId]);

  const value: UserContextValue = {
    currentUser,
    allMembers,
    setAllMembers,
    setCurrentUserId: useCallback((id: string) => setCurrentUserId(id), []),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
