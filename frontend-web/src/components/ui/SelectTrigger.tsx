// src/components/SelectTrigger.tsx
import React from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  useColorScheme,
  Platform,
} from 'react-native';
import Image from 'next/image';

import AngleRight from '@/assets/icons/angle-small-right.svg';

import { lightColors } from '@/theme/generated/light';
import { darkColors } from '@/theme/generated/dark';
import { primitives } from '@/theme/generated/primitives';

export type SelectVariant = 'boxed' | 'ghost' | 'compact';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectTriggerProps {
  label: string;
  icon?: React.ReactNode;
  options?: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  direction?: 'right' | 'down';
  onPress?: () => void;
  variant?: SelectVariant;
  disabled?: boolean;
  style?: ViewStyle;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  label,
  icon,
  options = [],
  value,
  onValueChange,
  direction = 'right',
  onPress,
  variant = 'boxed',
  disabled = false,
  style,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(value ?? '');
  const selectedValue = value ?? internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const displayedLabel = selectedOption?.label ?? label;

  const rotation = direction === 'down' ? '90deg' : '0deg';
  const hasOptions = options.length > 0;

  const handlePress = () => {
    if (hasOptions) {
      setIsOpen((open) => !open);
    }
    onPress?.();
  };

  const handleOptionPress = (option: SelectOption) => {
    setInternalValue(option.value);
    onValueChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay invisible pour fermer le select au clic à l'extérieur */}
      {isOpen ? (
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
        />
      ) : null}

      <View style={[styles.wrapper, isOpen && styles.wrapperOpen]}>
        <Pressable
          onPress={handlePress}
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
          {icon}
          <Text
            style={[
              styles.label,
              variant === 'compact' && styles.labelCompact,
              { color: theme['colors_select_text'] },
            ]}
            numberOfLines={1}
          >
            {displayedLabel}
          </Text>
          <Image
            src={AngleRight}
            width={16}
            height={16}
            alt=""
            style={{ transform: `rotate(${rotation})` }}
          />
        </Pressable>

        {hasOptions && isOpen ? (
          <View
            style={[
              styles.options,
              {
                backgroundColor: theme['colors_select_bg'],
                borderColor: theme['colors_select_border'],
              },
            ]}
          >
            {options.map((option) => {
              const isSelected = option.value === selectedValue;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleOptionPress(option)}
                  style={({ pressed }) => [
                    styles.option,
                    isSelected && {
                      backgroundColor: theme['colors_bg_primary'],
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.optionLabel, { color: theme['colors_select_text'] }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
  },
  wrapper: {
    position: 'relative',
    zIndex: 1,
  },
  wrapperOpen: {
    zIndex: 9999, // Passe au premier plan absolu dès qu'il s'ouvre
  },
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
  options: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 10000,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
      } as any,
      default: {
        elevation: 8,
      },
    }),
  },
  option: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
  },
  optionLabel: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
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
