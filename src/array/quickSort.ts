const swap = <type>(array: type[], indexA: number, indexB: number): type[] => {
  const tmp = array[indexB];
  array[indexB] = array[indexA];
  array[indexA] = tmp;
  return array;
};

const fetch = <type>(value: type, valueMap: Map<type, number>, func: (val: type) => number): number | null => {
  if (value && !valueMap.get(value)) valueMap.set(value, func(value));
  return valueMap.get(value) || null;
};

export default function quickSort<type>(array: type[], func: (val: type) => number): type[] {
  let i = 1;
  const valueMap = new Map();
  while (i <= array.length) {
    const cVal = fetch(array[i], valueMap, func);
    const lVal = fetch(array[i - 1], valueMap, func);
    const gVal = fetch(array[i + 1], valueMap, func);
    if (cVal && lVal && cVal < lVal) {
      swap(array, i, i - 1);
    } else if (cVal && gVal && cVal > gVal) {
      swap(array, i, i + 1);
    } else {
      ++i;
    }
  }
  return array;
}
