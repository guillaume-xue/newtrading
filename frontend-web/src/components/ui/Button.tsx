// components/ui/Button.tsx
import React, { useMemo } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp, // <-- Ajout de StyleProp
} from 'react-native';
import Image from 'next/image';

import GoogleIconSource from '@/assets/icons/google.svg';
import AppleIconSource from '@/assets/icons/apple.svg';
import EmailIconSource from '@/assets/icons/e-mail.svg';

import { useAppTheme } from '@/theme/ThemeContext';

export const BUTTON_ICONS = {
  google: GoogleIconSource,
  apple: AppleIconSource,
  email: EmailIconSource,
} as const;

export type ButtonIconPreset = keyof typeof BUTTON_ICONS;
export type ButtonIconProp = ButtonIconPreset | React.ReactNode;

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'buy'
  | 'sell'
  | 'ghost'
  | 'inverse';

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
  leftIcon?: ButtonIconProp;
  rightIcon?: ButtonIconProp;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>; // <-- Permet de passer des objets ou des tableaux de styles []
  labelStyle?: StyleProp<TextStyle>; // <-- Permet de passer des objets ou des tableaux de styles []
  roundedSide?: RoundedSide;
}

const COLORED_BUTTON_ICONS = new Set<ButtonIconPreset>(['google']);

export const Button: React.FC<ButtonProps> = ({
  label,
  subtitle,
  onPress,
  variant = 'primary',
  shape = 'rounded',
  size = 'md',
  bordered,
  leftIcon,
  rightIcon,
  disabled = false,
  loading = false,
  roundedSide = 'all',
  style,
  labelStyle,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const hasBorder = bordered !== undefined ? bordered : variant === 'outline';
  const borderWidth = hasBorder
    ? primitives['border width_border-thin'] ?? 1
    : 0;

  const radius = useMemo(() => {
    return shape === 'pill'
      ? primitives['spacing & layout_border radius_radius-full'] ?? 9999
      : primitives['spacing & layout_border radius_radius-md'] ?? 8;
  }, [shape, primitives]);

  const radiusStyle = useMemo<ViewStyle>(() => {
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
  }, [roundedSide, radius]);

  const variantStyle = useMemo(() => {
    if (disabled) {
      return {
        backgroundColor: colors['colors_button_desable'],
        borderColor: colors['colors_button_desable-border'],
        borderWidth,
        textColor: colors['colors_button_desable-text'],
        subtitleColor: colors['colors_button_desable-text'],
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors['colors_button_primary'],
          borderColor: colors['colors_button_primary-border'],
          borderWidth,
          textColor: colors['colors_button_primary-text'],
          subtitleColor: colors['colors_button_primary-text'],
        };
      case 'secondary':
        return {
          backgroundColor: colors['colors_button_secondary'],
          borderColor: colors['colors_button_secondary-border'],
          borderWidth,
          textColor: colors['colors_button_secondary-text'],
          subtitleColor: colors['colors_button_secondary-text'],
        };
      case 'outline':
      case 'inverse':
        return {
          backgroundColor: colors['colors_button_outline'],
          borderColor: colors['colors_button_outline-border'],
          borderWidth,
          textColor: colors['colors_button_outline-text'],
          subtitleColor: colors['colors_button_outline-text'],
        };
      case 'buy':
        return {
          backgroundColor: colors['colors_button_buy'],
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: primitives['color_neutral_0'] ?? '#ffffff',
          subtitleColor: colors['colors_button_buy-text'],
        };
      case 'sell':
        return {
          backgroundColor: colors['colors_button_sell'],
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: primitives['color_neutral_0'] ?? '#ffffff',
          subtitleColor: colors['colors_button_sell-text'],
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: colors['colors_button_ghost-text'],
          subtitleColor: colors['colors_button_ghost-text'],
        };
    }
  }, [colors, primitives, variant, disabled, borderWidth]);

  const isTextLight =
    variantStyle.textColor.toLowerCase() === '#ffffff' ||
    variantStyle.textColor.toLowerCase() === primitives['color_neutral_0'].toLowerCase();

  const iconFilter = isTextLight ? 'brightness(0) invert(1)' : 'brightness(0)';

  const renderIcon = (icon: ButtonIconProp, sideStyle: ViewStyle) => {
    if (!icon) return null;

    if (typeof icon === 'string' && icon in BUTTON_ICONS) {
      const iconPreset = icon as ButtonIconPreset;
      return (
        <View style={sideStyle}>
          <Image
            src={BUTTON_ICONS[iconPreset]}
            width={20}
            height={20}
            alt=""
            style={COLORED_BUTTON_ICONS.has(iconPreset) ? undefined : { filter: iconFilter }}
          />
        </View>
      );
    }

    return <View style={sideStyle}>{icon as React.ReactNode}</View>;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[`size_${size}`],
        radiusStyle,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: hasBorder ? variantStyle.borderColor : 'transparent',
          borderWidth: variantStyle.borderWidth,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {renderIcon(leftIcon, styles.leftIcon)}

          <View style={styles.textContainer}>
            <Text
              style={[
                styles[`label_${size}`],
                { color: variantStyle.textColor },
                labelStyle,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>

            {subtitle ? (
              <Text
                style={[
                  styles[`subtitle_${size}`],
                  {
                    color: variantStyle.subtitleColor,
                    fontVariant: ['tabular-nums'],
                  },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>

          {renderIcon(rightIcon, styles.rightIcon)}
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
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  size_sm: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 32,
  },
  size_md: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  size_lg: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  label_sm: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  label_md: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  label_lg: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle_sm: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  subtitle_md: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  subtitle_lg: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Button;
