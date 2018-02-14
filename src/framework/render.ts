import { filter, forEach, map, unique } from '../array';
import { isBoolean, isString } from '../is/type';
import { attachEvent } from './events';
import { EventCallback, HTMLTag, isHTMLTag, isTag, Tag } from './html';


const getAttributes =
  (el: HTMLElement): { [prop: string]: string } => {
    const result: { [prop: string]: string } = {};
    forEach(
      [...(Array.from(el.attributes))],
      (node) => result[node.nodeName] = node.nodeValue || '',
    );
    return result;
  };

const renderTagToElement =
  (tag: Tag, el: HTMLElement): void => {
    forEach(
      unique([
        ...Object.keys(getAttributes(el as HTMLElement)),
        ...Object.keys(tag.attributes),
      ]),
      (propName) => {
        if (typeof tag.attributes[propName] === 'undefined') {
          (el as HTMLElement).removeAttribute(propName);
        } else if (propName.toLowerCase().slice(0, 1) === 'on') {
          attachEvent(el as HTMLElement, propName.slice(2).toLowerCase(), tag.attributes[propName] as EventCallback);
        } else if (isBoolean(tag.attributes[propName])) {
          if (!tag.attributes[propName] && !!(el as HTMLElement).getAttribute(propName)) {
            (el as HTMLElement).removeAttribute(propName);
          } else if (tag.attributes[propName] && !(el as HTMLElement).getAttribute(propName)) {
            (el as HTMLElement).setAttribute(propName, String(tag.attributes[propName]));
          }
        } else if ((el as HTMLElement).getAttribute(propName) !== String(tag.attributes[propName])) {
          (el as HTMLElement).setAttribute(propName, String(tag.attributes[propName]));
        }
      }
    );
    forEach(
      tag.children,
      (childTag, index) => render(childTag, el as HTMLElement, index),
    );
    let i = el.childNodes.length - tag.children.length;
    while (i-- > 0) {
      if (el.lastChild) (el.lastChild as HTMLElement).remove();
    }
  };

export const renderToElement =
  (tag: Tag, target: HTMLElement = document.body): HTMLElement => {
    if (tag.name.toLowerCase() !== target.nodeName.toLowerCase()) {
      throw new Error(`Single Render attempting to render a ${target.nodeName} as ${tag.name}`);
    } else if (target.id !== '' && (tag.attributes.id || '') !== target.id) {
      throw new Error(`Single render attempting to render tag with id #${tag.attributes.id} to an element with the id of #${target.id}`);
    }
    renderTagToElement(tag, target);
    return target;
  };

// This is ok because this will only ever come from one location.
let scriptCache: HTMLTag[];

export const renderToBody =
  (tag: Tag): HTMLElement => {
    scriptCache = scriptCache || map(
      filter(
        [...document.body.childNodes] as HTMLElement[],
        (node) => !!node && !!node.tagName && node.tagName.toLowerCase() === 'script',
      ),
      (node): HTMLTag => ({
        name: 'script',
        element: node,
      })
    );

    if (tag.children.indexOf(scriptCache[0]) === -1) {
      tag.children.push(...scriptCache);
    }

    renderToElement(tag, document.body);

    return document.body;
  };

export const render =
  (tag: Tag | HTMLTag | string, parent: HTMLElement = document.body, index: number = 0): HTMLElement => {
    let el = parent.childNodes[index];
    if (isString(tag)) {
      if (el && el.nodeType === Node.TEXT_NODE) {
        if (tag !== '') {
          if (el.nodeValue !== tag) el.nodeValue = tag;
        } else {
          (el as HTMLElement).remove();
        }
      } else if (tag !== '') {
        el = document.createTextNode(tag);
        const childNodes = [...parent.childNodes];
        while (childNodes[index]) {
          const removeEl = childNodes.pop();
          if (removeEl) (removeEl as HTMLElement).remove();
        }
        parent.appendChild(el);
      }
    } else if (isTag(tag)) {
      if (!el || el.nodeType !== Node.ELEMENT_NODE || (el as HTMLElement).tagName.toLowerCase() !== tag.name.toLowerCase()) {
        el = document.createElement(tag.name);
        const childNodes = [...parent.childNodes];
        while (childNodes[index]) {
          const removeEl = childNodes.pop();
          if (removeEl) (removeEl as HTMLElement).remove();
        }
        parent.appendChild(el);
      }
      renderTagToElement(tag, (el as HTMLElement));
    } else if (isHTMLTag(tag) && tag.element !== el) {
      const childNodes = [...parent.childNodes];
      while (childNodes[index]) {
        const removeEl = childNodes.pop();
        if (removeEl) (removeEl as HTMLElement).remove();
      }
      parent.appendChild(tag.element);
      return tag.element;
    }
    return el as HTMLElement;
  };
