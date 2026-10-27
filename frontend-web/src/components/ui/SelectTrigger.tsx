// src/components/SelectTrigger.tsx
'use client';

import React, { useMemo } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import Image from 'next/image';

import AngleRight from '@/assets/icons/angle-small-right.svg';
import { useAppTheme } from '@/theme/ThemeContext';

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
  const { theme } = useAppTheme();
  const { colors, primitives, isDark } = theme;

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

  const iconFilter = useMemo(() => {
    return isDark ? 'brightness(0) invert(1)' : 'brightness(0)';
  }, [isDark]);

  const activeBorderColor = isOpen
    ? colors['colors_input_select-border']
    : colors['colors_select_border'];

  return (
    <>
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
                backgroundColor: colors['colors_select_bg'],
                borderColor: activeBorderColor,
                borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
                borderWidth: primitives['border width_border-thin'] ?? 1,
                paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
              },
            ],
            variant === 'compact' && [
              styles.compact,
              {
                backgroundColor: colors['colors_select_bg'],
                borderColor: activeBorderColor,
                borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
                borderWidth: primitives['border width_border-thin'] ?? 1,
                paddingHorizontal: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
              },
            ],
            variant === 'ghost' && [
              styles.ghost,
              {
                borderRadius: primitives['spacing & layout_border radius_radius-sm'] ?? 4,
                backgroundColor: pressed || isOpen ? colors['colors_bg_primary'] : 'transparent',
              },
            ],
            pressed && {
              backgroundColor:
                variant === 'ghost'
                  ? colors['colors_bg_primary']
                  : colors['colors_button_ghost'],
            },
            disabled && styles.disabled,
            style,
          ]}
        >
          {icon}
          <Text
            style={[
              styles.label,
              {
                color: colors['colors_select_text'],
                fontSize: primitives['typography_font size_font-size-16'] ?? 16,
                lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
              },
              variant === 'compact' && [
                styles.labelCompact,
                {
                  fontSize: primitives['typography_font size_font-size-14'] ?? 14,
                  lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
                },
              ],
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
            style={{
              transform: `rotate(${rotation})`,
              filter: iconFilter,
              opacity: isDark ? 0.85 : 0.65,
            }}
          />
        </Pressable>

        {hasOptions && isOpen ? (
          <View
            style={[
              styles.options,
              {
                backgroundColor: colors['colors_bg_secondary'],
                borderColor: colors['colors_divider_text'],
                borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
                borderWidth: primitives['border width_border-thin'] ?? 1,
                ...Platform.select({
                  web: {
                    boxShadow: isDark
                      ? '0 8px 24px rgba(0, 0, 0, 0.5)'
                      : '0 8px 24px rgba(0, 0, 0, 0.12)',
                  } as any,
                  default: {
                    elevation: 8,
                  },
                }),
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
                    {
                      paddingHorizontal: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
                      backgroundColor: isSelected
                        ? colors['colors_bg_primary']
                        : pressed
                        ? colors['colors_button_ghost']
                        : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color: isSelected
                          ? colors['colors_badge_primary-action-bg']
                          : colors['colors_text_primary'],
                        fontSize: primitives['typography_font size_font-size-14'] ?? 14,
                        lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
                        fontWeight: isSelected ? '700' : '400',
                      },
                    ]}
                  >
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
    zIndex: 9999,
  },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boxed: {
    height: 52,
    minWidth: 160,
  },
  compact: {
    height: 40,
    alignSelf: 'flex-start',
    gap: 8,
  },
  ghost: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    gap: 8,
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
    overflow: 'hidden',
  },
  option: {
    minHeight: 40,
    justifyContent: 'center',
  },
  optionLabel: {},
  label: {
    fontWeight: '500',
  },
  labelCompact: {
    fontWeight: '500',
  },
});

export default SelectTrigger;
