import { Observable } from './Observable';

export type Operator<T, R> = (obs: Observable<T>) => Observable<R>;

export function map<T, R>(operationFunc: (value: T) => R): Operator<T, R> {
  return (source: Observable<T>) => new Observable(({ next, complete }) => {
    source.subscribe({
      next: (value) => {
        next(operationFunc(value));
      },
      complete: () => {
        if (complete) complete();
      },
    });
  });
}

export function filter<T>(predicate: (value: T) => boolean) {
  return (source: Observable<T>) => new Observable(({ next, complete }) => {
    source.subscribe({
      next: (value) => {
        if (predicate(value)) {
          next(value);
        }
      },
      complete: () => {
        if (complete) complete();
      },
    });
  });
}
