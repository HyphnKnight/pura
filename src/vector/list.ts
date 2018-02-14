import { round } from '../math';
import { scaleSet, Vector2d } from './index';

export type VectorList = number[];

export const addListSet =
  (list: VectorList, vec: Vector2d): VectorList => {
    for (let i = 0, len = list.length; i < len; i += 2) {
      list[i] += vec[0];
      list[i + 1] += vec[1];
    }
    return list;
  };

export const addList =
  (list: VectorList, vec: Vector2d): VectorList =>
    addListSet([...list], vec);

export const subtractListSet =
  (list: VectorList, vec: Vector2d): VectorList => {
    for (let i = 0, len = list.length; i < len; i += 2) {
      list[i] -= vec[0];
      list[i + 1] -= vec[1];
    }
    return list;
  };

export const subtractList =
  (list: VectorList, vec: Vector2d): VectorList =>
    subtractListSet([...list], vec);

export const scaleListSet =
  (list: VectorList, scale: number): VectorList => {
    for (let i = 0, len = list.length; i < len; i += 2) {
      list[i] *= scale;
      list[i + 1] *= scale;
    }
    return list;
  };

export const scaleList =
  (list: VectorList, scale: number): VectorList =>
    scaleListSet(list, scale);

export const invertList =
  (list: VectorList): VectorList =>
    scaleList(list, -1);

export const invertListSet =
  (list: VectorList): VectorList =>
    scaleListSet(list, -1);

export const normalListSet =
  (list: VectorList): VectorList => {
    let tmp: number = 0;
    for (let i = 0, len = list.length; i < len; i += 2) {
      tmp = list[i];
      list[i] = -list[i + 1];
      list[i + 1] = tmp;
    }
    return list;
  };

export const normalList =
  (list: VectorList): VectorList =>
    normalListSet([...list]);

export const rotateListSet =
  (list: VectorList, rotation: number): VectorList => {
    const s = Math.sin(rotation);
    const c = Math.cos(rotation);
    let tmp: number = 0;
    for (let i = 0, len = list.length; i < len; i += 2) {
      tmp = list[i];
      list[i] = round(tmp * c - list[i + 1] * s);
      list[i + 1] = round(tmp * s + list[i + 1] * c);
    }
    return list;
  };

export const rotateList =
  (list: VectorList, rotation: number): VectorList =>
    rotateListSet([...list], rotation);

export const rotateListAround =
  (list: VectorList, point: Vector2d, rotation: number): number[] =>
    addList(rotateList(subtractList(list, point), rotation), point);

export const rotateListAroundSet =
  (list: VectorList, point: Vector2d, rotation: number): number[] =>
    addListSet(rotateListSet(subtractListSet(list, point), rotation), point);

export const scaleToList =
  (list: VectorList, newMagnitude: number): VectorList =>
    scaleList(normalList(list), newMagnitude);

export const scaleToListSet =
  (list: VectorList, newMagnitude: number): VectorList =>
    scaleListSet(normalListSet(list), newMagnitude);

export const sumList =
  (list: VectorList): Vector2d => {
    const result: Vector2d = [0, 0];
    for (let i = 0, len = list.length; i < len; i += 2) {
      result[0] += list[i];
      result[1] += list[i + 1];
    }
    return result;
  };

export const averageList =
  (list: VectorList): Vector2d =>
    scaleSet(sumList(list), 2 / list.length);

export const listToVector =
  (list: VectorList): Vector2d[] => {
    const result: Vector2d[] = [];
    for (let i = 0; i < list.length; i += 2) {
      result.push([list[i], list[i + 1]]);
    }
    return result;
  };

export type vectorIterator<type> = (vec: Vector2d, index: number) => type;

export const forEachList =
  (list: VectorList, func: vectorIterator<void>) => {
    for (let i = 0; i < list.length; i += 2) {
      func([list[i], list[i + 1]], i / 2);
    }
  };

export const mapListSet =
  (list: VectorList, func: vectorIterator<Vector2d>) => {
    for (let i = 0; i < list.length; i += 2) {
      list.splice(i, 2, ...func([list[i], list[i + 1]], i / 2));
    }
    return list;
  };

export const mapList =
  (list: VectorList, func: vectorIterator<Vector2d>) =>
    mapListSet([...list], func);

