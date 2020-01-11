import { isFunction } from '../is/type';
import { NextFunction, Observable, Subscriber } from './Observable';
import { Operator } from './operators';


export class Subject<T> {
  protected subscriber: Subscriber<T>;

  protected readonly observable: Observable<T>;

  constructor(initialValue?: T) {
    this.observable = new Observable((subscriber) => {
      this.subscriber = subscriber;
    });
    if (initialValue) {
      this.next(initialValue);
    }
  }

  public next(value: T) {
    this.subscriber.next(value);
  }

  public complete() {
    if (this.subscriber.complete) {
      this.subscriber.complete();
    }
  }

  public pipe<R>(operator: Operator<T, R>): Observable<R> {
    return this.observable.pipe(operator);
  }

  public subscribe(subscription: Subscriber<T> | NextFunction<T>) {
    return this.observable.subscribe(subscription);
  }
}

export class ReplaySubject<T> extends Subject<T> {
  protected readonly history: T[] = [];

  constructor(
    private readonly replayCount: number,
    initialValue?: T,
  ) {
    super(initialValue);
  }

  public next(value: T) {
    this.history.unshift(value);
    if (this.history.length > this.replayCount) {
      this.history.pop();
    }
    this.subscriber.next(value);
  }

  public subscribe(subscription: Subscriber<T> | NextFunction<T>) {
    for (let i = 0; i < this.replayCount; ++i) {
      const value = this.history[i];
      if (isFunction(subscription)) {
        subscription(value);
      } else {
        subscription.next(value);
      }
    }
    return this.observable.subscribe(subscription);
  }
}

export class BehaviorSubject<T> extends ReplaySubject<T> {
  constructor(initialValue: T) {
    super(1, initialValue);
  }
  public value(): T {
    return this.history[0];
  }
}

export class StateSubject<T> extends Subject<T> {
  private value: T;

  constructor(initialValue: T) {
    super(initialValue);
  }

  public getValue(): T {
    return this.value;
  }

  public next(value: T) {
    this.value = value;
    this.subscriber.next(value);
  }

  public merge(update: Partial<T>) {
    this.next(Object.assign({}, this.value, update));
  }

  public subscribe(subscription: Subscriber<T> | NextFunction<T>) {
    if (isFunction(subscription)) {
      subscription(this.value);
    } else {
      subscription.next(this.value);
    }

    return this.observable.subscribe(subscription);
  }
}
