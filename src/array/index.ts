export interface iterator<T, V> {
  (value: T, index: number, array: T[]): V
}

export interface reduceIterator<T, R> {
  (base: R, value: T, index: number, array: T[]): R
}

export interface timesIterator<T> {
  (index: number, length: number): T
}

export function forEach<T>(array: T[], func: iterator<T, void>): T[] {
  let i = -1;
  while (++i < array.length) func(array[i], i, array);
  return array;
}

export function reduce<T, R>(array: T[], func: reduceIterator<T, R>, base: R): R {
  let i = -1;
  while (++i < array.length) base = func(base, array[i], i, array);
  return base;
}

export function reduceRight<T, R>(array: T[], func: reduceIterator<T, R>, base: R): R {
  let i = array.length;
  while (--i >= 0) base = func(base, array[i], i, array);
  return base;
}

export const map =
  <T, R>(array: T[], func: iterator<T, R>): R[] =>
    reduce<T, R[]>(
      array,
      (result, value, index, array) => {
        result.push(func(value, index, array))
        return result;
      },
      [],
    );

export const mapToObject =
  <T>(array: T[], func: iterator<T, string>): { [name: string]: T } =>
    reduce(
      array,
      (obj, value, index, array) => {
        obj[func(value, index, array)] = value;
        return obj
      },
      Object.create(null),
    );

export const mapToMap =
  <src, key, value>(array: src[], func: iterator<src, [key, value]>): Map<key, value> =>
    new Map<key, value>(map<src, [key, value]>(array, func));

export const filter =
  <T, R extends T>(array: T[], func: iterator<T, boolean> = (x: T) => !!x): R[] =>
    reduce<T, R[]>(
      array,
      (result, value, index, array) => func(value, index, array)
        ? (result.push(value as R), result)
        : result,
      [],
    );

export function find<T>(array: T[], func: iterator<T, boolean>): T | null {
  let i = -1;
  while (++i < array.length) {
    if (func(array[i], i, array)) return array[i];
  };
  return null;
}

export function times<T>(length: number, func: timesIterator<T>): T[] {
  const result = [];
  let i = -1;
  while (++i < length) result.push(func(i, length));
  return result;
}

export const difference =
  <T>(array: T[], targetArray: T[]): T[] =>
    filter(array, (val: T) => targetArray.indexOf(val) === -1);

export const intersection =
  <T>(array: T[], targetArray: T[]): T[] =>
    filter(array, (val: T) => targetArray.indexOf(val) !== -1);

export const flatten =
  <T>(array: T[][]): T[] =>
    ([] as T[]).concat(...array);

export const unique =
  <T>(array: T[]): T[] =>
    filter(array, (value: T, index: number, self: T[]) => self.indexOf(value) === index);

export const uniqueBy =
  <T>(array: T[], func: iterator<T, number | boolean | string | symbol | Function>): T[] => {
    const result = [];
    const resultKeys = [];
    let i = -1;
    while (++i < array.length) {
      const key = func(array[i], i, array);
      if (resultKeys.indexOf(key) === -1) {
        result.push(array[i]);
        resultKeys.push(key);
      }
    }
    return result;
  };

export const countBy =
  <T>(array: T[], func: iterator<T, string | number>): { [key: string]: number } => {
    const result = Object.create(null);
    const len = array.length;
    let i = -1;
    while (++i < len) {
      const key = func(array[i], i, array);
      if (!result[key]) result[key] = 0;
      ++result[key];
    }
    return result;
  };

export const invoke =
  (array: Function[]): Function[] =>
    forEach(array, (func: Function) => func());

export const concat =
  <T>(...arrays: T[][]): T[] =>
    flatten(arrays);

export const union =
  <T>(...arrays: T[][]): T[] =>
    unique(concat(...arrays));

export const reverse =
  <T>(array: T[]): T[] => {
    const result = [];
    for (let i = array.length - 1; i >= 0; i--) {
      result.push(array[i]);
    }
    return result;
  };

export const heuristicFind =
  (sort: <D>(array: D[], func: (val: D) => number) => D[]) =>
    <T>(array: T[], func: (val: T) => number): T =>
      sort(array, func)[0];

export const contains =
  <T>(array: T[], value: T): boolean =>
    array.indexOf(value) !== -1;

export const copy =
  <T>(array: T[]): T[] =>
    array.slice(0);

export const clear =
  <T>(array: T[]): T[] => {
    while (array.length) array.pop();
    return array;
  };

export const toggle =
  <T>(array: T[], value: T): T[] =>
    contains(array, value)
      ? remove(array, value)
      : add(array, value);

export const remove =
  <T>(array: T[], value: T): T[] => {
    const result = copy(array);
    if (array.indexOf(value) !== -1) result.splice(array.indexOf(value), 1);
    return result;
  };

export const add =
  <T>(array: T[], value: T, index: number = 0): T[] => {
    const result = copy(array);
    result.splice(index, 0, value);
    return result;
  };

export const push =
  <T>(array: T[], value: T): T[] => {
    const result = copy(array);
    result.push(value);
    return result;
  };

export const chunk =
  <T>(array: T[], chunkSize: number = 10): T[][] => times<T[]>(
    Math.ceil(array.length / chunkSize),
    (index) => array.slice(index * chunkSize, index * chunkSize + chunkSize)
  );

export const last =
  <T>(array: T[], pos: number = 0): T =>
    array[array.length - 1 - pos];

export function lastValues<T>(array: T[], num: number = 1): T[] {
  const result = [];
  let i = array.length;
  const min = Math.max(array.length - 1 - num, 0);
  while (--i > min) result.push(array[i]);
  return result;
}

export const first =
  <T>(array: T[], pos: number = 0): T =>
    array[0 + pos];

export function firstValues<T>(array: T[], num: number = 1): T[] {
  const result = [];
  let i = 0;
  while (i < num && i < array.length) result.push(array[i++]);
  return result;
}

export const any =
  <T>(array: T[], func: iterator<T, boolean>) =>
    !!find(array, func);

export const all =
  <T>(array: T[], func: iterator<T, boolean>) =>
    !find(array, (value, i, array) => !func(value, i, array));

export type Chain = {
  value: <type>() => type[];
  link(func: (array: any[], ...args: any[]) => any[], ...args: any[]): Chain;
}
