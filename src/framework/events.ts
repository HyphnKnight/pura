import { EventCallback } from './types';

const events: Map<string, Map<HTMLElement, EventCallback>> = new Map();

export const attachEvent =
  (el: HTMLElement, type: string, func: EventCallback) => {
    let typeMap = events.get(type);
    if (!typeMap) {
      typeMap = new Map();
      events.set(type, typeMap);
      document.body.addEventListener(type, (event) => {
        const callback = (typeMap as Map<HTMLElement, EventCallback>).get(event.target as HTMLElement);
        if (callback) callback(event);
      });
    }
    typeMap.set(el, func);
  };

export const auditEvents =
  (parent: HTMLElement = document.body) =>
    events.forEach(
      (eventMap) =>
        eventMap.forEach(
          (_, el) => !parent.contains(el) && eventMap.delete(el),
        )
    );
