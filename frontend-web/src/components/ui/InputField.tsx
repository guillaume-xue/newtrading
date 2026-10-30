'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Pressable,
  Platform,
  Animated,
} from 'react-native';

import { useAppTheme } from '@/theme/ThemeContext';

export interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: boolean | string;
  errorMessage?: string;
  suffix?: string | React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  defaultValue,
  placeholder,
  error = false,
  errorMessage,
  suffix,
  style,
  onFocus,
  onBlur,
  onChangeText,
  ...props
}) => {
  // Consommation du thème sémantique réactif
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(
    (value !== undefined ? value : defaultValue) ?? ''
  );
  const inputRef = useRef<TextInput>(null);

  const isFilled = (value !== undefined ? String(value) : String(internalValue)).length > 0;
  const isFloating = isFocused || isFilled;
  const animatedValue = useRef(new Animated.Value(isFloating ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFloating ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFloating, animatedValue]);

  const handleChangeText = (text: string) => {
    if (value === undefined) {
      setInternalValue(text);
    }
    onChangeText?.(text);
  };

  const hasError = Boolean(error) || Boolean(errorMessage);
  const resolvedErrorMessage = typeof error === 'string' ? error : errorMessage;

  const borderColor = useMemo(() => {
    if (hasError) return colors['colors_input_warning-border'];
    if (isFocused) return colors['colors_input_select-border'];
    return colors['colors_input_primary-border'];
  }, [hasError, isFocused, colors]);

  const labelColor = useMemo(() => {
    if (hasError) return colors['colors_input_warning-text'];
    if (isFocused) return colors['colors_input_select-text'];
    return colors['colors_input_secondary-text'];
  }, [hasError, isFocused, colors]);

  const labelTop = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [17, 6],
  });

  const labelFontSize = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 11],
  });

  const effectiveLabel = label || placeholder;

  return (
    <View style={styles.outerContainer}>
      <Pressable
        onPress={() =>
          (inputRef.current as unknown as { focus: () => void } | null)?.focus()
        }
        accessibilityRole="none"
        style={[
          styles.container,
          {
            backgroundColor: colors['colors_input_primary-bg'],
            borderColor,
            borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
            borderWidth: primitives['border width_border-thin'] ?? 1,
            paddingHorizontal: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
          },
        ]}
      >
        <View style={styles.inputWrapper}>
          {effectiveLabel ? (
            <Animated.Text
              style={[
                styles.floatingLabel,
                {
                  top: labelTop,
                  fontSize: labelFontSize,
                  color: labelColor,
                },
              ]}
              numberOfLines={1}
            >
              {effectiveLabel}
            </Animated.Text>
          ) : null}

          <TextInput
            ref={inputRef}
            value={value}
            defaultValue={defaultValue}
            onChangeText={handleChangeText}
            aria-invalid={hasError}
            placeholderTextColor={colors['colors_input_secondary-text']}
            style={[
              styles.input,
              { color: colors['colors_input_primary-text'] },
              effectiveLabel && styles.inputShifted,
              style,
              styles.webInputReset,
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
        </View>

        {suffix ? (
          <View style={styles.suffixContainer}>
            {typeof suffix === 'string' ? (
              <Text
                style={[
                  styles.suffixText,
                  { color: colors['colors_input_secondary-text'] },
                ]}
              >
                {suffix}
              </Text>
            ) : (
              suffix
            )}
          </View>
        ) : null}
      </Pressable>

      {hasError && resolvedErrorMessage ? (
        <Text
          accessibilityRole="alert"
          style={[
            styles.errorMessage,
            { color: colors['colors_input_warning-text'] },
          ]}
        >
          {resolvedErrorMessage}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    marginBottom: 8,
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    pointerEvents: 'none',
    fontWeight: '500',
    zIndex: 1,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    padding: 0,
    margin: 0,
  },
  webInputReset: Platform.select({
    web: {
      outlineWidth: 0,
      outlineColor: 'transparent',
      boxShadow: 'none',
    },
    default: {},
  }),
  inputShifted: {
    marginTop: 16,
  },
  suffixContainer: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  suffixText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorMessage: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});
