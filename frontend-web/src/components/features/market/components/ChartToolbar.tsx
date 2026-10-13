'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import Image from 'next/image';

import plusIcon from '@/assets/icons/fi-rr-plus.svg';
import pencilIcon from '@/assets/icons/fi-rr-pencil.svg';
import textIcon from '@/assets/icons/text 1.svg';
import polygonIcon from '@/assets/icons/draw-polygon 2.svg';
import fibonaciLineIcon from '@/assets/icons/fibonaci.svg';
import lineIcon from '@/assets/icons/line.svg';

export type ChartTool = 'crosshair' | 'line' | 'trendline' | 'text' | 'shape' | 'fibo';

interface ChartToolbarProps {
  activeTool: ChartTool;
  onSelectTool: (tool: ChartTool) => void;
  initialX?: number;
  initialY?: number;
  bounds?: { width: number; height: number };
}

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  activeTool,
  onSelectTool,
  initialX = 12,
  initialY = 16,
  bounds,
}) => {
  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
  const currentPos = useRef({ x: initialX, y: initialY });
  const startDragPos = useRef({ x: initialX, y: initialY });
  const toolbarSize = useRef({ width: 42, height: 260 });
  const isDragging = useRef(false);

  // Sécurité Web : si la souris est relâchée hors de l'écran, réinitialiser l'état
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        pan.setValue({ x: currentPos.current.x, y: currentPos.current.y });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointerup', handleGlobalMouseUp);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointerup', handleGlobalMouseUp);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      }
    };
  }, [pan]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
        },
        onPanResponderGrant: () => {
          isDragging.current = true;
          startDragPos.current = { ...currentPos.current };
        },
        onPanResponderMove: (_, gestureState) => {
          let targetX = startDragPos.current.x + gestureState.dx;
          let targetY = startDragPos.current.y + gestureState.dy;

          if (bounds && bounds.width > 0 && bounds.height > 0) {
            const maxX = Math.max(0, bounds.width - toolbarSize.current.width);
            const maxY = Math.max(0, bounds.height - toolbarSize.current.height);
            targetX = Math.min(Math.max(0, targetX), maxX);
            targetY = Math.min(Math.max(0, targetY), maxY);
          }

          currentPos.current = { x: targetX, y: targetY };
          pan.setValue({ x: targetX, y: targetY });
        },
        onPanResponderRelease: () => {
          isDragging.current = false;
          pan.setValue({ x: currentPos.current.x, y: currentPos.current.y });
        },
        onPanResponderTerminate: () => {
          isDragging.current = false;
          pan.setValue({ x: currentPos.current.x, y: currentPos.current.y });
        },
      }),
    [bounds, pan]
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      toolbarSize.current = { width, height };
    }
  };

  const tools: { id: ChartTool; icon: typeof plusIcon; label: string }[] = [
    { id: 'crosshair', icon: plusIcon, label: 'Curseur' },
    { id: 'line', icon: lineIcon, label: 'Ligne' },
    { id: 'trendline', icon: pencilIcon, label: 'Tracé' },
    { id: 'text', icon: textIcon, label: 'Texte' },
    { id: 'shape', icon: polygonIcon, label: 'Formes' },
    { id: 'fibo', icon: fibonaciLineIcon, label: 'Fibonacci' },
  ];

  return (
    <Animated.View
      onLayout={handleLayout}
      {...panResponder.panHandlers}
      style={[
        styles.draggableContainer,
        {
          transform: pan.getTranslateTransform(),
        },
      ]}
    >
      <View style={styles.dragHandle}>
        <View style={styles.dragDot} />
        <View style={styles.dragDot} />
      </View>

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
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  dragHandle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
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
