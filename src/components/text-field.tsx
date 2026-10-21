import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef, useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors, fonts } from '@/constants/theme';
import { useLanguage } from '@/i18n';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Small helper text under the field, e.g. password rules. */
  hint?: string;
  /** Shows the field in an error state with this message. */
  error?: string | null;
  /** Adds a show/hide toggle and hides the text by default. */
  password?: boolean;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, hint, error, password = false, onFocus, onBlur, ...inputProps },
  ref,
) {
  const { t } = useLanguage();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const borderColor = error ? colors.berry : focused ? colors.cocoa : colors.sand;

  return (
    <View>
      <AppText variant="label" tone="cocoa" className="mb-2">
        {label}
      </AppText>
      <View
        className="h-14 flex-row items-center rounded-2xl border bg-paper px-4"
        style={{ borderColor, borderWidth: focused || error ? 1.5 : 1 }}>
        <TextInput
          ref={ref}
          {...inputProps}
          secureTextEntry={password && !visible}
          autoCapitalize={inputProps.autoCapitalize ?? 'none'}
          autoCorrect={false}
          placeholderTextColor={colors.muted}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={{ flex: 1, fontFamily: fonts.sans, fontSize: 16, color: colors.ink }}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? t('auth.hidePassword') : t('auth.showPassword')}
            onPress={() => setVisible((v) => !v)}
            hitSlop={10}
            className="ml-2 active:opacity-60">
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <AppText variant="caption" className="mt-1.5" style={{ color: colors.berry }}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" tone="muted" className="mt-1.5">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});
