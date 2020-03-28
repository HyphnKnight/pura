import {
  isString,
} from '../is/type';

export type EventCallback = (event: Event) => void;

export interface Tag {
  name: string;
  attributes: {
    [prop: string]: string | number | boolean | EventCallback;
  };
  children: (Tag | HTMLTag | string)[];
}

export interface HTMLTag {
  name: string;
  element: HTMLElement;
}

export const isTag =
  (unknown: any): unknown is Tag =>
    !!unknown &&
    !unknown.nodeType &&
    isString(unknown.name) &&
    !!unknown.attributes &&
    !!unknown.children;

export const isHTMLTag =
  (unknown: any): unknown is HTMLTag =>
    !!unknown &&
    isString(unknown.name) &&
    !!unknown.element;
