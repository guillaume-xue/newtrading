'use client';

import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
} from 'react-native';
import Image from 'next/image';

import plusIcon from '@/assets/icons/fi-rr-plus.svg';
import pencilIcon from '@/assets/icons/fi-rr-pencil.svg';
import textIcon from '@/assets/icons/text 1.svg';
import polygonIcon from '@/assets/icons/draw-polygon 2.svg';
import slidersIcon from '@/assets/icons/settings-sliders 1.svg';

export type ChartTool = 'crosshair' | 'trendline' | 'text' | 'shape' | 'settings';

interface ChartToolbarProps {
  activeTool: ChartTool;
  onSelectTool: (tool: ChartTool) => void;
  /** Position de départ optionnelle */
  initialX?: number;
  initialY?: number;
}

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  activeTool,
  onSelectTool,
  initialX = 12,
  initialY = 16,
}) => {
  // Valeurs animées pour les coordonnées X et Y
  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;

  // Gestionnaire de drag
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Se déclenche uniquement s'il y a un mouvement réel (> 2px) pour ne pas bloquer les clics boutons
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          // @ts-ignore
          x: pan.x._value,
          // @ts-ignore
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  const tools: { id: ChartTool; icon: any; label: string }[] = [
    { id: 'crosshair', icon: plusIcon, label: 'Curseur' },
    { id: 'trendline', icon: pencilIcon, label: 'Tracé' },
    { id: 'text', icon: textIcon, label: 'Texte' },
    { id: 'shape', icon: polygonIcon, label: 'Formes' },
    { id: 'settings', icon: slidersIcon, label: 'Réglages' },
  ];

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.draggableContainer,
        {
          transform: pan.getTranslateTransform(),
        },
      ]}
    >
      {/* Poignée visuelle de déplacement (Drag Handle) */}
      <View style={styles.dragHandle}>
        <View style={styles.dragDot} />
        <View style={styles.dragDot} />
      </View>

      {/* Liste des boutons d'outils */}
      {tools.map((tool) => (
        <TouchableOpacity
          key={tool.id}
          style={[
            styles.toolBtn,
            activeTool === tool.id && styles.activeBtn,
          ]}
          onPress={() => onSelectTool(tool.id)}
          accessibilityLabel={tool.label}
          activeOpacity={0.7}
        >
          <Image
            src={tool.icon}
            alt={tool.label}
            width={18}
            height={18}
            style={{ filter: 'brightness(0) opacity(0.8)' }}
          />
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  draggableContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 50,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // Ombre douce pour matérialiser l'élément flottant
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    cursor: 'grab',
  } as any,
  dragHandle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
    marginBottom: 2,
  },
  dragDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
  },
  toolBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBtn: {
    backgroundColor: '#E5E7EB',
  },
});

export default ChartToolbar;
