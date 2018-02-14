import { abs, lerp as nLerp, sqr } from '../math';

export type Vector3d = [number, number, number];

export const set =
  (vec: Vector3d, target: Vector3d): Vector3d => {
    vec[0] = target[0];
    vec[1] = target[1];
    vec[2] = target[2];
    return vec;
  };

export const addSet =
  (vecA: Vector3d, vecB: Vector3d): Vector3d =>
    set(vecA, [
      vecA[0] + vecB[0],
      vecA[1] + vecB[1],
      vecA[2] + vecB[2],
    ]);

export const add =
  (vecA: Vector3d, vecB: Vector3d): Vector3d =>
    addSet([...vecA] as Vector3d, vecB);

export const subtractSet =
  (vecA: Vector3d, vecB: Vector3d): Vector3d =>
    set(vecA, [
      vecA[0] - vecB[0],
      vecA[1] - vecB[1],
      vecA[2] - vecB[2],
    ]);

export const subtract =
  (vecA: Vector3d, vecB: Vector3d): Vector3d =>
    subtractSet([...vecA] as Vector3d, vecB);

export const scaleSet =
  (base: Vector3d, scaleValue: number): Vector3d => {
    base[0] *= scaleValue;
    base[1] *= scaleValue;
    base[2] *= scaleValue;
    return base;
  };

export const scale =
  (vec: Vector3d, scaleValue: number): Vector3d =>
    scaleSet([...vec] as Vector3d, scaleValue);

export const lerpSet =
  (vecA: Vector3d, vecB: Vector3d, dt: number): Vector3d => {
    vecA[0] = nLerp(vecA[0], vecB[0], dt);
    vecA[1] = nLerp(vecA[1], vecB[1], dt);
    vecA[2] = nLerp(vecA[2], vecB[2], dt);
    return vecA;
  };

export const lerp =
  (vecA: Vector3d, vecB: Vector3d, dt: number): Vector3d =>
    lerpSet([...vecA] as Vector3d, vecB, dt);

export const equals =
  (vecA: Vector3d, vecB: Vector3d): boolean =>
    vecA[0] === vecB[0] &&
    vecA[1] === vecB[1] &&
    vecA[2] === vecB[2];

export const magnitudeSqr =
  (vec: Vector3d): number =>
    sqr(vec[0]) + sqr(vec[1]) + sqr(vec[2]);

export const magnitude =
  (vec: Vector3d): number =>
    Math.sqrt(magnitudeSqr(vec));

export const normalizeSet =
  (vec: Vector3d): Vector3d =>
    vec[0] === 0 && vec[1] === 0
      ? [0, 0, 0]
      : scaleSet(vec, 1 / magnitude(vec));

export const normalize =
  (vec: Vector3d): Vector3d =>
    normalizeSet([...vec] as Vector3d);

export const invert =
  (vec: Vector3d): Vector3d =>
    scale(vec, -1);

export const invertSet =
  (vec: Vector3d): Vector3d =>
    scaleSet(vec, -1);

export const dot =
  (vecA: Vector3d, vecB: Vector3d): number =>
    vecA[0] * vecB[0] + vecA[1] * vecB[1] + vecA[2] * vecB[2];


export const scaleToSet =
  (vec: Vector3d, newMagnitude: number): Vector3d =>
    scaleSet(normalizeSet(vec), newMagnitude);

export const scaleTo =
  (vec: Vector3d, newMagnitude: number): Vector3d =>
    scaleToSet([...vec] as Vector3d, newMagnitude);

export const absolute =
  (vec: Vector3d): Vector3d =>
    set(vec, [abs(vec[0]), abs(vec[1]), abs(vec[2])]);

export const copy =
  (vec: Vector3d): Vector3d =>
    ([...vec]) as Vector3d;
