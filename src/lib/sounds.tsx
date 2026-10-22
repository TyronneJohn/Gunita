import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

// Placeholder sounds generated for Gunita. Replace the files in assets/sounds/
// with better recordings any time — keep the same names.
const SHUFFLE_SOUND = require('@/assets/sounds/shuffle.wav');
const FLIP_SOUND = require('@/assets/sounds/flip.wav');

const STORAGE_KEY = 'gunita:soundEnabled';

type SoundContextValue = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  playShuffle: () => void;
  stopShuffle: () => void;
  playFlip: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

function playFromStart(player: AudioPlayer) {
  player.seekTo(0);
  player.play();
}

export function SoundProvider({ children }: { children: ReactNode }) {
  // Sound is on by default; the saved choice loads in the background.
  const [enabled, setEnabledState] = useState(true);
  const shufflePlayer = useAudioPlayer(SHUFFLE_SOUND);
  const flipPlayer = useAudioPlayer(FLIP_SOUND);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value !== null) setEnabledState(value === 'true');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    shufflePlayer.volume = 0.6;
    flipPlayer.volume = 0.5;
  }, [shufflePlayer, flipPlayer]);

  const stopShuffle = useCallback(() => {
    shufflePlayer.pause();
  }, [shufflePlayer]);

  const value: SoundContextValue = {
    enabled,
    setEnabled: (next) => {
      setEnabledState(next);
      if (!next) stopShuffle();
      AsyncStorage.setItem(STORAGE_KEY, String(next)).catch(() => {});
    },
    playShuffle: () => {
      if (enabled) playFromStart(shufflePlayer);
    },
    stopShuffle,
    playFlip: () => {
      if (enabled) playFromStart(flipPlayer);
    },
  };

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSounds() {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSounds must be used inside SoundProvider');
  return context;
}
