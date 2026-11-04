// components/ui/WidgetHeader.tsx
'use client';

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { useAppTheme } from '@/theme/ThemeContext';

export interface WidgetHeaderProps {
  /**
   * Titre du widget (ex: "ORDER ENTRY")
   */
  title: string;
  /**
   * Action au clic sur le bouton de menu (...)
   */
  onMenuPress?: () => void;
  /**
   * Élément d'action optionnel personnalisé à droite (remplace les trois points si fourni)
   */
  rightAction?: React.ReactNode;
  /**
   * Style personnalisé pour le conteneur
   */
  style?: ViewStyle;
  /**
   * Style personnalisé pour le texte
   */
  titleStyle?: TextStyle;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  title,
  onMenuPress,
  rightAction,
  style,
  titleStyle,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const titleColor = colors['colors_text_primary'];
  const dotColor = colors['colors_text_secondary'];

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: titleColor,
            fontSize: primitives['typography_font size_font-size-14'] ?? 14,
            lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
          },
          titleStyle,
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {rightAction ? (
        rightAction
      ) : (
        <Pressable
          onPress={onMenuPress}
          hitSlop={8}
          accessibilityLabel="Options du widget"
          style={({ pressed }) => [
            styles.menuButton,
            {
              padding: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
            },
            pressed && styles.pressed,
          ]}
        >
          {/* Trois points horizontaux alignés */}
          <View style={styles.dotsRow}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
          </View>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.2,
    textTransform: 'uppercase',
  },
  menuButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default WidgetHeader;
