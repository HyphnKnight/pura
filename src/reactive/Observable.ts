import { isFunction } from '../is/type';
import { Operator } from './operators';


export type NextFunction<T> = (value: T) => void;

export interface Subscriber<T> {
  next: NextFunction<T>;
  complete?: () => void;
  error?: (error: Error) => void;
}

export class Observable<T> {
  private isComplete = false;
  private readonly subscriptions: Set<Subscriber<T> | NextFunction<T>>;

  constructor(subscribe: (subscriber: Subscriber<T>) => void) {
    subscribe({
      next: (value) => this.next(value),
      complete: () => this.complete(),
    } as Subscriber<T>);
  }

  public subscribe(subscription: Subscriber<T> | NextFunction<T>) {
    this.subscriptions.add(subscription);
    return () => this.subscriptions.delete(subscription);
  }

  public pipe<R>(operator: Operator<T, R>): Observable<R> {
    return operator(this);
  }

  private next(value: T) {
    if (this.isComplete) {
      throw new Error('Attempted add a next value after the observble had already completed');
    }

    this.subscriptions.forEach((subscription) => {
      if (isFunction(subscription)) {
        subscription(value);
      } else {
        subscription.next(value);
      }
    });
  }

  private complete() {
    this.isComplete = true;
    this.subscriptions.forEach((subscription) => {
      if (!isFunction(subscription) && subscription.complete) {
        subscription.complete();
      }
    });
    this.subscriptions.clear();
  }
}

export function merge<T>(...observables: Array<Observable<T>>): Observable<T> {
  return new Observable((subscriber) => {
    observables.forEach((observable) => {
      observable.subscribe(subscriber);
    });
  });
}
