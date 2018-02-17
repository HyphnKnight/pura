import { EventCallback } from './types';
export declare const attachEvent: (el: HTMLElement, type: string, func: EventCallback) => void;
export declare const auditEvents: (parent?: HTMLElement) => void;
