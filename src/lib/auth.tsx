import {
  isAuthError,
  isAuthRetryableFetchError,
  type AuthError,
  type Session,
  type User,
} from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { TranslationKey } from '@/i18n/en';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

/** Either success, or a translation key describing what went wrong. */
export type AuthResult = { error: TranslationKey | null };

type AuthContextValue = {
  /** False when Supabase keys are missing; account features are then hidden. */
  enabled: boolean;
  loaded: boolean;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  /** needsConfirmation is true when the project requires email confirmation. */
  signUp: (
    email: string,
    password: string,
  ) => Promise<AuthResult & { needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  /** Permanently deletes the account and all of its cloud data. */
  deleteAccount: () => Promise<AuthResult>;
  sendPasswordResetCode: (email: string) => Promise<AuthResult>;
  resetPasswordWithCode: (email: string, code: string, newPassword: string) => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Turns Supabase errors into friendly, translated messages. Never logs passwords. */
function toErrorKey(error: unknown): TranslationKey {
  if (isAuthRetryableFetchError(error)) return 'auth.errorNetwork';
  if (!isAuthError(error)) return 'auth.errorUnknown';
  switch ((error as AuthError).code) {
    case 'invalid_credentials':
      return 'auth.errorInvalidCredentials';
    case 'user_already_exists':
    case 'email_exists':
      return 'auth.errorUserExists';
    case 'weak_password':
      return 'auth.errorWeakPassword';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'auth.errorRateLimit';
    case 'otp_expired':
      return 'auth.errorCodeInvalid';
    case 'same_password':
      return 'auth.errorSamePassword';
    case 'email_not_confirmed':
      return 'auth.errorEmailNotConfirmed';
    case 'email_address_invalid':
      return 'auth.errorEmailInvalid';
    default:
      return 'auth.errorUnknown';
  }
}

const notConfigured: AuthResult = { error: 'auth.errorNotConfigured' };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setLoaded(true));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    enabled: isSupabaseConfigured,
    loaded,
    session,
    user: session?.user ?? null,
    signIn: async (email, password) => {
      if (!supabase) return notConfigured;
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error ? toErrorKey(error) : null };
      } catch (error) {
        return { error: toErrorKey(error) };
      }
    },
    signUp: async (email, password) => {
      if (!supabase) return notConfigured;
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: toErrorKey(error) };
        return { error: null, needsConfirmation: !data.session };
      } catch (error) {
        return { error: toErrorKey(error) };
      }
    },
    signOut: async () => {
      await supabase?.auth.signOut().catch(() => {});
    },
    deleteAccount: async () => {
      if (!supabase) return notConfigured;
      try {
        // Runs the delete_account() database function; cloud rows are removed with the user.
        const { error } = await supabase.rpc('delete_account');
        if (error) return { error: 'account.deleteFailed' };
        // The account no longer exists, so only clear the session on this phone.
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        return { error: null };
      } catch (error) {
        return {
          error: isAuthRetryableFetchError(error) ? 'auth.errorNetwork' : 'account.deleteFailed',
        };
      }
    },
    sendPasswordResetCode: async (email) => {
      if (!supabase) return notConfigured;
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        return { error: error ? toErrorKey(error) : null };
      } catch (error) {
        return { error: toErrorKey(error) };
      }
    },
    resetPasswordWithCode: async (email, code, newPassword) => {
      if (!supabase) return notConfigured;
      try {
        // The code signs the user in; then the new password is saved.
        const verified = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
        if (verified.error) return { error: toErrorKey(verified.error) };
        const updated = await supabase.auth.updateUser({ password: newPassword });
        return { error: updated.error ? toErrorKey(updated.error) : null };
      } catch (error) {
        return { error: toErrorKey(error) };
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

// Shared input checks for the auth screens.
export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
