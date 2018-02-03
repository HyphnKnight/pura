import { Vector2d, rotateSet, scaleSet, magnitudeSqr } from '../vector';
import { VectorList, subtractListSet, averageList, rotateList, addListSet, forEachList } from '../vector/list';
import { times, flatten } from '../array';

/* Type Declarations */

export enum Shape {
  Point = "Point",
  Circle = "Circle",
  Rectangle = "Rectangle",
  Polygon = "Polygon",
}

export type Point = {
  type: Shape.Point;
  position: Vector2d;
  rotation: number;
  bounding: 0;
}

export type Circle = {
  type: Shape.Circle;
  position: Vector2d;
  rotation: number;
  radius: number;
  bounding: number;
}

export type Rectangle = {
  type: Shape.Rectangle;
  position: Vector2d;
  rotation: number;
  width: number;
  height: number;
  points: VectorList;
  bounding: number;
}

export type Polygon = {
  type: Shape.Polygon;
  position: Vector2d;
  rotation: number;
  points: VectorList;
  bounding: number;
}

export type Line = [
  number, number, // Position
  number, number  // Displacement
];

export type Geometry = Point | Circle | Rectangle | Polygon;

/* Utilities */
export const getRectanglePoints = (width: number, height: number): VectorList => ([
  width / 2, height / 2,
  -width / 2, height / 2,
  +width / 2, -height / 2,
  -width / 2, -height / 2,
]);

export const normalizePoints =
  (points: VectorList): VectorList =>
    subtractListSet(points, averageList(points))

export const createLinesFromPoints =
  (points: VectorList): Line[] => {
    const results: Line[] = [];
    const length = points.length;
    for (let i = 0; i < length; i += 2) {
      const next = i === length - 1 ? 0 : i + 1
      results.push([
        points[i], points[i + 1],
        points[next] - points[i], points[next + 1] - points[i + 1]
      ]);
    }
    return results;
  };

/* Basic Geometry */
export const createPoint =
  (position: Vector2d, rotation: number = 0): Point => ({
    type: Shape.Point,
    bounding: 0,
    position, rotation,
  });

export const createCircle =
  (position: Vector2d, rotation: number = 0, radius: number = 1): Circle => ({
    type: Shape.Circle,
    bounding: radius,
    position, rotation,
    radius,
  });

export const createRectangle =
  (position: Vector2d, rotation: number = 0, width: number = 1, height: number = 1): Rectangle => ({
    type: Shape.Rectangle,
    bounding: Math.sqrt(width * width + height * height),
    position, rotation,
    width, height,
    points: getRectanglePoints(width, height),
  });

export const createPolygon =
  (position: Vector2d, rotation: number = 0, points: VectorList): Polygon => {
    const adjustedPoints = normalizePoints(points);
    let bounding = 0;
    forEachList(adjustedPoints, pnt => bounding = Math.max(bounding || magnitudeSqr(pnt)));
    bounding = Math.sqrt(bounding);
    return {
      type: Shape.Polygon,
      points: adjustedPoints,
      position, rotation, bounding,
    }
  };


/* Custom Geometry */
export const createSquare =
  (position: Vector2d, rotation: number, size: number) =>
    createRectangle(position, rotation, size, size);

export const createEqualLateralPolygonPoints =
  (sides: number, radius: number): VectorList =>
    flatten(times(sides, i => scaleSet(rotateSet([0, 1], i * (2 * Math.PI / sides)), radius)));

export const createEqualLateralPolygon =
  (position: Vector2d, rotation: number, sides: number, radius: number) =>
    createPolygon(
      position,
      rotation,
      createEqualLateralPolygonPoints(sides, radius),
    );

/* Utility Funcs */
export const getPolygonPoints =
  (polygon: Rectangle | Polygon) =>
    addListSet(
      rotateList(
        polygon.points,
        polygon.rotation
      ),
      polygon.position
    );
