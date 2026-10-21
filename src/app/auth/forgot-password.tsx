import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, type TextInput } from 'react-native';

import { AppText } from '@/components/app-text';
import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/button';
import { FormMessage } from '@/components/form-message';
import { TextField } from '@/components/text-field';
import { useLanguage, type TranslationKey } from '@/i18n';
import { isValidEmail, MIN_PASSWORD_LENGTH, useAuth } from '@/lib/auth';

type FieldErrors = {
  email?: TranslationKey;
  code?: TranslationKey;
  password?: TranslationKey;
  confirm?: TranslationKey;
};

/**
 * Two steps: send a 6-digit code to the email, then enter the code with a
 * new password. Uses a code instead of a link so it works without deep links.
 */
export default function ForgotPasswordScreen() {
  const { t } = useLanguage();
  const { sendPasswordResetCode, resetPasswordWithCode } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<TranslationKey | null>(null);
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    setFormError(null);
    if (!isValidEmail(email)) {
      setFieldErrors({ email: 'auth.errorEmailInvalid' });
      return;
    }
    setFieldErrors({});
    setBusy(true);
    const { error } = await sendPasswordResetCode(email.trim());
    setBusy(false);
    if (error) setFormError(error);
    else setStage('code');
  };

  const reset = async () => {
    setFormError(null);
    const errors: FieldErrors = {};
    if (!/^\d{6}$/.test(code.trim())) errors.code = 'auth.errorCodeFormat';
    if (password.length < MIN_PASSWORD_LENGTH) errors.password = 'auth.errorPasswordShort';
    if (confirm !== password) errors.confirm = 'auth.errorPasswordMismatch';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setBusy(true);
    const { error } = await resetPasswordWithCode(email.trim(), code.trim(), password);
    setBusy(false);
    if (error) setFormError(error);
    else router.dismissTo('/profile');
  };

  return (
    <AuthLayout title={t('auth.forgotTitle')} subtitle={t('auth.forgotSubtitle')}>
      {formError && <FormMessage message={t(formError)} />}

      {stage === 'email' ? (
        <>
          <TextField
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            error={fieldErrors.email && t(fieldErrors.email)}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={sendCode}
          />
          <Button label={t('auth.sendCode')} onPress={sendCode} disabled={busy || !email} />
        </>
      ) : (
        <>
          <FormMessage tone="info" message={t('auth.codeSent', { email: email.trim() })} />
          <TextField
            label={t('auth.code')}
            value={code}
            onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
            error={fieldErrors.code && t(fieldErrors.code)}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={6}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextField
            ref={passwordRef}
            label={t('auth.newPassword')}
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
            onSubmitEditing={reset}
          />
          <Button
            label={t('auth.resetPassword')}
            onPress={reset}
            disabled={busy || !code || !password || !confirm}
          />
          <Pressable
            accessibilityRole="button"
            onPress={sendCode}
            disabled={busy}
            hitSlop={8}
            className="self-center active:opacity-60">
            <AppText variant="label" tone="sage">
              {t('auth.resendCode')}
            </AppText>
          </Pressable>
        </>
      )}
    </AuthLayout>
  );
}
