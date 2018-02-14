import { reduce } from '../array';

export const abs =
  (x: number) =>
    x < 0
      ? -x
      : x;

export const floor =
  (x: number) =>
    x | 0;

export const round =
  (x: number) =>
    x + 0.5 | 0;

export const eqSign =
  (x: number, y: number): boolean =>
    (x ^ y) >= 0;

export const multiplyByPowerOfTwo =
  (x: number, powOfTwo: number): number =>
    x << powOfTwo;

export const divideByPowerOfTwo =
  (x: number, powOfTwo: number): number =>
    x >> powOfTwo;

export const sum =
  (numbers: number[]) =>
    reduce<number, number>(
      numbers,
      (total, val) => total + val,
      0,
    );

export const clamp =
  (num: number, lower: number, upper: number): number =>
    num > upper
      ? upper
      : (num < lower
        ? lower
        : num);

export const inRange =
  (num: number, lower: number = 0, upper: number = 1): boolean =>
    !(num < lower || num > upper);

export const sign =
  (num: number): number =>
    num === 0
      ? 0
      : num / abs(num);

export const clampPerc =
  (num: number, lower: number, upper: number): number =>
    (num - lower) / (upper - lower);

export const random =
  (max: number = 1, min: number = 0): number =>
    Math.random() * (max - min) + min;

export const lerp =
  (a: number, b: number, dt: number): number =>
    a + (b - a) * dt;

export const sqr =
  (x: number): number =>
    x * x;
