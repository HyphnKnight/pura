import { uniqueId } from '../string';

export const identity =
  <T>(x: T): T =>
    x;

export const applyTo =
  <type, result>(arg: type) =>
    (func: (arg: type) => result) =>
      func(arg);

export const curry =
  <T1, T2, R>(func: (a: T1, b: T2) => R, var1: T1) =>
    (var2: T2) =>
      func(var1, var2);

export function debounce(func: Function, wait: number, leading: boolean = true, maxWait: number = Number.MAX_VALUE) {

  let invokeTime = 0;

  if (leading) {

    return function debounceLeadingInside(...args: any[]) {

      const time = Date.now();

      if (time - invokeTime > wait) {
        invokeTime = Date.now();
        func(...args);
      }

    };

  } else {

    let attemptedInvoke = 0;
    let delay: any;
    let argsData: any[];

    return function debounceTrailingInside(...args: any[]) {
      argsData = args;
      const time = Date.now();

      if (attemptedInvoke === 0) {
        attemptedInvoke = time;
      }

      if (!!delay && time - attemptedInvoke < maxWait) {
        window.clearTimeout(delay);
      }

      if (time - attemptedInvoke < maxWait) {
        delay = setTimeout(() => {
          attemptedInvoke = 0;
          func(...argsData);
        }, wait);
      }

    };

  }

}

export const once = <type>(func: () => type) => {
  let hasBeenCalled = false;
  return () => {
    if (!hasBeenCalled) {
      hasBeenCalled = true;
      func();
    }
  };
};

export const compose =
  <type>(...funcs: Function[]) =>
    (startValue: any): type => {
      let result = startValue;
      for (let i = funcs.length - 1; i >= 0; --i) {
        result = funcs[i](result);
      }
      return result;
    };

export const pipe =
  <type>(...funcs: Function[]) =>
    (startValue: any): type => {
      let result = startValue;
      for (let i = 0, len = funcs.length; i < len; ++i) {
        result = funcs[i](result);
      }
      return result;
    };

const memoizedDB: { [id: string]: { [key: string]: any } } = {};

export const memoize =
  <type, result>(func: (...args: type[]) => result) => {
    const id = uniqueId();
    memoizedDB[id] = {};
    const memoized =
      (...args: any[]) => {
        const key = JSON.stringify(args);
        return memoizedDB[id][key] = (memoizedDB[id][key] || func(...args)) as result;
      };
    return memoized;
  };

