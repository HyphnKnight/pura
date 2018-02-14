import { all, find } from '../array';
import { is } from './index';

/* Type Testing */

export const isNull = is<null>((u) => u === null);
export const isUndefined = is<undefined>((u) => typeof u === 'undefined');
export const isNullOrUndefined = is<null | undefined>((u) => isNull(u) || isUndefined(u));
export const isString = is<string>((u) => typeof u === 'string');
export const isNumber = is<number>((u) => typeof u === 'number');
export const isBoolean = is<boolean>((u) => typeof u === 'boolean');
export const isDate = is<Date>((u) => Object.prototype.toString.call(u) === '[object Date]');
export const isFunction = is<Function>((u) => !!u && u.constructor && u.call && u.apply);
export const isArray = is<any[]>((u) => Array.isArray(u));
export const isArrayOf =
  <type>(func: (u: any) => boolean) =>
    (u: any): u is type[] =>
      !!u &&
      Array.isArray(u) &&
      all(u, func);
export const isArrayOfNumbers = isArrayOf<number>(isNumber);
export const isArrayOfStrings = isArrayOf<string>(isString);
export const isArrayOfDates = isArrayOf<Date>(isDate);
export const isArrayOfFunctions = isArrayOf<Function>(isFunction);
export const isMap = is<Map<any, any>>((u) => !!u && u.__proto__ === Map.prototype);
export const isMapOfTo =
  <key, value>(keyFunc: (u: any) => boolean, valueFunc: (u: any) => boolean) =>
    (u: any): u is Map<key, value> =>
      isMap(u) &&
      all([...u.keys()], keyFunc) &&
      all([...u.values()], valueFunc);
export const isSet = is<Set<any>>((u) => !!u && u.__proto__ === Set.prototype);
export const isSetOf =
  <type>(func: (u: any) => boolean) =>
    (u: any): u is Set<type> =>
      isSet(u) &&
      all([...u.entries()], func);

export const isObjectLiteral = is<{ [propertyName: string]: any }>(
  (u: any) => {
    if (!u || typeof u !== 'object') return false;

    let tmp = u;

    while (true) {
      tmp = Object.getPrototypeOf(tmp);
      if (tmp === null) {
        break;
      }
    }

    return Object.getPrototypeOf(u) === tmp;
  }
);

export const isNode = is<Node>(
  (u) =>
    typeof Node === 'object'
      ? u instanceof Node
      : u && typeof u === 'object' && typeof u.nodeType === 'number' && typeof u.nodeName === 'string'
);

export const isElement = is<HTMLElement>(
  (u) =>
    typeof HTMLElement === 'object'
      ? u instanceof HTMLElement
      : u && typeof u === 'object' && u !== null && u.nodeType === 1 && typeof u.nodeName === 'string'
);

export const isComparable = is<number | boolean | string | symbol | Function>(
  (u: any) =>
    isNullOrUndefined(u) ||
    isNumber(u) ||
    isBoolean(u) ||
    isString(u) ||
    isFunction(u) ||
    typeof u === 'symbol'
);

export const isFalsey = is<null | undefined | false | ''>(
  (u: any) =>
    isNullOrUndefined(u) ||
    (isBoolean(u) && !u) ||
    (isString(u) && u === '')
);

/* Comparison */

export function isEqual(valueA: any, valueB: any): boolean {
  if (isComparable(valueA) && isComparable(valueB)) {
    return valueA === valueB;
  } else if (isArray(valueA) && isArray(valueB)) {
    return valueA.length === valueB.length &&
      !find(valueA, (value: any, index: number) => !isEqual(value, valueB[index]));
  } else if (isObjectLiteral(valueA) && isObjectLiteral(valueB)) {
    const keysA = Object.keys(valueA);
    const keysB = Object.keys(valueB);
    return keysA.length === keysB.length &&
      !find(keysA, (key: string) => !isEqual(valueA[key], valueB[key]));
  } else if (isMap(valueA) && isMap(valueB)) {
    const keysA = [...valueA.keys()];
    const keysB = [...valueB.keys()];
    return keysA.length === keysB.length &&
      !find(keysA, (key: string) => !isEqual(valueA.get(key), valueB.get(key)));
  } else if (isSet(valueA) && isSet(valueB)) {
    return valueA.size === valueB.size &&
      isEqual([...valueA.entries()], [...valueB.entries()]);
  }
  return false;
}
