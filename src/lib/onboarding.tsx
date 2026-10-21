import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'gunita:hasOnboarded';

type OnboardingContextValue = {
  /** null while we're still reading from storage. */
  hasOnboarded: boolean | null;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => setHasOnboarded(value === 'true'))
      .catch(() => setHasOnboarded(false));
  }, []);

  const completeOnboarding = () => {
    setHasOnboarded(true);
    AsyncStorage.setItem(STORAGE_KEY, 'true').catch(() => {});
  };

  const resetOnboarding = () => {
    setHasOnboarded(false);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  return (
    <OnboardingContext.Provider value={{ hasOnboarded, completeOnboarding, resetOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return context;
}
