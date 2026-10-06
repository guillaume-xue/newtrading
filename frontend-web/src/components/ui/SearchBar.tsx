// src/components/SearchBar.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  useColorScheme,
  Platform,
} from 'react-native';
import Image from 'next/image';

import Search from '@/assets/icons/search.svg';

import { lightColors } from '@/theme/generated/light';
import { darkColors } from '@/theme/generated/dark';
import { primitives } from '@/theme/generated/primitives';

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
  showClearIcon = false, // Désactivé par défaut si rien n'est tapé
  onClear,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);

  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;
  const borderColor = theme['colors_select_border'] ?? '#D1D4DC';

  const shouldDisplayClear = showClearIcon && Boolean(value && value.length > 0);

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      style={[
        styles.container,
        styles[size],
        {
          backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
          borderColor: borderColor,
        },
        style,
      ]}
    >
      {size === 'md' && (<Image src={Search} width={16} height={16} alt="" style={{ marginRight: 8 }} />) }
      {size === 'sm' && (<Image src={Search} width={12} height={12} alt="" style={{ marginRight: 4 }} />) }
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme['colors_input_secondary-text'] ?? '#8C93A3'}
        style={[
          styles.input,
          styles[`input_${size}`],
          { color: theme['colors_input_primary-text'] ?? '#131722' },
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
        >
        </Pressable>
      )}
    </Pressable>
  );
};


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: primitives['spacing & layout_border radius_radius-full'] ?? 9999,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    width: '100%',
  },
  md: {
    height: 32,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
  },
  sm: {
    height: 24,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
  },
  leftIconContainer: {
    marginRight: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 1,
    margin: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  input_md: {
    fontSize: primitives['typography_font size_font-size-16'] ?? 16,
    lineHeight: primitives['typography_line height_line-height-32'] ?? 32,
    fontWeight: '500',
  },
  input_sm: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 16,
    fontWeight: '500',
  },
});
