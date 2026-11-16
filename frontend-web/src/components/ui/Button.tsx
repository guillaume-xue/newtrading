// components/ui/Button.tsx
'use client';

import React, { useMemo, useCallback } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import Image from 'next/image';

import GoogleIconSource from '@/assets/icons/google.svg';
import AppleIconSource from '@/assets/icons/apple.svg';
import EmailIconSource from '@/assets/icons/e-mail.svg';

import { ThemeColors, PrimitivesTokens } from '@/theme';
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
  label?: string;
  subtitle?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  size?: ButtonSize;
  bordered?: boolean;
  leftIcon?: ButtonIconProp;
  rightIcon?: ButtonIconProp;
  closeButton?: boolean;
  backButton?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  roundedSide?: RoundedSide;
  accessibilityLabel?: string;
  hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number };
}

const COLORED_BUTTON_ICONS = new Set<ButtonIconPreset>(['google']);

interface ResolvedButtonVariantStyle {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  textColor: string;
  subtitleColor: string;
}

function resolveButtonRadiusStyle(
  shape: ButtonShape,
  roundedSide: RoundedSide,
  primitives: PrimitivesTokens
): ViewStyle {
  const baseRadius =
    shape === 'pill'
      ? primitives['spacing & layout_border radius_radius-full']
      : primitives['spacing & layout_border radius_radius-md'];

  switch (roundedSide) {
    case 'left':
      return {
        borderTopLeftRadius: baseRadius,
        borderBottomLeftRadius: baseRadius,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      };
    case 'right':
      return {
        borderTopRightRadius: baseRadius,
        borderBottomRightRadius: baseRadius,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      };
    case 'none':
      return { borderRadius: 0 };
    case 'all':
    default:
      return { borderRadius: baseRadius };
  }
}

function resolveButtonVariantStyle(
  variant: ButtonVariant,
  disabled: boolean,
  hasBorder: boolean,
  borderWidth: number,
  colors: ThemeColors,
  primitives: PrimitivesTokens
): ResolvedButtonVariantStyle {
  const effectiveBorderWidth = hasBorder ? borderWidth : 0;

  if (disabled) {
    return {
      backgroundColor: colors['colors_button_desable'],
      borderColor: hasBorder ? colors['colors_button_desable-border'] : 'transparent',
      borderWidth: effectiveBorderWidth,
      textColor: colors['colors_button_desable-text'],
      subtitleColor: colors['colors_button_desable-text'],
    };
  }

  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors['colors_button_primary'],
        borderColor: hasBorder ? colors['colors_button_primary-border'] : 'transparent',
        borderWidth: effectiveBorderWidth,
        textColor: colors['colors_button_primary-text'],
        subtitleColor: colors['colors_button_primary-text'],
      };
    case 'secondary':
      return {
        backgroundColor: colors['colors_button_secondary'],
        borderColor: hasBorder ? colors['colors_button_secondary-border'] : 'transparent',
        borderWidth: effectiveBorderWidth,
        textColor: colors['colors_button_secondary-text'],
        subtitleColor: colors['colors_button_secondary-text'],
      };
    case 'outline':
    case 'inverse':
      return {
        backgroundColor: colors['colors_button_outline'],
        borderColor: hasBorder ? colors['colors_button_outline-border'] : 'transparent',
        borderWidth: effectiveBorderWidth,
        textColor: colors['colors_button_outline-text'],
        subtitleColor: colors['colors_button_outline-text'],
      };
    case 'buy':
      return {
        backgroundColor: colors['colors_button_buy'],
        borderColor: hasBorder ? colors['colors_button_buy'] : 'transparent',
        borderWidth: effectiveBorderWidth,
        textColor: primitives['color_neutral_0'],
        subtitleColor: colors['colors_button_buy-text'],
      };
    case 'sell':
      return {
        backgroundColor: colors['colors_button_sell'],
        borderColor: hasBorder ? colors['colors_button_sell'] : 'transparent',
        borderWidth: effectiveBorderWidth,
        textColor: primitives['color_neutral_0'],
        subtitleColor: colors['colors_button_sell-text'],
      };
    case 'ghost':
    default:
      return {
        backgroundColor: colors['colors_button_ghost'],
        borderColor: hasBorder ? colors['colors_button_ghost-border'] : 'transparent',
        borderWidth: effectiveBorderWidth,
        textColor: colors['colors_button_ghost-text'],
        subtitleColor: colors['colors_button_ghost-text'],
      };
  }
}

interface ButtonIconProps {
  icon?: ButtonIconProp;
  sideStyle: ViewStyle;
  iconFilter: string;
}

const ButtonIcon: React.FC<ButtonIconProps> = React.memo(({ icon, sideStyle, iconFilter }) => {
  if (!icon) return null;

  if (typeof icon === 'string' && icon in BUTTON_ICONS) {
    const preset = icon as ButtonIconPreset;
    const isColored = COLORED_BUTTON_ICONS.has(preset);

    return (
      <View style={sideStyle}>
        <Image
          src={BUTTON_ICONS[preset]}
          width={20}
          height={20}
          alt=""
          style={isColored ? undefined : { filter: iconFilter }}
        />
      </View>
    );
  }

  return <View style={sideStyle}>{icon as React.ReactNode}</View>;
});
ButtonIcon.displayName = 'ButtonIcon';

const CloseCrossIcon: React.FC<{ color: string }> = React.memo(({ color }) => (
  <View style={styles.closeCrossIcon}>
    <View
      style={[
        styles.closeCrossLine,
        { backgroundColor: color, transform: [{ rotate: '45deg' }] },
      ]}
    />
    <View
      style={[
        styles.closeCrossLine,
        { backgroundColor: color, transform: [{ rotate: '-45deg' }] },
      ]}
    />
  </View>
));
CloseCrossIcon.displayName = 'CloseCrossIcon';

