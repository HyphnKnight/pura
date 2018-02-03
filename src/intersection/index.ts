import { Vector2d, set, subtract, subtractSet, magnitudeSqr, add, addSet, dot, cross, scale, lerp } from '../vector';
import { VectorList } from '../vector/list';
import { Line, Geometry } from '../geometry';
import { sign, round, sqr } from '../math';

/* -1 === left, 0 === aligned, 1 === right */
export const pointRelationToLine =
  (point: Vector2d, line: Line): number =>
    sign((line[2] - line[0]) * (point[1] - line[1]) - (line[3] - line[1]) * (point[0] - line[0]));

export const isPointInCircle =
  (point: Vector2d, position: Vector2d, radius: number): boolean =>
    magnitudeSqr(subtract(point, position)) <= sqr(radius);

export const isPointInAlignedRectangle =
  (point: Vector2d, position: Vector2d, width: number, height: number): boolean =>
    Math.abs(point[0] - position[0]) <= width / 2 &&
    Math.abs(point[1] - position[1]) <= height / 2;

export const isPointInPolygon =
  (point: Vector2d, points: VectorList): boolean => {
    let i = 0;
    let len = points.length;
    let next = 0;
    let relation = 0;
    while (true) {
      next = i === len - 2 ? 0 : i + 2;
      relation = pointRelationToLine(point, [points[i], points[i + 1], points[next], points[next + 1]]);
      if (relation === -1) return false;
      i += 2;
      if (i > len - 2) break;
    }
    return true;
  }

export const isCircleInCircle =
  (positionA: Vector2d, radiusA: number, positionB: Vector2d, radiusB: number) =>
    magnitudeSqr(subtract(positionA, positionB)) <= sqr(radiusA + radiusB);


export const isCircleInAlignedRectangle =
  (positionA: Vector2d, radius: number, positionB: Vector2d, width: number, height: number) =>
    isPointInAlignedRectangle(positionA, positionB, width, height) ||
    isPointInCircle(positionB, positionA, radius) ||
    (sqr(positionA[0] - Math.max(positionB[0], Math.min(positionA[0], positionB[0] + width))) +
      sqr(positionA[1] - Math.max(positionB[1], Math.min(positionA[1], positionB[1] + height)))) < sqr(radius);

export const isAlignedRectangleInAlignedRectangle =
  (positionA: Vector2d, widthA: number, heightA: number, positionB: Vector2d, widthB: number, heightB: number) =>
    !(Math.abs(positionB[0] - positionA[0]) > widthA / 2 + widthB / 2 ||
      Math.abs(positionB[1] - positionA[1]) > heightA / 2 + heightB / 2);

export const isPolygonInPolygon =
  (positionA: Vector2d, pointsA: VectorList, positionB: Vector2d, pointsB: VectorList): boolean => {
    if (
      isPointInPolygon(positionA, pointsB) ||
      isPointInPolygon(positionB, pointsA)
    ) return true;
    const length = Math.max(pointsA.length, pointsB.length);
    for (let i = 0; i < length; i += 2) {
      if (
        (i < pointsA.length && isPointInPolygon([pointsA[i], pointsA[i + 1]], pointsB)) ||
        (i < pointsB.length && isPointInPolygon([pointsB[i], pointsB[i + 1]], pointsA))
      ) return true;
    }
    return false;
  };


const validTime =
  (t: number): boolean =>
    t < 0 || t > 1;

export type Intersection = {
  time: number;
  point: Vector2d;
}

export function lineIntersection(lineA: Line, lineB: Line): Intersection | false {

  const positionA: Vector2d = [lineA[0], lineA[1]];
  const displacementA: Vector2d = [lineA[2], lineA[3]];
  const positionB: Vector2d = [lineB[0], lineB[1]];
  const displacementB: Vector2d = [lineB[2], lineB[3]];
  const endPointA = add(positionA, displacementA);
  const relativePos = subtract(positionB, positionA);
  const det = cross(displacementA, displacementB);
  if (det === 0) {

    if (cross(relativePos, displacementA) === 0) {

      let t0, t1, time;

      const disADot = scale(displacementA, 1 / dot(displacementA, displacementA));

      if (dot(displacementA, displacementB) >= 0) {

        t0 = dot(relativePos, disADot);
        t1 = t0 + dot(displacementB, disADot);

      } else {

        const finalB = add(positionB, displacementB);
        const finalBDiffStartA = subtract(finalB, positionA);

        t1 = dot(finalBDiffStartA, disADot);
        t0 = dot(relativePos, disADot);

      }

      if (validTime(t0) && validTime(t1)) {
        time = (t0 + t1) / 2;
      } else if (validTime(t0)) {
        time = t1 < t0
          ? t0 / 2
          : (1 - t0) / 2 + t0;
      } else if (validTime(t1)) {
        time = t0 < t1
          ? t1 / 2
          : (1 - t1) / 2 + t1;
      } else {
        return false;
      }

      return {
        point: addSet(scale(displacementA, time), positionA),
        time: round(time)
      };
    }
    return false;
  }

  const numerator = displacementA[1] * relativePos[0] - displacementA[0] * relativePos[1]; // cross
  const s = numerator / det;

  if (!validTime(s)) return false;

  const t = displacementA[0] !== 0
    ? (relativePos[0] - s * displacementB[0]) / displacementA[0]
    : (relativePos[1] - s * displacementB[1]) / displacementA[1];

  if (!validTime(t)) return false;

  return { time: t, point: lerp(positionA, endPointA, t) };
}

const boundingVec: Vector2d = [0, 0];

export const isInsideBounding: (geometryA: Geometry, geometryB: Geometry) => boolean =
  ({ position: posA, bounding: radA }, { position: posB, bounding: radB }) =>
    magnitudeSqr(subtractSet(set(boundingVec, posB), posA)) <= (radA + radB) * (radA + radB);
