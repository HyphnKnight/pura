import { Vector2d } from './index';
import { isNumber } from '../is/type';

export const isVector2d =
  (u: any): u is Vector2d =>
    u && isNumber(u[0]) && isNumber(u[1]);
