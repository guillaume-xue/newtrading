// components/features/market/components/ChartToolbar.tsx
'use client';

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Image from 'next/image';

import pencilIcon from '@/assets/icons/fi-rr-pencil.svg';
import crossIcon from '@/assets/icons/cross.svg';
import drawPolygonIcon from '@/assets/icons/draw-polygon 1.svg';
import statsIcon from '@/assets/icons/stats.svg';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export type ChartTool = 'cursor' | 'trendline';

interface ChartToolbarProps {
  themeMode?: 'dark' | 'light';
  activeTool: ChartTool;
  onSelectTool: (tool: ChartTool) => void;
  showPositions: boolean;
  onTogglePositions: () => void;
  onClearDrawings: () => void;
  hasDrawings?: boolean;
}

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  themeMode = 'dark',
  activeTool,
  onSelectTool,
  showPositions,
  onTogglePositions,
  onClearDrawings,
  hasDrawings = false,
}) => {
  const colors = themeMode === 'dark' ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.toolbarContainer,
        {
          backgroundColor: colors['colors_bg_secondary'],
          borderColor: colors['colors_divider_text'],
        },
      ]}
    >
      {/* Outil 1 : Curseur standard */}
      <TouchableOpacity
        style={[
          styles.toolButton,
          activeTool === 'cursor' && {
            backgroundColor: colors['colors_button_ghost'],
            borderColor: colors['colors_button_ghost-border'] ?? colors['colors_divider_text'],
          },
        ]}
        onPress={() => onSelectTool('cursor')}
        accessibilityLabel="Curseur standard"
        activeOpacity={0.7}
      >
        <Image
          src={drawPolygonIcon}
          alt="Curseur"
          width={18}
          height={18}
          style={{
            filter:
              activeTool === 'cursor'
                ? themeMode === 'dark'
                  ? 'brightness(0) invert(1)'
                  : 'brightness(0)'
                : 'brightness(0) opacity(0.6)',
          }}
        />
      </TouchableOpacity>

      {/* Outil 2 : Ligne de tendance */}
      <TouchableOpacity
        style={[
          styles.toolButton,
          activeTool === 'trendline' && {
            backgroundColor: colors['colors_button_ghost'],
            borderColor: colors['colors_button_ghost-border'] ?? colors['colors_divider_text'],
          },
        ]}
        onPress={() => onSelectTool('trendline')}
        accessibilityLabel="Tracer une ligne de tendance"
        activeOpacity={0.7}
      >
        <Image
          src={pencilIcon}
          alt="Ligne de tendance"
          width={18}
          height={18}
          style={{
            filter:
              activeTool === 'trendline'
                ? themeMode === 'dark'
                  ? 'brightness(0) invert(1)'
                  : 'brightness(0)'
                : 'brightness(0) opacity(0.6)',
          }}
        />
      </TouchableOpacity>

      <View
        style={[
          styles.separator,
          { backgroundColor: colors['colors_divider_text'] },
        ]}
      />

      {/* Outil 3 : Toggle affichage des positions (Long/Short) */}
      <TouchableOpacity
        style={[
          styles.toolButton,
          showPositions && {
            backgroundColor:
              themeMode === 'dark' ? 'rgba(5, 150, 105, 0.2)' : 'rgba(5, 150, 105, 0.1)',
            borderColor: colors['colors_badge_border'] ?? colors['colors_divider_text'],
          },
        ]}
        onPress={onTogglePositions}
        accessibilityLabel="Afficher/Masquer les positions"
        activeOpacity={0.7}
      >
        <Image
          src={statsIcon}
          alt="Positions"
          width={18}
          height={18}
          style={{
            filter: showPositions
              ? 'invert(48%) sepia(79%) saturate(542%) hue-rotate(113deg) brightness(92%) contrast(97%)' // Teinte verte
              : 'brightness(0) opacity(0.6)',
          }}
        />
      </TouchableOpacity>

      {/* Outil 4 : Effacer les annotations */}
      <TouchableOpacity
        style={[
          styles.toolButton,
          !hasDrawings && styles.disabledButton,
        ]}
        onPress={onClearDrawings}
        disabled={!hasDrawings}
        accessibilityLabel="Effacer les tracés"
        activeOpacity={0.7}
      >
        <Image
          src={crossIcon}
          alt="Effacer"
          width={16}
          height={16}
          style={{
            filter: hasDrawings
              ? 'invert(31%) sepia(87%) saturate(3061%) hue-rotate(345deg) brightness(92%) contrast(95%)' // Teinte rouge
              : 'brightness(0) opacity(0.2)',
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbarContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 20,
    flexDirection: 'column',
    alignItems: 'center',
    padding: primitives['spacing & layout_padding & margin_space-1'],
    borderRadius: primitives['spacing & layout_border radius_radius-md'],
    borderWidth: primitives['border width_border-thin'],
    gap: primitives['spacing & layout_padding & margin_space-1'],
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  toolButton: {
    width: 36,
    height: 36,
    borderRadius: primitives['spacing & layout_border radius_radius-sm'],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.4,
  },
  separator: {
    width: 24,
    height: primitives['border width_border-thin'],
    marginVertical: 2,
    opacity: 0.5,
  },
});

export default ChartToolbar;
