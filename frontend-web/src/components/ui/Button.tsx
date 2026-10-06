// components/Button.tsx
import React from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import Image from 'next/image';

import GoogleIconSource from '@/assets/icons/google.svg';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'buy'| 'sell' | 'ghost' | 'inverse';
export type ButtonShape = 'rounded' | 'pill';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type RoundedSide = 'all' | 'left' | 'right' | 'none';

export interface ButtonProps {
  label: string;
  subtitle?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  size?: ButtonSize;
  bordered?: boolean;
  leftIcon?: boolean;
  rightIcon?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  roundedSide?: RoundedSide;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  subtitle,
  onPress,
  variant = 'primary',
  shape = 'rounded',
  size = 'md',
  bordered,
  leftIcon = false,
  rightIcon = false,
  disabled = false,
  loading = false,
  roundedSide = 'all',
  style,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const hasBorder = bordered !== undefined ? bordered : variant === 'outline';
  const borderWidth = hasBorder ? (primitives['border width_border-thin'] ?? 1) : 0;

  // 1. Rayon dynamique selon la forme choisie (pill vs rounded)
  const radius =
    shape === 'pill'
      ? (primitives['spacing & layout_border radius_radius-full'] ?? 9999)
      : (primitives['spacing & layout_border radius_radius-md'] ?? 8);

  // 2. Application du rayon selon le côté demandé
  const getRadiusStyle = (): ViewStyle => {
    switch (roundedSide) {
      case 'left':
        return {
          borderTopLeftRadius: radius,
          borderBottomLeftRadius: radius,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        };
      case 'right':
        return {
          borderTopRightRadius: radius,
          borderBottomRightRadius: radius,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        };
      case 'none':
        return { borderRadius: 0 };
      case 'all':
      default:
        return { borderRadius: radius };
    }
  };

  const getVariantStyles = () => {
    if (disabled) {
      return {
        backgroundColor: theme['colors_button_desable'],
        borderColor: theme['colors_button_desable-border'],
        borderWidth: borderWidth,
        textColor: theme['colors_button_desable-text'],
        subtitleColor: theme['colors_button_desable-text'],
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme['colors_button_primary'],
          borderColor: theme['colors_button_primary-border'],
          borderWidth: borderWidth,
          textColor: theme['colors_button_primary-text'],
          subtitleColor: theme['colors_button_primary-text'],
        };
      case 'secondary':
        return {
          backgroundColor: theme['colors_button_secondary'],
          borderColor: theme['colors_button_secondary-border'],
          borderWidth: borderWidth,
          textColor: theme['colors_button_secondary-text'],
          subtitleColor: theme['colors_button_secondary-text'],
        };
      case 'outline':
        return {
          backgroundColor: theme['colors_button_outline'],
          borderColor: theme['colors_button_outline-border'],
          borderWidth: borderWidth,
          textColor: theme['colors_button_outline-text'],
          subtitleColor: theme['colors_button_outline-text'],
        };
      case 'buy':
        return {
          backgroundColor: theme['colors_button_buy'],
          borderColor: 'transparent',
          borderWidth: borderWidth,
          textColor: '#ffffff',
          subtitleColor: theme['colors_button_buy-text'],
        };
      case 'sell':
        return {
          backgroundColor: theme['colors_button_sell'],
          borderColor: 'transparent',
          borderWidth: borderWidth,
          textColor: '#ffffff',
          subtitleColor: theme['colors_button_sell-text'],
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: borderWidth,
          textColor: theme['colors_button_ghost-text'],
          subtitleColor: theme['colors_button_ghost-text'],
        };
      case 'inverse':
        return {
          backgroundColor: theme['colors_button_outline'],
          borderColor: theme['colors_button_outline-border'],
          borderWidth: borderWidth,
          textColor: theme['colors_button_outline-text'],
          subtitleColor: theme['colors_button_outline-text'],
        };
    }
  };

  const currentTheme = getVariantStyles();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[`size_${size}`],
        getRadiusStyle(), // Injecte dynamiquement les bons coins et le bon rayon
        {
          backgroundColor: currentTheme.backgroundColor,
          borderColor: hasBorder ? currentTheme.borderColor : 'transparent',
          borderWidth: borderWidth,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={currentTheme.textColor} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <Image src={GoogleIconSource} width={24} height={24} alt="" style={styles.leftIcon} />}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles[`label_${size}`],
                { color: currentTheme.textColor },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>

            {subtitle ? (
              <Text
                style={[
                  styles[`subtitle_${size}`],
                  { color: currentTheme.subtitleColor },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
          {rightIcon && <Image src={GoogleIconSource} width={24} height={24} alt="" style={styles.rightIcon} />}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: primitives['spacing & layout_padding & margin_space-2'],
  },
  rightIcon: {
    marginLeft: primitives['spacing & layout_padding & margin_space-2'],
  },

  // Tailles
  size_sm: {
    paddingVertical: primitives['spacing & layout_padding & margin_space-1'],
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-2'],
    minHeight: 32,
  },
  size_md: {
    paddingVertical: primitives['spacing & layout_padding & margin_space-1'],
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'],
    minHeight: 44,
  },
  size_lg: {
    paddingVertical: primitives['spacing & layout_padding & margin_space-3'],
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-6'],
    minHeight: 56,
  },

  // États
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  // Typographie label
  label_sm: {
    fontSize: primitives['typography_font size_font-size-12'],
    lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  label_md: {
    fontSize: primitives['typography_font size_font-size-14'],
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  label_lg: {
    fontSize: primitives['typography_font size_font-size-16'],
    lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Typographie sous-titre
  subtitle_sm: {
    fontSize: primitives['typography_font size_font-size-10'],
    lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
    fontWeight: '500',
    textAlign: 'center',
  },
  subtitle_md: {
    fontSize: primitives['typography_font size_font-size-12'],
    lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  subtitle_lg: {
    fontSize: primitives['typography_font size_font-size-12'],
    lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
    fontWeight: '500',
    textAlign: 'center',
  },
});
