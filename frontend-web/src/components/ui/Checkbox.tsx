// src/components/Checkbox.tsx
import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import Image from 'next/image';

import Cross from '@/assets/icons/cross.svg';

import { lightColors } from '@/theme/generated/light';
import { darkColors } from '@/theme/generated/dark';
import { primitives } from '@/theme/generated/primitives';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  style,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const boxBorderColor = checked
    ? (theme['colors_button_primary'] ?? '#0D111A')
    : (theme['colors_select_border'] ?? '#D1D4DC');

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: boxBorderColor,
            backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
          },
        ]}
      >
        <Image src={Cross} width={16} height={16} alt="" style={{ opacity: checked ? 1 : 0 }} />
      </View>

      {label ? (
        <Text
          style={[
            styles.label,
            { color: theme['colors_checklist_text'] ?? '#0D111A' },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: primitives['spacing & layout_border radius_radius-sm'] ?? 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: primitives['spacing & layout_padding & margin_space-3'] ?? 10,
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
