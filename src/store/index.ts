import { isEqual } from '../is/type';
import { forEach, map, find } from '../array';
import { uniqueId } from '../string'

export type PossibleState = {
  subscribe?: never;
  __store__?: never;
  set?: never;
  JSON?: never;
  [prop: string]: any;
}

export interface Subscription<State extends PossibleState> {
  (newState: State, oldState: State): void
}

export type StoreProps<State extends PossibleState> = {
  subscriptions: { [id: string]: Subscription<State> };
  protectedSubscribe: (keys: (keyof State)[], func: Subscription<State>) => () => void;
  subscribe: (func: Subscription<State>) => () => void;
  set: (state: Partial<State>) => void;
  [Symbol.iterator]: () => Iterator<any>;
  __store__: State;
};

export type UnassignedStoreProps = {
  subscriptions: { [id: string]: Subscription<{}> };
  protectedSubscribe: (keys: (keyof {})[], func: Subscription<{}>) => () => void;
  subscribe: (func: Subscription<{}>) => () => void;
  set: (state: Partial<{}>) => void;
  [Symbol.iterator]: () => Iterator<any>;
  __store__: any;
};

type Store<State extends PossibleState> =
  StoreProps<State> & State;

const setStore =
  <State extends PossibleState>(store: Store<State>) =>
    (updateObj: Partial<State>) => {

      const objKeys = Object.keys(updateObj);

      let oldStore: State | undefined;

      if (objKeys.map(key => {

        if (!isEqual(updateObj[key], store.__store__[key])) {

          if (!oldStore) {

            oldStore = Object.assign({}, store.__store__);

          }

          store.__store__[key] = updateObj[key];

          return true;

        } else {

          return false;

        }

      }).some(x => x)) {

        forEach(
          Object.keys(store.subscriptions),
          key => store.subscriptions[key](store.__store__, oldStore as State)
        );

      }
    };

const protectedSubscribe =
  <state>(store: Store<state>) =>
    (keys: (keyof state)[], func: Subscription<state>) =>
      store.subscribe(
        (newState, oldstate) =>
          find(keys, key => newState[key] !== oldstate[key]) &&
          func(newState, oldstate),
      );

export const createStore =
  <State extends PossibleState>(protoObj: State) => {

    const subscriptions: Store<State>["subscriptions"] = {};
    const newStore: UnassignedStoreProps = {
      subscriptions: {},
      subscribe: (func: Subscription<State>) => {

        const key = uniqueId();

        subscriptions[key] = func;

        return () => {
          delete subscriptions[key];
        };
      },
      protectedSubscribe: () => () => { },
      set: () => { },
      [Symbol.iterator]: () => (function iteratorMaker(protoObj) {

        const objKeys = Object.keys(protoObj);

        let index = 0;

        return {
          next(): { done: boolean, value: any } {
            let result = { value: protoObj[objKeys[index]], done: true };

            if (index <= objKeys.length - 1) {
              result.done = false;
              ++index;
            }

            return result;
          },
        };
      })(protoObj),
      __store__: {},
    };

    forEach(
      Object.keys(protoObj),
      key => {
        newStore.__store__[key] = protoObj[key];

        Object.defineProperty(newStore, key, {
          set: value => {
            if (!isEqual(value, newStore.__store__[key])) {
              const oldStore = Object.assign({}, newStore.__store__);
              newStore.__store__[key] = value;
              Object.keys(subscriptions).forEach(key => subscriptions[key](newStore.__store__, oldStore));
            }
          },
          get: () => newStore.__store__[key]
        });

      }
    );

    Object.defineProperty(newStore, 'JSON', {
      set: string => newStore.set(JSON.parse(string)),
      get: () => JSON.stringify(newStore.__store__)
    });

    newStore.set = setStore(newStore);

    newStore.protectedSubscribe = protectedSubscribe(newStore);

    return Object.preventExtensions(newStore as Store<State>);

  };

export const multiSubscribe =
  (stores: Store<any>[], func: () => void): (() => void) => {
    const unsubscribes = map(
      stores,
      store => store.subscribe(func),
    );
    return () =>
      forEach(
        unsubscribes,
        unsubscribe => unsubscribe(),
      );
  }