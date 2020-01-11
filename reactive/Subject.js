import { isFunction } from '../is/type';
import { Observable } from './Observable';
export class Subject {
    constructor(initialValue) {
        this.observable = new Observable((subscriber) => {
            this.subscriber = subscriber;
        });
        if (initialValue) {
            this.next(initialValue);
        }
    }
    next(value) {
        this.subscriber.next(value);
    }
    complete() {
        if (this.subscriber.complete) {
            this.subscriber.complete();
        }
    }
    pipe(operator) {
        return this.observable.pipe(operator);
    }
    subscribe(subscription) {
        return this.observable.subscribe(subscription);
    }
}
export class ReplaySubject extends Subject {
    constructor(replayCount, initialValue) {
        super(initialValue);
        this.replayCount = replayCount;
        this.history = [];
    }
    next(value) {
        this.history.unshift(value);
        if (this.history.length > this.replayCount) {
            this.history.pop();
        }
        this.subscriber.next(value);
    }
    subscribe(subscription) {
        for (let i = 0; i < this.replayCount; ++i) {
            const value = this.history[i];
            if (isFunction(subscription)) {
                subscription(value);
            }
            else {
                subscription.next(value);
            }
        }
        return this.observable.subscribe(subscription);
    }
}
export class BehaviorSubject extends ReplaySubject {
    constructor(initialValue) {
        super(1, initialValue);
    }
    value() {
        return this.history[0];
    }
}
export class StateSubject extends Subject {
    constructor(initialValue) {
        super(initialValue);
    }
    getValue() {
        return this.value;
    }
    next(value) {
        this.value = value;
        this.subscriber.next(value);
    }
    merge(update) {
        this.next(Object.assign({}, this.value, update));
    }
    subscribe(subscription) {
        if (isFunction(subscription)) {
            subscription(this.value);
        }
        else {
            subscription.next(this.value);
        }
        return this.observable.subscribe(subscription);
    }
}
