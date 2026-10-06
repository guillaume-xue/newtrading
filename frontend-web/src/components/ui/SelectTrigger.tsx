// src/components/SelectTrigger.tsx
import React from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import Image from 'next/image';

import AngleRight from '@/assets/icons/angle-small-right.svg';

import { lightColors } from '@/theme/generated/light';
import { darkColors } from '@/theme/generated/dark';
import { primitives } from '@/theme/generated/primitives';

export type SelectVariant = 'boxed' | 'ghost' | 'compact';

export interface SelectTriggerProps {
  label: string;
  icon?: React.ReactNode;
  direction?: 'right' | 'down';
  onPress?: () => void;
  variant?: SelectVariant;
  disabled?: boolean;
  style?: ViewStyle;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  label,
  direction = 'right',
  onPress,
  variant = 'boxed',
  disabled = false,
  style,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const rotation = direction === 'down' ? '90deg' : '0deg';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'boxed' && [
          styles.boxed,
          {
            backgroundColor: theme['colors_select_bg'],
            borderColor: theme['colors_select_border'],
          },
        ],
        variant === 'compact' && [
          styles.compact,
          {
            backgroundColor: theme['colors_select_bg'],
            borderColor: theme['colors_select_border'],
          },
        ],
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'compact' && styles.labelCompact,
          { color: theme['colors_select_text'] },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Image src={AngleRight} width={16} height={16} alt="" style={{ transform: `rotate(${rotation})` }} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boxed: {
    height: 52,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    minWidth: 160,
  },
  compact: {
    height: 40,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    alignSelf: 'flex-start',
    gap: 8,
  },
  ghost: {
    paddingVertical: 6,
    paddingHorizontal: 0,
    alignSelf: 'flex-start',
    gap: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: primitives['typography_font size_font-size-16'] ?? 16,
    lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
    fontWeight: '500',
  },
  labelCompact: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '500',
  },
});