interface ButtonContentProps {
  label?: string;
  subtitle?: string;
  size: ButtonSize;
  leftIcon?: ButtonIconProp;
  rightIcon?: ButtonIconProp;
  iconFilter: string;
  variantStyle: ResolvedButtonVariantStyle;
  labelStyle?: StyleProp<TextStyle>;
}

const ButtonContent: React.FC<ButtonContentProps> = React.memo(
  ({ label, subtitle, size, leftIcon, rightIcon, iconFilter, variantStyle, labelStyle }) => (
    <View style={styles.contentRow}>
      <ButtonIcon icon={leftIcon} sideStyle={styles.leftIcon} iconFilter={iconFilter} />

      <View style={styles.textContainer}>
        {label ? (
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
        ) : null}

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

      <ButtonIcon icon={rightIcon} sideStyle={styles.rightIcon} iconFilter={iconFilter} />
    </View>
  )
);
ButtonContent.displayName = 'ButtonContent';

export const Button: React.FC<ButtonProps> = React.memo(
  ({
    label,
    subtitle,
    onPress,
    variant = 'primary',
    shape = 'rounded',
    size = 'md',
    bordered,
    leftIcon,
    rightIcon,
    closeButton = false,
    backButton = false,
    disabled = false,
    loading = false,
    roundedSide = 'all',
    style,
    labelStyle,
    accessibilityLabel,
    hitSlop,
  }) => {
    const { theme } = useAppTheme();
    const { colors, primitives } = theme;

    const isInteractive = !disabled && !loading;

    const hasBorder = useMemo(() => {
      if (bordered !== undefined) return bordered;
      if (closeButton || backButton) return false;
      return variant === 'outline' || variant === 'inverse';
    }, [bordered, closeButton, backButton, variant]);

    const borderWidth = primitives['border width_border-thin'];

    const radiusStyle = useMemo(
      () => resolveButtonRadiusStyle(shape, roundedSide, primitives),
      [shape, roundedSide, primitives]
    );

    const variantStyle = useMemo(
      () =>
        resolveButtonVariantStyle(
          (closeButton || backButton) && bordered === undefined ? 'ghost' : variant,
          disabled,
          hasBorder,
          borderWidth,
          colors,
          primitives
        ),
      [closeButton, backButton, bordered, variant, disabled, hasBorder, borderWidth, colors, primitives]
    );

    const iconFilter = useMemo(() => {
      const neutralZero = primitives['color_neutral_0'].toLowerCase();
      const currentText = variantStyle.textColor.toLowerCase();
      return currentText === '#ffffff' || currentText === neutralZero
        ? 'brightness(0) invert(1)'
        : 'brightness(0)';
    }, [variantStyle.textColor, primitives]);

    const getPressableStyle = useCallback(
      ({ pressed }: { pressed: boolean }): StyleProp<ViewStyle> => {
        if (backButton) {
          return [
            styles.backButtonBase,
            styles.webPointer,
            pressed && isInteractive && styles.pressed,
            style,
          ];
        }

        return [
          closeButton
            ? [styles.closeBase, styles.webPointer]
            : [styles.base, styles[`size_${size}`], styles.webPointer],
          radiusStyle,
          {
            backgroundColor: variantStyle.backgroundColor,
            borderColor: variantStyle.borderColor,
            borderWidth: variantStyle.borderWidth,
          },
          pressed && isInteractive && styles.pressed,
          style,
        ];
      },
      [backButton, closeButton, size, radiusStyle, variantStyle, isInteractive, style]
    );

    const resolvedAccessibilityLabel =
      accessibilityLabel ??
      label ??
      (backButton ? 'Retour' : closeButton ? 'Fermer' : undefined);

    if (backButton) {
      return (
        <Pressable
          onPress={onPress}
          disabled={!isInteractive}
          hitSlop={hitSlop ?? 12}
          accessibilityRole="button"
          accessibilityLabel={resolvedAccessibilityLabel}
          accessibilityState={{ disabled: !isInteractive, busy: loading }}
          style={getPressableStyle}
        >
          {loading ? (
            <ActivityIndicator color={colors['colors_text_secondary']} size="small" />
          ) : (
            <Text
              style={[
                styles.backButtonText,
                { color: colors['colors_text_secondary'] },
                labelStyle,
              ]}
              numberOfLines={1}
            >
              {label ?? '← Retour'}
            </Text>
          )}
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={onPress}
        disabled={!isInteractive}
        hitSlop={hitSlop ?? (closeButton ? 12 : undefined)}
        accessibilityRole="button"
        accessibilityLabel={resolvedAccessibilityLabel}
        accessibilityState={{ disabled: !isInteractive, busy: loading }}
        style={getPressableStyle}
      >
        {loading ? (
          <ActivityIndicator color={variantStyle.textColor} size="small" />
        ) : closeButton ? (
          <CloseCrossIcon color={variantStyle.textColor} />
        ) : (
          <ButtonContent
            label={label}
            subtitle={subtitle}
            size={size}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            iconFilter={iconFilter}
            variantStyle={variantStyle}
            labelStyle={labelStyle}
          />
        )}
      </Pressable>
    );
  }
);
Button.displayName = 'Button';

const styles = StyleSheet.create({
  webPointer: Platform.select({
    web: { cursor: 'pointer' },
    default: {},
  }) as ViewStyle,
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonBase: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  closeBase: {
    width: 28,
    height: 28,
    minWidth: 28,
    minHeight: 28,
    paddingVertical: 0,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeCrossIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  closeCrossLine: {
    position: 'absolute',
    width: 16,
    height: 1.5,
    borderRadius: 1,
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
