'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  TextInput,
  Pressable,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import Image from 'next/image';

import Search from '@/assets/icons/search.svg';
import CrossIcon from '@/assets/icons/cross.svg';
import { useAppTheme } from '@/theme/ThemeContext';

export type SearchBarSize = 'sm' | 'md';

export interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  size?: SearchBarSize;
  style?: ViewStyle;
  showClearIcon?: boolean;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  size = 'md',
  placeholder = 'Rechercher...',
  showClearIcon = true,
  onClear,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);

  const { theme } = useAppTheme();
  const { colors, primitives, isDark } = theme;

  const borderColor = useMemo(() => {
    if (isFocused) return colors['colors_input_select-border'];
    return colors['colors_select_border'];
  }, [isFocused, colors]);

  const iconFilter = isDark ? 'brightness(0) invert(1)' : 'brightness(0)';
  const shouldDisplayClear = showClearIcon && Boolean(value && value.length > 0);

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      style={[
        styles.container,
        styles[size],
        {
          backgroundColor: colors['colors_bg_secondary'],
          borderColor,
          borderRadius: primitives['spacing & layout_border radius_radius-full'] ?? 9999,
          borderWidth: primitives['border width_border-thin'] ?? 1,
        },
        style,
      ]}
    >
      <Image
        src={Search}
        width={size === 'md' ? 16 : 12}
        height={size === 'md' ? 16 : 12}
        alt=""
        style={{
          marginRight: size === 'md' ? 8 : 4,
          filter: iconFilter,
          opacity: 0.7,
        }}
      />

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors['colors_input_secondary-text']}
        style={[
          styles.input,
          styles[`input_${size}`],
          { color: colors['colors_input_primary-text'] },
        ]}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />

      {shouldDisplayClear && (
        <Pressable
          onPress={() => {
            onChangeText?.('');
            onClear?.();
          }}
          hitSlop={8}
          style={styles.clearButton}
        >
          <Image
            src={CrossIcon}
            width={12}
            height={12}
            alt="Effacer"
            style={{ filter: iconFilter, opacity: 0.6 }}
          />
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  md: {
    height: 34,
    paddingHorizontal: 10,
  },
  sm: {
    height: 26,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
    margin: 0,
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
  input_md: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  input_sm: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
