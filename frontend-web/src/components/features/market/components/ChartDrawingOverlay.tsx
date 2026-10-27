'use client';

// components/features/market/components/ChartDrawingOverlay.tsx
import React, { useRef, useEffect } from 'react';
import { MarketDrawing, BaseDrawingPoint } from '@/types/drawing';
import { ChartTool } from '@/components/features/market/components/ChartToolbar';
import { FIBO_LEVELS, createSmoothSvgPath } from '@/utils/chartPath';
import { useAppTheme } from '@/theme/ThemeContext';

interface ChartDrawingOverlayProps {
  isDrawingActive: boolean;
  drawings: MarketDrawing[];
  currentScreenDraft: { x1: number; y1: number; x2: number; y2: number; type: ChartTool } | null;
  inlineEditor: { screenX: number; screenY: number; marketPoint: BaseDrawingPoint; text: string } | null;
  livePencilPathRef: React.RefObject<SVGPathElement | null>;
  getScreenCoordinates: (point: BaseDrawingPoint) => { x: number; y: number } | null;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  onInlineTextChange: (text: string) => void;
  onCommitInlineText: () => void;
  onCancelInlineText: () => void;
}

export const ChartDrawingOverlay: React.FC<ChartDrawingOverlayProps> = ({
  isDrawingActive,
  drawings,
  currentScreenDraft,
  inlineEditor,
  livePencilPathRef,
  getScreenCoordinates,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onInlineTextChange,
  onCommitInlineText,
  onCancelInlineText,
}) => {
  const { theme } = useAppTheme();
  const { colors, isDark } = theme;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inlineEditor) {
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [inlineEditor]);

  const primaryStroke = colors['colors_badge_primary-action-bg'];
  const textColor = colors['colors_text_primary'];
  const textMuted = colors['colors_text_secondary'];
  const fiboStroke = isDark ? '#A78BFA' : '#8B5CF6';
  const fiboDraftStroke = isDark ? '#7C3AED' : '#C4B5FD';

  const renderFibo = (c1: { x: number; y: number }, c2: { x: number; y: number }, key: string, isDraft = false) => {
    const height = c2.y - c1.y;
    const minX = Math.min(c1.x, c2.x);
    const maxX = Math.max(c1.x, c2.x);

    return (
      <g key={key}>
        {FIBO_LEVELS.map((level) => {
          const currentY = c1.y + height * level;
          return (
            <g key={level}>
              <line
                x1={minX}
                y1={currentY}
                x2={maxX}
                y2={currentY}
                stroke={isDraft ? fiboDraftStroke : fiboStroke}
                strokeWidth={1}
                strokeDasharray={level === 0 || level === 1 ? undefined : '3 3'}
              />
              <text x={maxX + 4} y={currentY + 3} fill={isDraft ? fiboDraftStroke : fiboStroke} fontSize={10}>
                {level}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 15,
        cursor: isDrawingActive ? 'crosshair' : 'default',
        pointerEvents: isDrawingActive ? 'all' : 'none',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <svg width="100%" height="100%" style={{ display: 'block' }}>
        {drawings.map((d) => {
          if (d.type === 'line') {
            const c1 = getScreenCoordinates(d.p1);
            const c2 = getScreenCoordinates(d.p2);
            if (!c1 || !c2) return null;
            return <line key={d.id} x1={c1.x} y1={c1.y} x2={c2.x} y2={c2.y} stroke={primaryStroke} strokeWidth={2} />;
          }

          if (d.type === 'trendline') {
            const anchor = getScreenCoordinates(d.anchor);
            if (!anchor) return null;
            const screenPoints = d.offsets.map((pt) => ({ x: anchor.x + pt.dx, y: anchor.y + pt.dy }));
            return (
              <path
                key={d.id}
                d={createSmoothSvgPath(screenPoints)}
                fill="none"
                stroke={fiboStroke}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          }

          if (d.type === 'shape') {
            const c1 = getScreenCoordinates(d.p1);
            const c2 = getScreenCoordinates(d.p2);
            if (!c1 || !c2) return null;
            return (
              <rect
                key={d.id}
                x={Math.min(c1.x, c2.x)}
                y={Math.min(c1.y, c2.y)}
                width={Math.abs(c2.x - c1.x)}
                height={Math.abs(c2.y - c1.y)}
                fill={isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.12)'}
                stroke={primaryStroke}
                strokeWidth={1.5}
              />
            );
          }

          if (d.type === 'text') {
            const c = getScreenCoordinates(d.point);
            if (!c) return null;
            return (
              <text key={d.id} x={c.x} y={c.y} fill={textColor} fontSize={13} fontWeight="600" style={{ userSelect: 'none' }}>
                {d.text}
              </text>
            );
          }

          if (d.type === 'fibo') {
            const c1 = getScreenCoordinates(d.p1);
            const c2 = getScreenCoordinates(d.p2);
            if (!c1 || !c2) return null;
            return renderFibo(c1, c2, d.id, false);
          }

          return null;
        })}

        {/* Tracé en direct */}
        <path
          ref={livePencilPathRef as React.RefObject<SVGPathElement>}
          fill="none"
          stroke={fiboStroke}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {currentScreenDraft?.type === 'line' && (
          <line
            x1={currentScreenDraft.x1}
            y1={currentScreenDraft.y1}
            x2={currentScreenDraft.x2}
            y2={currentScreenDraft.y2}
            stroke={isDark ? '#93C5FD' : '#60A5FA'}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        )}

        {currentScreenDraft?.type === 'shape' && (
          <rect
            x={Math.min(currentScreenDraft.x1, currentScreenDraft.x2)}
            y={Math.min(currentScreenDraft.y1, currentScreenDraft.y2)}
            width={Math.abs(currentScreenDraft.x2 - currentScreenDraft.x1)}
            height={Math.abs(currentScreenDraft.y2 - currentScreenDraft.y1)}
            fill={isDark ? 'rgba(147, 197, 253, 0.25)' : 'rgba(96, 165, 250, 0.2)'}
            stroke={isDark ? '#93C5FD' : '#60A5FA'}
            strokeDasharray="4 4"
          />
        )}

        {currentScreenDraft?.type === 'fibo' &&
          renderFibo(
            { x: currentScreenDraft.x1, y: currentScreenDraft.y1 },
            { x: currentScreenDraft.x2, y: currentScreenDraft.y2 },
            'draft-fibo',
            true
          )}
      </svg>

      {/* Éditeur textuel en ligne */}
      {inlineEditor && (
        <div
          style={{
            position: 'absolute',
            left: inlineEditor.screenX,
            top: inlineEditor.screenY - 14,
            zIndex: 40,
            pointerEvents: 'auto',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            type="text"
            value={inlineEditor.text}
            placeholder="Tapez le texte..."
            onChange={(e) => onInlineTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onCommitInlineText();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                onCancelInlineText();
              }
            }}
            onBlur={onCommitInlineText}
            style={{
              backgroundColor: colors['colors_bg_secondary'],
              border: `1.5px solid ${primaryStroke}`,
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 13,
              fontWeight: 600,
              color: textColor,
              outline: 'none',
              boxShadow: isDark
                ? '0 4px 12px rgba(0, 0, 0, 0.5)'
                : '0 4px 12px rgba(0, 0, 0, 0.15)',
              minWidth: 140,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ChartDrawingOverlay;
