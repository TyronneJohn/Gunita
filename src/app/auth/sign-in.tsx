import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, View, type TextInput } from 'react-native';

import { AppText } from '@/components/app-text';
import { AuthFooterLink, AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/button';
import { FormMessage } from '@/components/form-message';
import { TextField } from '@/components/text-field';
import { useLanguage, type TranslationKey } from '@/i18n';
import { isValidEmail, useAuth } from '@/lib/auth';

export default function SignInScreen() {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<TranslationKey | null>(null);
  const [formError, setFormError] = useState<TranslationKey | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setFormError(null);
    if (!isValidEmail(email)) {
      setEmailError('auth.errorEmailInvalid');
      return;
    }
    setEmailError(null);
    setBusy(true);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) setFormError(error);
    else router.back();
  };

  return (
    <AuthLayout
      title={t('auth.signInTitle')}
      subtitle={t('auth.signInSubtitle')}
      footer={
        <AuthFooterLink
          prompt={t('auth.noAccount')}
          action={t('auth.createAccount')}
          onPress={() => router.replace('/auth/sign-up')}
        />
      }>
      {formError && <FormMessage message={t(formError)} />}

      <TextField
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        error={emailError && t(emailError)}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <View>
        <TextField
          ref={passwordRef}
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          password
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/auth/forgot-password')}
          hitSlop={8}
          className="mt-3 self-end active:opacity-60">
          <AppText variant="label" tone="sage">
            {t('auth.forgotPassword')}
          </AppText>
        </Pressable>
      </View>

      <Button label={t('auth.signIn')} onPress={submit} disabled={busy || !email || !password} />
    </AuthLayout>
  );
}
