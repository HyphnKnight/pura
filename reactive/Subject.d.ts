import { NextFunction, Observable, Subscriber } from './Observable';
import { Operator } from './operators';
export declare class Subject<T> {
    protected subscriber: Subscriber<T>;
    protected readonly observable: Observable<T>;
    constructor(initialValue?: T);
    next(value: T): void;
    complete(): void;
    pipe<R>(operator: Operator<T, R>): Observable<R>;
    subscribe(subscription: Subscriber<T> | NextFunction<T>): () => boolean;
}
export declare class ReplaySubject<T> extends Subject<T> {
    private readonly replayCount;
    protected readonly history: T[];
    constructor(replayCount: number, initialValue?: T);
    next(value: T): void;
    subscribe(subscription: Subscriber<T> | NextFunction<T>): () => boolean;
}
export declare class BehaviorSubject<T> extends ReplaySubject<T> {
    constructor(initialValue: T);
    value(): T;
}
export declare class StateSubject<T> extends Subject<T> {
    private value;
    constructor(initialValue: T);
    getValue(): T;
    next(value: T): void;
    merge(update: Partial<T>): void;
    subscribe(subscription: Subscriber<T> | NextFunction<T>): () => boolean;
}
