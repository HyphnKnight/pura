import { find, forEach as arrayForEach, map, reduce } from '../array';

export interface ObjLit<Value> { [prop: string]: Value; }

export type Iterator<Value, Result> = (value: Value, key: string, obj: objLit<Value>) => Result;

export const forEach =
  <Value>(obj: objLit<Value>, func: iterator<Value, void>) =>
    arrayForEach(Object.keys(obj), (key) => func(obj[key], key, obj));

export const mapValues =
  <Value, Result>(obj: objLit<Value>, func: Iterator<Value, Result>): objLit<Result> =>
    reduce<string | number, objLit<Result>>(
      Object.keys(obj),
      (result, key) => {
        result[key] = func(obj[key], key as string, obj);
        return result;
      },
      {}
    );

export const mapKeys =
  <Value>(obj: objLit<Value>, func: Iterator<Value, string | number>): objLit<Value> =>
    reduce<string, objLit<Value>>(
      Object.keys(obj),
      (result, key) => {
        result[func(obj[key], key, obj)] = obj[key];
        return result;
      },
      {}
    );

export const pick =
  <Value extends Result, Result>(obj: objLit<Value>, func: Iterator<Value, boolean>): objLit<Result> =>
    reduce<string | number, objLit<Result>>(
      Object.keys(obj),
      (result, key) => {
        if (func(obj[key], key as string, obj)) {
          result[key] = obj[key];
        }
        return result;
      },
      {}
    );

export const match =
  <type extends { [id: string]: any }>(target: Partial<type>) =>
    (obj: type) =>
      reduce<string, boolean>(
        Object.keys(target),
        (result, key) => result && obj[key] === target[key],
        true
      );

export const copy =
  <type>(obj: type) =>
    merge(Object.create(null), obj);

export const mapToArray =
  <Value, Result>(obj: objLit<Value>, iterator: Iterator<Value, Result>): Result[] =>
    map(Object.keys(obj), (key) => iterator(obj[key], key as string, obj));

export const pairs =
  <Value>(obj: objLit<Value>): Array<[string, Value]> =>
    map<string, [string, Value]>(
      Object.keys(obj) as string[],
      (key) => ([key, obj[key]])
    );

export const merge =
  <type>(obj: type, ...objs: Array<Partial<type>>): type =>
    Object.assign(Object.create(null), obj, ...objs);

export const get =
  <type>(obj: any, path: string, defaultValue: type): type => {
    let value = obj;
    const paths = path.split('.');
    while (paths.length) {
      const currentPath = paths.shift();
      value = value[currentPath || ''];
      if ((!value && paths.length) || typeof value === 'undefined') return defaultValue;
    }
    return value;
  };

export const set =
  <type extends { [id: string]: any }, value>(obj: type, path: string, value: value): type => {
    obj[path] = value;
    return obj;
  };

export const findKey =
  <type extends { [id: string]: any }>(obj: type, predicate: (key: string | number, value: any) => boolean) =>
    find(Object.keys(obj), (key) => predicate(key, obj[key]));

export const findValue =
  <type extends { [id: string]: any }>(obj: type, predicate: (key: string | number, value: any) => boolean) => {
    const valueKey = find(Object.keys(obj), (key) => predicate(key, obj[key]));
    if (valueKey) {
      return obj[valueKey];
    } else {
      return null;
    }
  };

