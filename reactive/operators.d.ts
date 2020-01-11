import { Observable } from './Observable';
export declare type Operator<T, R> = (obs: Observable<T>) => Observable<R>;
export declare function map<T, R>(operationFunc: (value: T) => R): Operator<T, R>;
export declare function filter<T>(predicate: (value: T) => boolean): (source: Observable<T>) => Observable<{}>;
