import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Child {
  id: string;
  first_name: string;
  grade: number;
  birthdate?: string;
}

interface ChildModeContextType {
  isChildMode: boolean;
  currentChild: Child | null;
  setChildMode: (child: Child) => void;
  exitChildMode: () => void;
  children: Child[];
  setChildren: (children: Child[]) => void;
  autoLogoutMinutes: number;
  lastActivity: Date;
  updateActivity: () => void;
}

const ChildModeContext = createContext<ChildModeContextType | undefined>(undefined);

export function ChildModeProvider({ children }: { children: React.ReactNode }) {
  const [isChildMode, setIsChildMode] = useState(false);
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [lastActivity, setLastActivity] = useState(new Date());
  const [autoLogoutMinutes] = useState(30); // 30 minutes auto-logout
  const navigate = useNavigate();

  const setChildMode = (child: Child) => {
    setCurrentChild(child);
    setIsChildMode(true);
    setLastActivity(new Date());
    navigate('/child-home');
  };

  const exitChildMode = () => {
    setCurrentChild(null);
    setIsChildMode(false);
    navigate('/parent');
  };

  const updateActivity = () => {
    setLastActivity(new Date());
  };

  const setChildren = (children: Child[]) => {
    setChildrenList(children);
  };

  // Auto-logout timer
  useEffect(() => {
    if (!isChildMode) return;

    const checkActivity = () => {
      const now = new Date();
      const timeDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60); // minutes
      
      if (timeDiff >= autoLogoutMinutes) {
        exitChildMode();
      }
    };

    const interval = setInterval(checkActivity, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isChildMode, lastActivity, autoLogoutMinutes]);

  // Track user activity
  useEffect(() => {
    if (!isChildMode) return;

    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => updateActivity();
    
    activities.forEach(activity => {
      document.addEventListener(activity, handleActivity);
    });

    return () => {
      activities.forEach(activity => {
        document.removeEventListener(activity, handleActivity);
      });
    };
  }, [isChildMode]);

  return (
    <ChildModeContext.Provider value={{
      isChildMode,
      currentChild,
      setChildMode,
      exitChildMode,
      children: childrenList,
      setChildren,
      autoLogoutMinutes,
      lastActivity,
      updateActivity
    }}>
      {children}
    </ChildModeContext.Provider>
  );
}

export function useChildMode() {
  const context = useContext(ChildModeContext);
  if (context === undefined) {
    throw new Error('useChildMode must be used within a ChildModeProvider');
  }
  return context;
}