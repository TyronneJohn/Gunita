import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

// Values come from .env.local (never committed). Only the project URL and the
// publishable key belong here; data is protected by Row Level Security.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

/** False until both keys are filled in; the app then works fully offline. */
export const isSupabaseConfigured =
  supabaseUrl.startsWith('https://') && supabasePublishableKey.length > 0;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        // Keeps the user signed in across app launches.
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Only refresh the session while the app is open, to save battery.
if (supabase) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
