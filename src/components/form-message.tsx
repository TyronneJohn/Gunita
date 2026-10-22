import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { useColors } from '@/lib/theme';

type FormMessageProps = {
  message: string;
  tone?: 'error' | 'info';
};

/** A soft banner for form-level errors or notes (e.g. "We sent you a code"). */
export function FormMessage({ message, tone = 'error' }: FormMessageProps) {
  const isError = tone === 'error';
  const colors = useColors();

  return (
    <View
      className="flex-row items-start gap-2.5 rounded-2xl px-4 py-3"
      style={{
        backgroundColor: isError ? 'rgba(184, 97, 91, 0.12)' : 'rgba(156, 175, 136, 0.22)',
      }}>
      <Ionicons
        name={isError ? 'alert-circle-outline' : 'mail-outline'}
        size={18}
        color={isError ? colors.berry : colors.sageDeep}
        style={{ marginTop: 1 }}
      />
      <AppText
        variant="label"
        className="flex-1"
        style={{ color: isError ? colors.berry : colors.sageDeep }}>
        {message}
      </AppText>
    </View>
  );
}
