import { isFunction } from '../is/type';
export class Observable {
    constructor(subscribe) {
        this.isComplete = false;
        subscribe({
            next: (value) => this.next(value),
            complete: () => this.complete(),
        });
    }
    subscribe(subscription) {
        this.subscriptions.add(subscription);
        return () => this.subscriptions.delete(subscription);
    }
    pipe(operator) {
        return operator(this);
    }
    next(value) {
        if (this.isComplete) {
            throw new Error('Attempted add a next value after the observble had already completed');
        }
        this.subscriptions.forEach((subscription) => {
            if (isFunction(subscription)) {
                subscription(value);
            }
            else {
                subscription.next(value);
            }
        });
    }
    complete() {
        this.isComplete = true;
        this.subscriptions.forEach((subscription) => {
            if (!isFunction(subscription) && subscription.complete) {
                subscription.complete();
            }
        });
        this.subscriptions.clear();
    }
}
export function merge(...observables) {
    return new Observable((subscriber) => {
        observables.forEach((observable) => {
            observable.subscribe(subscriber);
        });
    });
}
