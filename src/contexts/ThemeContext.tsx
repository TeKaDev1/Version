import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { firebaseApp } from '@/lib/firebase';

type Theme = 'light' | 'dark';

interface SiteConfig {
  theme: {
    colors: Record<string, string>;
    fonts: {
      main: string;
      headings: string;
    };
  };
  // Other config properties
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  siteConfig: SiteConfig | null;
  isConfigLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  
  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Always default to light mode as requested
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Load site configuration from Firebase
    const db = getDatabase(firebaseApp);
    const configRef = ref(db, 'siteConfig');
    
    const unsubscribe = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const config = snapshot.val();
        setSiteConfig(config);
        
        // Apply the configuration to CSS variables
        if (config.theme && config.theme.colors) {
          Object.entries(config.theme.colors).forEach(([name, value]) => {
            document.documentElement.style.setProperty(`--${name}`, value);
          });
        }
      }
      setIsConfigLoading(false);
    }, (error) => {
      console.error("Error loading site configuration:", error);
      setIsConfigLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  };
  
  const value = {
    theme,
    toggleTheme,
    siteConfig,
    isConfigLoading
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
