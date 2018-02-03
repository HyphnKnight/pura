import { reduce, countBy, heuristicFind } from '../array';
import mergeSort from '../array/mergeSort';

const mergeFind = heuristicFind(mergeSort);

export const mean =
  <type>(array: type[], func: (val: type) => number) =>
    reduce(array, (sum, val) => sum + func(val), 0) / array.length;

export const mode =
  <type>(array: type[], func: (val: type) => number) => {
    const count = countBy(array, func);
    return mergeFind(Object.keys(count), key => count[key]);
  };

export const median =
  <type>(array: type[], func: (val: type) => number) => {
    const sortedArray = mergeSort([...array], func);
    const middle = array.length / 2;
    return middle % 1 === 0
      ? sortedArray[middle]
      : (func(sortedArray[Math.floor(middle)]) + func(sortedArray[Math.ceil(middle)])) / 2;
  };
