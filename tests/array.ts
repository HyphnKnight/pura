import { suite } from '../src/test';
import {
  forEach,
  reduce,
  reduceRight,
  map,
  mapToObject,
  mapToMap,
  filter,
  find,
  times,
  difference,
  intersection,
  flatten,
  unique,
  uniqueBy,
  countBy,
  invoke,
  concat,
  union,
  reverse,
  heuristicFind,
} from '../src/array';

export default () => {
  const testArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const testDoubleArray = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
  const str = `012345678910`;
  const strDouble = `02468101214161820`;
  const strRev = `109876543210`;
  const strOdd = `13579`;
  suite('Basic Array', [
    [
      'forEach',
      () => {
        let inc = 0;
        let testStr = '';
        forEach(
          testArray,
          num => {
            inc++;
            testStr += num;
          }
        );
        if (inc !== 11) {
          throw 'Did not iterate the correct amount of times.';
        } else if (testStr !== str) {
          throw 'Did not iterate in the correct order.';
        }
      }
    ],
    [
      'reduce',
      () => {
        let inc = 0;
        const testStr = reduce(
          testArray,
          (testStr, num) => {
            inc++;
            return testStr + num;
          },
          '',
        );
        if (inc !== 11) {
          throw 'Did not iterate the correct amount of times.';
        } else if (testStr !== str) {
          throw 'Did not properly accumulate the final value.';
        }
      }
    ],
    [
      'reduceRight',
      () => {
        let inc = 0;
        const testStr = reduceRight(
          testArray,
          (testStr, num) => {
            inc++;
            return testStr + num;
          },
          '',
        );
        if (inc !== 11) {
          throw 'Did not iterate the correct amount of times.';
        } else if (testStr !== strRev) {
          throw 'Did not properly accumulate the final value.';
        }
      }
    ],
    [
      'map',
      () => {
        let inc = 0;
        const doubleArray = map(
          testArray,
          num => {
            inc++;
            return num * 2;
          }
        );
        if (inc !== 11) {
          throw 'Did not iterate the correct amount of times.';
        } else if (strDouble !== doubleArray.join('')) {
          throw `Did not properly transform the values,\n    was ${doubleArray.join('')} should be ${strDouble}`;
        }
      }
    ],
    [
      'mapToObject',
      () => {
        let inc = 0;
        const mappedObject = mapToObject(
          testArray,
          num => {
            inc++;
            return `_${num}_`;
          }
        );
        if (inc !== 11) {
          throw 'Did not iterate the correct amount of times.';
        } else if (mappedObject._1_ !== 1 || mappedObject._10_ !== 10) {
          throw `Did not properly create keys.`;
        }
      }
    ],
    [
      'mapToMap',
      () => {
        let inc = 0;
        const mappedMap = mapToMap(
          testArray,
          num => {
            inc++;
            return [`_${num}_`, num];
          }
        );
        if (inc !== 11) {
          throw 'Did not iterate the correct amount of times.';
        } else if (mappedMap.get('_1_') !== 1 || mappedMap.get('_10_') !== 10) {
          throw `Did not properly create keys.`;
        }
      }
    ],
    [
      'filter',
      () => {
        let inc = 0;
        const oddArray = filter(
          testArray,
          num => {
            inc++;
            return num % 2 !== 0;
          }
        );
        if (inc !== 11) {
          throw 'Did not iterate the correct amount of times.';
        } else if (strOdd !== oddArray.join('')) {
          throw `Did not properly transform the values,\n    was ${oddArray.join('')} should be ${strOdd}`;
        }
      }
    ],
    [
      'find',
      () => {
        const seven = find(testArray, num => num === 7);
        if (seven !== 7) {
          throw `Did not find the correct value.`;
        }
      }
    ],
    [
      'times',
      () => {
        let inc = 0;
        const timesArray = times(
          11,
          num => {
            inc++;
            return num;
          }
        );
        if (inc !== 11) {
          throw 'Did not iterate the correct amount of times.';
        } else if (str !== timesArray.join('')) {
          throw `Did not pass through the correct values,\n    was ${timesArray.join('')} should be ${str}`;
        }
      }
    ],
    [
      'difference',
      () => {
        const correctStr = '13579';
        const diffArray = difference(testArray, testDoubleArray);
        if (correctStr !== diffArray.join('')) {
          throw `Did not properly find the difference,\n    was ${diffArray.join('')} should be ${correctStr}`;
        }
      }
    ],
    [
      'intersection',
      () => {
        const correctStr = '0246810';
        const intersectionArray = intersection(testArray, testDoubleArray);
        if (correctStr !== intersectionArray.join('')) {
          throw `Did not properly find the intersection,\n    was ${intersectionArray.join('')} should be ${correctStr}`;
        }
      }
    ],
    [
      'flatten',
      () => {
        const correctStr = '01234567891002468101214161820';
        const flattenedArray = flatten([testArray, testDoubleArray]);
        if (correctStr !== flattenedArray.join('')) {
          throw `Did not properly flatten arrays,\n    was ${flattenedArray.join('')} should be ${correctStr}`;
        }
      }
    ],
    [
      'unique',
      () => {
        const correctStr = '0123456789101214161820';
        const uniqueArray = unique([...testArray, ...testDoubleArray]);
        if (correctStr !== uniqueArray.join('')) {
          throw `Did not properly find the unique values,\n    was ${uniqueArray.join('')} should be ${correctStr}`;
        }
      }
    ],
    [
      'uniqueBy',
      () => {
        const correctStr = '0123456789101214161820';
        const uniqueArray = uniqueBy(
          [...testArray, ...testDoubleArray],
          value => value,
        );
        if (correctStr !== uniqueArray.join('')) {
          throw `Did not properly find the unique values,\n    was ${uniqueArray.join('')} should be ${correctStr}`;
        }
      }
    ],
    [
      'countBy',
      () => {
        const correctStr = '0123456789101214161820';
        const counted = countBy(
          testArray,
          (num) => num % 2 === 0
            ? 'even'
            : 'odd'
        );
        if (counted.even !== 6 || counted.odd !== 5) {
          throw `Did not properly count the number of even and odd numbers.`;
        }
      }
    ],
    [
      'invoke',
      () => {
        let testStr = '';
        const testFunctions = [
          () => testStr += 0,
          () => testStr += 1,
          () => testStr += 2,
          () => testStr += 3,
          () => testStr += 4,
          () => testStr += 5,
          () => testStr += 6,
          () => testStr += 7,
          () => testStr += 8,
          () => testStr += 9,
          () => testStr += 10,
        ];
        invoke(testFunctions);
        if (testStr !== str) {
          throw 'Did not properly execute all the functions.';
        }
      }
    ],
    [
      'concat',
      () => {
        const correctStr = '01234567891002468101214161820';
        const flattenedArray = concat(testArray, testDoubleArray);
        if (correctStr !== flattenedArray.join('')) {
          throw `Did not properly concat arrays,\n    was ${flattenedArray.join('')} should be ${correctStr}`;
        }
      }
    ],
    [
      'union',
      () => {
        const correctStr = '0123456789101214161820';
        const unionArray = union(testArray, testDoubleArray);
        if (correctStr !== unionArray.join('')) {
          throw `Did not properly find the unique values,\n    was ${unionArray.join('')} should be ${correctStr}`;
        }
      }
    ],
    [
      'reverse',
      () => {
        const result = reverse(testArray).join('');
        if (result !== strRev) {
          throw `Did not properly reverse the array,\n    was ${result} should be ${strRev}`;
        }
      }
    ],
    [
      'heuristicFind',
      () => {
        // Not tested by itself test instead by
        // mergeSort and quickSort
      }
    ],
  ]);
};