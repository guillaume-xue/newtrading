// components/WidgetHeader.tsx
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.title,
          { color: theme['colors_text_primary'] ?? '#0B0F19' },
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
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.pressed,
          ]}
        >
          {/* Trois points horizontaux alignés */}
          <View style={styles.dotsRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: theme['colors_text_primary'] ?? '#0B0F19' },
              ]}
            />
            <View
              style={[
                styles.dot,
                { backgroundColor: theme['colors_text_primary'] ?? '#0B0F19' },
              ]}
            />
            <View
              style={[
                styles.dot,
                { backgroundColor: theme['colors_text_primary'] ?? '#0B0F19' },
              ]}
            />
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
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
  },
  title: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '800',
    letterSpacing: -0.2,
    textTransform: 'uppercase',
  },
  menuButton: {
    padding: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
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
