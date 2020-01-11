import { Operator } from './operators';
export declare type NextFunction<T> = (value: T) => void;
export interface Subscriber<T> {
    next: NextFunction<T>;
    complete?: () => void;
    error?: (error: Error) => void;
}
export declare class Observable<T> {
    private isComplete;
    private readonly subscriptions;
    constructor(subscribe: (subscriber: Subscriber<T>) => void);
    subscribe(subscription: Subscriber<T> | NextFunction<T>): () => boolean;
    pipe<R>(operator: Operator<T, R>): Observable<R>;
    private next(value);
    private complete();
}
export declare function merge<T>(...observables: Array<Observable<T>>): Observable<T>;
