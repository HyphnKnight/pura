import { lerp as nLerp, sign, sqr } from '../math';

export type Vector2d = [number, number];

export const set =
  (vec: Vector2d, target: Vector2d): Vector2d => {
    vec[0] = target[0];
    vec[1] = target[1];
    return vec;
  };

export const addSet =
  (vecA: Vector2d, vecB: Vector2d): Vector2d =>
    set(vecA, [vecA[0] + vecB[0], vecA[1] + vecB[1]]);

export const add =
  (vecA: Vector2d, vecB: Vector2d): Vector2d =>
    addSet([...vecA] as Vector2d, vecB);

export const subtractSet =
  (vecA: Vector2d, vecB: Vector2d): Vector2d =>
    set(vecA, [vecA[0] - vecB[0], vecA[1] - vecB[1]]);

export const subtract =
  (vecA: Vector2d, vecB: Vector2d): Vector2d =>
    subtractSet([...vecA] as Vector2d, vecB);

export const scaleSet =
  (base: Vector2d, scale: number): Vector2d => {
    base[0] *= scale;
    base[1] *= scale;
    return base;
  };

export const scale =
  (vec: Vector2d, scale: number): Vector2d =>
    scaleSet([...vec] as Vector2d, scale);

export const lerpSet =
  (vecA: Vector2d, vecB: Vector2d, dt: number): Vector2d => {
    vecA[0] = nLerp(vecA[0], vecB[0], dt);
    vecA[1] = nLerp(vecA[1], vecB[1], dt);
    return vecA;
  };

export const lerp =
  (vecA: Vector2d, vecB: Vector2d, dt: number): Vector2d =>
    lerpSet([...vecA] as Vector2d, vecB, dt);

export const equals =
  (vecA: Vector2d, vecB: Vector2d): boolean =>
    vecA[0] === vecB[0] &&
    vecA[1] === vecB[1];

export const magnitudeSqr =
  (vec: Vector2d): number =>
    sqr(vec[0]) + sqr(vec[1]);

export const magnitude =
  (vec: Vector2d): number =>
    Math.sqrt(magnitudeSqr(vec));

export const normalizeSet =
  (vec: Vector2d): Vector2d =>
    vec[0] === 0 && vec[1] === 0
      ? [0, 0]
      : scaleSet(vec, 1 / magnitude(vec));

export const normalize =
  (vec: Vector2d): Vector2d =>
    normalizeSet([...vec] as Vector2d);

export const normalSet =
  (vec: Vector2d): Vector2d => {
    const tmp = vec[0];
    vec[0] = -vec[1];
    vec[1] = tmp;
    return vec;
  };

export const normal =
  (vec: Vector2d): Vector2d =>
    normalSet([...vec] as Vector2d)

export const invert =
  (vec: Vector2d): Vector2d =>
    scale(vec, -1);

export const invertSet =
  (vec: Vector2d): Vector2d =>
    scaleSet(vec, -1);

export const dot =
  (vecA: Vector2d, vecB: Vector2d): number =>
    vecA[0] * vecB[0] + vecA[1] * vecB[1];

export const cross =
  (vecA: Vector2d, vecB: Vector2d): number =>
    vecA[0] * vecB[1] - vecA[1] * vecB[0];

export const rotateSet =
  (vec: Vector2d, rotation: number): Vector2d => {
    const s = Math.sin(rotation);
    const c = Math.cos(rotation);
    const tmp = vec[0];
    vec[0] = vec[0] * c - vec[1] * s;
    vec[1] = tmp * s + vec[1] * c;
    return vec;
  };

export const rotate =
  (vec: Vector2d, rotation: number): Vector2d =>
    rotateSet([...vec] as Vector2d, rotation);

export const angleBetween =
  (vecA: Vector2d, vecB: Vector2d): number =>
    Math.atan2(vecB[0], vecB[1]) - Math.atan2(vecA[0], vecA[1]);

export const scaleToSet =
  (vec: Vector2d, newMagnitude: number): Vector2d =>
    scaleSet(normalizeSet(vec), newMagnitude);

export const scaleTo =
  (vec: Vector2d, newMagnitude: number): Vector2d =>
    scaleToSet([...vec] as Vector2d, newMagnitude);

export const component =
  (vec: Vector2d, directionVector: Vector2d): number =>
    magnitude(vec) * Math.cos(Math.atan2(vec[1], vec[0]) - Math.atan2(directionVector[1], directionVector[0]));

export const componentVector =
  (vec: Vector2d, directionVector: Vector2d): Vector2d =>
    scaleSet(normal(directionVector), component(vec, directionVector));

export const absolute =
  (vec: Vector2d): Vector2d =>
    set(vec, [vec[0] * sign(vec[0]), vec[1] * sign(vec[1])]);

export const copy =
  (vec: Vector2d): Vector2d =>
    ([vec[0], vec[1]]);
