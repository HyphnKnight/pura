import { is } from '../is';
import { Circle, Point, Polygon, Rectangle, Shape } from './index';

export const isPoint = is<Point>((x) => x.type === Shape.Point);
export const isCircle = is<Circle>((x) => x.type === Shape.Circle);
export const isRectangle = is<Rectangle>((x) => x.type === Shape.Rectangle);
export const isPolygon = is<Polygon>((x) => x.type === Shape.Polygon);
