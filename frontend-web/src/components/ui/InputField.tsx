// components/InputField.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Pressable,
  Platform,
} from 'react-native';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  suffix?: string | React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  error = false,
  errorMessage,
  suffix,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = React.useRef<React.ComponentRef<typeof TextInput>>(null);

  const getStatusColor = () => {
    if (error) {
      return lightColors['colors_input_warning-text'];
    }
    if (isFocused) {
      return lightColors['colors_input_select-text'];
    }
    return lightColors['colors_input_secondary-text'];
  };

  const getBorderColor = () => {
    if (error) {
      return lightColors['colors_input_warning-border'];
    }
    if (isFocused) {
      return lightColors['colors_input_select-border'];
    }
    return lightColors['colors_input_primary-border'];
  };

  const labelColor = getStatusColor();
  const borderColor = getBorderColor();

  return (
    <View style={styles.outerContainer}>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.container,
          {
            backgroundColor: lightColors['colors_input_primary-bg'],
            borderColor: borderColor,
          },
          label ? styles.containerWithLabel : styles.containerWithoutLabel,
        ]}
      >
        <View style={styles.inputWrapper}>
          {label ? (
            <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
              {label}
            </Text>
          ) : null}

          <TextInput
            ref={inputRef}
            value={value}
            style={[
              styles.input,
              { color: lightColors['colors_input_primary-text'] },
              !label && styles.inputSingleLine,
              style,
            ]}
            placeholderTextColor={lightColors['colors_input_secondary-text']}
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
                  { color: lightColors['colors_input_secondary-text'] },
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

      {errorMessage ? (
        <Text
          style={[
            styles.errorMessage,
            { color: lightColors['colors_input_warning-text'] },
          ]}
        >
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    marginBottom: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
  },
  container: {
    minHeight: 56,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
  },
  containerWithLabel: {
    paddingVertical: 6,
  },
  containerWithoutLabel: {
    paddingVertical: 12,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  input: {
    fontSize: primitives['typography_font size_font-size-16'] ?? 16,
    lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
    fontWeight: '600',
    padding: 0,
    margin: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  inputSingleLine: {
    height: '100%',
  },
  suffixContainer: {
    marginLeft: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  suffixText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    fontWeight: '500',
  },
  errorMessage: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
