import { useState, useRef, RefObject } from 'react';
import { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { ChartTool } from '@/components/features/market/components/ChartToolbar';
import {
  MarketDrawing,
  BaseDrawingPoint,
  LineDrawing,
  FreehandDrawing,
  ShapeDrawing,
  FiboDrawing,
  TextDrawing,
} from '@/types/drawing';
import { createSmoothSvgPath } from '@/utils/chartPath';

interface UseChartDrawingsParams {
  chartRef: RefObject<IChartApi | null>;
  seriesRef: RefObject<ISeriesApi<'Candlestick'> | ISeriesApi<'Area'> | null>;
  activeTool: ChartTool;
  onDrawingsChange?: (hasDrawings: boolean) => void;
}

export const useChartDrawings = ({
  chartRef,
  seriesRef,
  activeTool,
  onDrawingsChange,
}: UseChartDrawingsParams) => {
  const [drawings, setDrawings] = useState<MarketDrawing[]>([]);
  const [currentScreenDraft, setCurrentScreenDraft] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    type: ChartTool;
  } | null>(null);

  const [inlineEditor, setInlineEditor] = useState<{
    screenX: number;
    screenY: number;
    marketPoint: BaseDrawingPoint;
    text: string;
  } | null>(null);

  const livePencilPathRef = useRef<SVGPathElement>(null);
  const livePencilPointsRef = useRef<{ x: number; y: number }[]>([]);
  const livePencilAnchorRef = useRef<BaseDrawingPoint | null>(null);
  const isPencilDrawingRef = useRef(false);

  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    point: BaseDrawingPoint;
  } | null>(null);

  const getMarketPoint = (x: number, y: number): BaseDrawingPoint | null => {
    if (!chartRef.current || !seriesRef.current) return null;
    const price = seriesRef.current.coordinateToPrice(y);
    const time = chartRef.current.timeScale().coordinateToTime(x) as UTCTimestamp;
    return price === null || time === null ? null : { price, time };
  };

  const getScreenCoordinates = (point: BaseDrawingPoint): { x: number; y: number } | null => {
    if (!chartRef.current || !seriesRef.current) return null;
    const x = chartRef.current.timeScale().timeToCoordinate(point.time);
    const y = seriesRef.current.priceToCoordinate(point.price);
    return x === null || y === null ? null : { x, y };
  };

  const commitInlineText = () => {
    if (!inlineEditor) return;
    const trimmed = inlineEditor.text.trim();
    if (trimmed.length > 0) {
      const newText: TextDrawing = {
        id: `text-${Date.now()}`,
        type: 'text',
        point: inlineEditor.marketPoint,
        text: trimmed,
      };
      setDrawings((prev) => [...prev, newText]);
      onDrawingsChange?.(true);
    }
    setInlineEditor(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'crosshair') return;
    if (inlineEditor) {
      commitInlineText();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const marketPoint = getMarketPoint(x, y);
    if (!marketPoint) return;

    if (activeTool === 'text') {
      setInlineEditor({ screenX: x, screenY: y, marketPoint, text: '' });
      return;
    }

    if (activeTool === 'trendline') {
      isPencilDrawingRef.current = true;
      livePencilAnchorRef.current = marketPoint;
      livePencilPointsRef.current = [{ x, y }];
      livePencilPathRef.current?.setAttribute('d', `M ${x} ${y} L ${x} ${y}`);
      return;
    }

    setDragStart({ x, y, point: marketPoint });
    setCurrentScreenDraft({ x1: x, y1: y, x2: x, y2: y, type: activeTool });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'crosshair' || inlineEditor) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'trendline' && isPencilDrawingRef.current) {
      const pts = livePencilPointsRef.current;
      const last = pts[pts.length - 1];
      if (Math.hypot(x - last.x, y - last.y) >= 2) {
        pts.push({ x, y });
        livePencilPathRef.current?.setAttribute('d', createSmoothSvgPath(pts));
      }
      return;
    }

    if (dragStart) {
      setCurrentScreenDraft({ x1: dragStart.x, y1: dragStart.y, x2: x, y2: y, type: activeTool });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'crosshair' || inlineEditor) return;

    if (activeTool === 'trendline' && isPencilDrawingRef.current) {
      isPencilDrawingRef.current = false;
      const recorded = livePencilPointsRef.current;
      const anchor = livePencilAnchorRef.current;

      if (recorded.length > 2 && anchor) {
        const origin = recorded[0];
        const newFreehand: FreehandDrawing = {
          id: `pencil-${Date.now()}`,
          type: 'trendline',
          anchor,
          offsets: recorded.map((p) => ({ dx: p.x - origin.x, dy: p.y - origin.y })),
        };
        setDrawings((prev) => [...prev, newFreehand]);
        onDrawingsChange?.(true);
      }

      livePencilPointsRef.current = [];
      livePencilAnchorRef.current = null;
      livePencilPathRef.current?.setAttribute('d', '');
      return;
    }

    if (dragStart) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const endMarketPoint = getMarketPoint(x, y);

      if (endMarketPoint && Math.hypot(x - dragStart.x, y - dragStart.y) > 8) {
        let drawing: MarketDrawing | null = null;
        if (activeTool === 'line') {
          drawing = { id: `line-${Date.now()}`, type: 'line', p1: dragStart.point, p2: endMarketPoint };
        } else if (activeTool === 'shape') {
          drawing = { id: `shape-${Date.now()}`, type: 'shape', p1: dragStart.point, p2: endMarketPoint };
        } else if (activeTool === 'fibo') {
          drawing = { id: `fibo-${Date.now()}`, type: 'fibo', p1: dragStart.point, p2: endMarketPoint };
        }
        if (drawing) {
          setDrawings((prev) => [...prev, drawing!]);
          onDrawingsChange?.(true);
        }
      }
      setDragStart(null);
      setCurrentScreenDraft(null);
    }
  };

  return {
    drawings,
    currentScreenDraft,
    inlineEditor,
    livePencilPathRef,
    setInlineEditor,
    commitInlineText,
    getScreenCoordinates,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
