'use client';

// src/components/ui/Checkbox.tsx
import React, { useMemo } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Image from 'next/image';

import Cross from '@/assets/icons/cross.svg';
import { useAppTheme } from '@/theme/ThemeContext';

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
  const { theme } = useAppTheme();
  const { colors, primitives, isDark } = theme;

  const boxBorderColor = checked
    ? colors['colors_badge_primary-action-bg']
    : colors['colors_select_border'];

  const boxBgColor = checked
    ? colors['colors_badge_primary-action-bg']
    : colors['colors_bg_secondary'];

  const iconFilter = useMemo(() => {
    // Si coché, l'icône de validation est blanche
    return 'brightness(0) invert(1)';
  }, []);

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
            backgroundColor: boxBgColor,
            borderRadius: primitives['spacing & layout_border radius_radius-sm'] ?? 6,
          },
        ]}
      >
        <Image
          src={Cross}
          width={14}
          height={14}
          alt=""
          style={{
            opacity: checked ? 1 : 0,
            filter: iconFilter,
          }}
        />
      </View>

      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: colors['colors_checklist_text'],
              marginLeft: primitives['spacing & layout_padding & margin_space-3'] ?? 10,
              fontSize: primitives['typography_font size_font-size-14'] ?? 14,
              lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
            },
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
    cursor: 'pointer',
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});

export default Checkbox;
