import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Pressable,
  Platform,
  useColorScheme,
  Animated,
} from 'react-native';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(
    (value !== undefined ? value : defaultValue) ?? ''
  );
  const inputRef = useRef<TextInput>(null);

  // Valeur d'animation : 0 = état inactif/vide (centré), 1 = état actif/rempli (flottant en haut)
  const isFilled = (value !== undefined ? String(value) : String(internalValue)).length > 0;
  const isFloating = isFocused || isFilled;
  const animatedValue = useRef(new Animated.Value(isFloating ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFloating ? 1 : 0,
      duration: 180,
      useNativeDriver: false, // Nécessaire car interpolation sur fontSize / top
    }).start();
  }, [isFloating, animatedValue]);

  // Synchronisation de la valeur interne si non contrôlée
  const handleChangeText = (text: string) => {
    if (value === undefined) {
      setInternalValue(text);
    }
    onChangeText?.(text);
  };

  const hasError = Boolean(error) || Boolean(errorMessage);
  const resolvedErrorMessage = typeof error === 'string' ? error : errorMessage;

  const getBorderColor = () => {
    if (hasError) return theme['colors_input_warning-border'];
    if (isFocused) return theme['colors_input_select-border'];
    return theme['colors_input_primary-border'];
  };

  const getLabelColor = () => {
    if (hasError) return theme['colors_input_warning-text'];
    if (isFocused) return theme['colors_input_select-text'];
    return theme['colors_input_secondary-text'];
  };

  // Interpolations pour l'animation
  // Le label passe d'un centrage vertical (16px du haut) à sa position haute (6px du haut)
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
            backgroundColor: theme['colors_input_primary-bg'],
            borderColor: getBorderColor(),
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
                  color: getLabelColor(),
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
            style={[
              styles.input,
              { color: theme['colors_input_primary-text'] },
              // Descend le texte lorsque le label est affiché pour éviter tout chevauchement
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
                  { color: theme['colors_input_secondary-text'] },
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
            { color: theme['colors_input_warning-text'] },
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
    marginBottom: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
  },
  container: {
    height: 56, // Hauteur fixe standard pour garantir l'alignement du label
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
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
    fontSize: primitives['typography_font size_font-size-16'] ?? 16,
    lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
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
    marginTop: 16, // Crée l'espace nécessaire sous le petit label
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
    lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});
