import { Observable } from './Observable';
export function map(operationFunc) {
    return (source) => new Observable(({ next, complete }) => {
        source.subscribe({
            next: (value) => {
                next(operationFunc(value));
            },
            complete: () => {
                if (complete)
                    complete();
            },
        });
    });
}
export function filter(predicate) {
    return (source) => new Observable(({ next, complete }) => {
        source.subscribe({
            next: (value) => {
                if (predicate(value)) {
                    next(value);
                }
            },
            complete: () => {
                if (complete)
                    complete();
            },
        });
    });
}
