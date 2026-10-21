import { router } from 'expo-router';
import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';

import { AuthFooterLink, AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/button';
import { FormMessage } from '@/components/form-message';
import { TextField } from '@/components/text-field';
import { useLanguage, type TranslationKey } from '@/i18n';
import { isValidEmail, MIN_PASSWORD_LENGTH, useAuth } from '@/lib/auth';

type FieldErrors = {
  email?: TranslationKey;
  password?: TranslationKey;
  confirm?: TranslationKey;
};

export default function SignUpScreen() {
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<TranslationKey | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setFormError(null);
    const errors: FieldErrors = {};
    if (!isValidEmail(email)) errors.email = 'auth.errorEmailInvalid';
    if (password.length < MIN_PASSWORD_LENGTH) errors.password = 'auth.errorPasswordShort';
    if (confirm !== password) errors.confirm = 'auth.errorPasswordMismatch';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setBusy(true);
    const result = await signUp(email.trim(), password);
    setBusy(false);
    if (result.error) setFormError(result.error);
    else if (result.needsConfirmation) setCheckEmail(true);
    else router.back();
  };

  return (
    <AuthLayout
      title={t('auth.signUpTitle')}
      subtitle={t('auth.signUpSubtitle')}
      footer={
        <AuthFooterLink
          prompt={t('auth.haveAccount')}
          action={t('auth.signIn')}
          onPress={() => router.replace('/auth/sign-in')}
        />
      }>
      {formError && <FormMessage message={t(formError)} />}
      {checkEmail && <FormMessage tone="info" message={t('auth.checkEmail')} />}

      <TextField
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email && t(fieldErrors.email)}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        password
        hint={t('auth.passwordHint')}
        error={fieldErrors.password && t(fieldErrors.password)}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <TextField
        ref={confirmRef}
        label={t('auth.confirmPassword')}
        value={confirm}
        onChangeText={setConfirm}
        password
        error={fieldErrors.confirm && t(fieldErrors.confirm)}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <Button
        label={t('auth.createAccount')}
        onPress={submit}
        disabled={busy || !email || !password || !confirm}
      />
    </AuthLayout>
  );
}
