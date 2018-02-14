export function raycast<Data>(
  start: Data,
  getNext: (data: Data) => Data,
  resistFunc: (data: Data) => number,
  maxResist: number = Number.MAX_VALUE
): Data[] | false {
  const ray = [];
  let current = getNext(start);
  let resistance = 0;
  while (!!current && resistance < maxResist) {
    ray.push(current);
    current = getNext(current);
    resistance += resistFunc(current);
  }
  return ray;
}
