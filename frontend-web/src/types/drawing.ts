import { UTCTimestamp } from 'lightweight-charts';

export type ChartDrawingTool = 'crosshair' | 'line' | 'trendline' | 'text' | 'shape' | 'fibo';

export interface BaseDrawingPoint {
  time: UTCTimestamp;
  price: number;
}

export interface LineDrawing {
  id: string;
  type: 'line';
  p1: BaseDrawingPoint;
  p2: BaseDrawingPoint;
}

// Le tracé à main levée stocke un point d'ancrage cours/temps et des offsets continus en pixels
export interface FreehandDrawing {
  id: string;
  type: 'trendline';
  anchor: BaseDrawingPoint;
  offsets: { dx: number; dy: number }[];
}

export interface ShapeDrawing {
  id: string;
  type: 'shape';
  p1: BaseDrawingPoint;
  p2: BaseDrawingPoint;
}

export interface FiboDrawing {
  id: string;
  type: 'fibo';
  p1: BaseDrawingPoint;
  p2: BaseDrawingPoint;
}

export interface TextDrawing {
  id: string;
  type: 'text';
  point: BaseDrawingPoint;
  text: string;
}

export type MarketDrawing =
  | LineDrawing
  | FreehandDrawing
  | ShapeDrawing
  | FiboDrawing
  | TextDrawing;
