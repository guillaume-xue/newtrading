'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import Image from 'next/image';

import Stats from '@/assets/icons/stats.svg';
import ChatArrowGrow from '@/assets/icons/chat-arrow-grow.svg';

import { useAppTheme } from '@/theme/ThemeContext';
import { primitives } from '@/theme/generated/primitives';

export interface SwitchProps {
  value: 'left' | 'right';
  onChange: (value: 'left' | 'right') => void;
  disabled?: boolean;
}

const SWITCH_WIDTH = 96;
const SWITCH_HEIGHT = 48;
const PADDING = 4;
const THUMB_WIDTH = (SWITCH_WIDTH - PADDING * 2) / 2; // 44px
const THUMB_HEIGHT = SWITCH_HEIGHT - PADDING * 2;     // 40px
const TRANSLATE_DISTANCE = THUMB_WIDTH;               // 44px

export const Switch: React.FC<SwitchProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { theme } = useAppTheme();
  const { colors, isDark } = theme;

  // 0 = gauche, 1 = droite
  const animatedValue = useRef(new Animated.Value(value === 'left' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value === 'left' ? 0 : 1,
      damping: 18,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [value, animatedValue]);

  // Interpolation de la position X
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRANSLATE_DISTANCE],
  });

  const iconFilter = useMemo(() => {
    return isDark ? 'brightness(0) invert(1)' : 'brightness(0)';
  }, [isDark]);

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: colors['colors_button_ghost'],
        },
      ]}
    >
      {/* Curseur coulissant */}
      <Animated.View
        style={[
          styles.thumb,
          {
            backgroundColor: colors['colors_bg_secondary'],
            transform: [{ translateX }],
          },
        ]}
      />

      {/* Segment Option Gauche (Histogramme) */}
      <Pressable
        onPress={() => onChange('left')}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'left' }}
        style={styles.segment}
      >
        <Image
          src={Stats}
          width={20}
          height={20}
          alt="Vue graphique barres"
          style={{ ...styles.icon, filter: iconFilter }}
        />
      </Pressable>

      {/* Segment Option Droite (Courbe de tendance) */}
      <Pressable
        onPress={() => onChange('right')}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'right' }}
        style={styles.segment}
      >
        <Image
          src={ChatArrowGrow}
          width={20}
          height={20}
          alt="Vue graphique linéaire"
          style={{ ...styles.icon, filter: iconFilter }}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 14,
    padding: PADDING,
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: (primitives['spacing & layout_border radius_radius-md'] ?? 14) - 2,
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
      } as any,
      default: {
        elevation: 2,
      },
    }),
  },
  segment: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Switch;
