import { filter, forEach, map } from '../array';
import { isString } from '../is/type';

const isNode = typeof window === 'undefined';

const success =
  (description: string) =>
    !isNode
      ? console.log(`  %c[PASS] %c${description}`, `color:green;`, `color:black;`)
      : console.log(`  \x1b[32m[PASS]\x1b[0m ${description}`);

const fail =
  (description: string, message: string) =>
    !isNode
      ? console.log(`  %c[FAIL] %c${description}\n    ${message}`, `color:red;`, `color:black;`)
      : console.log(`  \x1b[31m[FAIL]\x1b[0m ${description}\n    ${message}`);

const suiteLog =
  (title: string, percentage: number) => {
    if (isNode) {
      if (percentage === 100) {
        console.log(`\x1b[32m${title}\x1b[0m`);
      } else {
        console.log(`${title} \x1b[31m[${percentage}%]\x1b[0m`);
      }
    } else {
      if (percentage === 100) {
        console.log(`%c${title}`, `color:green;`);
      } else {
        console.log(`${title} %c[${percentage}%]`, `color:red;`);
      }
    }
  };

type Test = [string, () => void];
type TestAsync = [string, () => Promise<void>];
type TestResult = [true, string] | [false, string, string];

export const suite =
  (title: string, tests: Test[]) => {
    try {
      const results = map(
        tests,
        (testDetails) => test(testDetails[0], testDetails[1]),
      );

      const correct = filter(results, (x) => x[0]).length;
      const percentage = Math.floor(correct / tests.length * 100);

      suiteLog(title, percentage);
      forEach(
        results,
        (result) => result[0]
          ? success(result[1])
          : fail(result[1], result[2] as string),
      );

      return percentage === 100;
    } catch (e) {
      fail(title, isString(e) ? e : e.message);
      return false;
    }
  };

export const suiteAsync =
  async (title: string, tests: TestAsync[]) => {
    try {
      const results = await Promise.all(map(
        tests,
        (testDetails) => testAsync(testDetails[0], testDetails[1]),
      ));

      const correct = filter(results, (x) => x[0]).length;
      const percentage = Math.floor(correct / tests.length * 100);

      suiteLog(title, percentage);
      forEach(
        results,
        (result) => result[0]
          ? success(result[1])
          : fail(result[1], result[2] as string),
      );

      return percentage === 100;
    } catch (e) {
      fail(title, isString(e) ? e : e.message);
      return false;
    }
  };

const test =
  (description: string, testFunction: () => void): TestResult => {
    try {
      testFunction();
      return [true, description];
    } catch (e) {
      return [false, description, isString(e) ? e : e.message];
    }
  };

const testAsync =
  async (description: string, testFunction: () => Promise<void>): Promise<TestResult> => {
    try {
      await testFunction();
      return [true, description];
    } catch (e) {
      return [false, description, isString(e) ? e : e.message];
    }
  };
