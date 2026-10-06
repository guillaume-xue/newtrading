// src/components/Switch.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  Easing,
  useColorScheme,
} from 'react-native';
import Image from 'next/image';

import Stats from '@/assets/icons/stats.svg';
import ChatArrowGrow from '@/assets/icons/chat-arrow-grow.svg';

import { lightColors } from '@/theme/generated/light';
import { darkColors } from '@/theme/generated/dark';
import { primitives } from '@/theme/generated/primitives';

export interface SwitchProps {
  value: 'left' | 'right';
  onChange: (value: 'left' | 'right') => void;
  disabled?: boolean;
}

const SWITCH_WIDTH = 96;
const SWITCH_HEIGHT = 48;
const PADDING = 4;
// Largeur exacte du curseur blanc
const THUMB_WIDTH = (SWITCH_WIDTH - PADDING * 2) / 2; // 44px
const THUMB_HEIGHT = SWITCH_HEIGHT - PADDING * 2;     // 40px

export const Switch: React.FC<SwitchProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  // 0 = gauche, 1 = droite
  const animatedValue = useRef(new Animated.Value(value === 'left' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value === 'left' ? 0 : 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // Fonctionne à 100% sur React Native Web et iOS
    }).start();
  }, [value]);

  // Interpolation de la position X
  const leftPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [PADDING, PADDING + THUMB_WIDTH],
  });

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: theme['colors_button_ghost'] ?? '#E6E9EE',
        },
      ]}
    >
      {/* Curseur blanc animé */}
      <Animated.View
        style={[
          styles.thumb,
          {
            left: leftPosition,
            backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
          },
        ]}
      />

      {/* Option Gauche */}
      <Pressable
        onPress={() => onChange('left')}
        disabled={disabled}
        style={styles.segment}
      >
        {<Image src={Stats} width={16} height={16} alt="" />}
      </Pressable>

      {/* Option Droite */}
      <Pressable
        onPress={() => onChange('right')}
        disabled={disabled}
        style={styles.segment}
      >
        {<Image src={ChatArrowGrow} width={16} height={16} alt="" />}
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
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: (primitives['spacing & layout_border radius_radius-md'] ?? 14) - 2,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.12)',
    elevation: 2,
  },
  segment: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Pour que les clics passent au-dessus du curseur
  },
});
