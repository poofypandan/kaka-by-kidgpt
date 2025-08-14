import { createContext, useContext, useState, ReactNode } from 'react';

interface DemoContextType {
  isDemoMode: boolean;
  demoUserType: 'parent' | 'child' | null;
  demoData: {
    user: any;
    children: any[];
    conversations: any[];
  };
  startDemo: (type: 'parent' | 'child') => void;
  exitDemo: () => void;
}

const demoUser = {
  id: 'demo-user-123',
  email: 'demo@kakakids.com',
  created_at: new Date().toISOString(),
};

const demoChildren = [
  {
    id: 'demo-child-1',
    first_name: 'Andi',
    grade: 3,
    final_grade: 3,
    daily_limit_min: 30,
    used_today_min: 15,
    birthdate: '2016-05-15',
    detected_grade: 3,
    grade_override: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-child-2',
    first_name: 'Sari',
    grade: 5,
    final_grade: 5,
    daily_limit_min: 45,
    used_today_min: 22,
    birthdate: '2014-08-22',
    detected_grade: 5,
    grade_override: false,
    created_at: new Date().toISOString(),
  }
];

const demoConversations = [
  {
    id: 'demo-conv-1',
    child_id: 'demo-child-1',
    messages: [
      {
        role: 'user',
        content: 'Halo Kaka! Aku mau belajar tentang hewan',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      },
      {
        role: 'assistant',
        content: 'Halo Andi! Wah, senang sekali kamu mau belajar tentang hewan! 🐨 Ada hewan apa yang ingin kamu pelajari? Kaka bisa cerita tentang hewan di Indonesia lho!',
        timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  }
];

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoUserType, setDemoUserType] = useState<'parent' | 'child' | null>(null);

  const startDemo = (type: 'parent' | 'child') => {
    setIsDemoMode(true);
    setDemoUserType(type);
  };

  const exitDemo = () => {
    setIsDemoMode(false);
    setDemoUserType(null);
  };

  const value = {
    isDemoMode,
    demoUserType,
    demoData: {
      user: demoUser,
      children: demoChildren,
      conversations: demoConversations,
    },
    startDemo,
    exitDemo,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoMode() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoProvider');
  }
  return context;
}