import { forEach, unique, filter, map } from '../array';
import { isString, isBoolean } from '../is/type';
import { isTag, isHTMLTag } from './html';
import { attachEvent } from './events';
const getAttributes = (el) => {
    const result = {};
    forEach([...(Array.from(el.attributes))], node => result[node.nodeName] = node.nodeValue || '');
    return result;
};
const renderTagToElement = (tag, el) => {
    forEach(unique([
        ...Object.keys(getAttributes(el)),
        ...Object.keys(tag.attributes),
    ]), propName => {
        if (typeof tag.attributes[propName] === 'undefined') {
            el.removeAttribute(propName);
        }
        else if (propName.toLowerCase().slice(0, 1) === 'on') {
            attachEvent(el, propName.slice(2).toLowerCase(), tag.attributes[propName]);
        }
        else if (isBoolean(tag.attributes[propName])) {
            if (!tag.attributes[propName] && !!el.getAttribute(propName)) {
                el.removeAttribute(propName);
            }
            else if (tag.attributes[propName] && !el.getAttribute(propName)) {
                el.setAttribute(propName, String(tag.attributes[propName]));
            }
        }
        else if (el.getAttribute(propName) !== String(tag.attributes[propName])) {
            el.setAttribute(propName, String(tag.attributes[propName]));
        }
    });
    forEach(tag.children, (childTag, i) => render(childTag, el, i));
    let i = el.childNodes.length - tag.children.length;
    while (i-- > 0) {
        if (el.lastChild)
            el.lastChild.remove();
    }
};
export const renderToElement = (tag, target = document.body) => {
    if (tag.name.toLowerCase() !== target.nodeName.toLowerCase()) {
        throw `Single Render attempting to render a ${target.nodeName} as ${tag.name}`;
    }
    else if (target.id !== '' && (tag.attributes.id || '') !== target.id) {
        throw `Single render attempting to render tag with id #${tag.attributes.id} to an element with the id of #${target.id}`;
    }
    renderTagToElement(tag, target);
    return target;
};
// This is ok because this will only ever come from one location.
let scriptCache;
export const renderToBody = (tag) => {
    scriptCache = scriptCache || map(filter([...document.body.childNodes], node => !!node && !!node.tagName && node.tagName.toLowerCase() === 'script'), (node) => ({
        name: 'script',
        element: node,
    }));
    if (tag.children.indexOf(scriptCache[0]) === -1) {
        tag.children.push(...scriptCache);
    }
    renderToElement(tag, document.body);
    return document.body;
};
export const render = (tag, parent = document.body, index = 0) => {
    let el = parent.childNodes[index];
    if (isString(tag)) {
        if (el && el.nodeType === Node.TEXT_NODE) {
            if (tag !== '') {
                if (el.nodeValue !== tag)
                    el.nodeValue = tag;
            }
            else {
                el.remove();
            }
        }
        else if (tag !== '') {
            el = document.createTextNode(tag);
            const childNodes = [...parent.childNodes];
            while (childNodes[index]) {
                const removeEl = childNodes.pop();
                if (removeEl)
                    removeEl.remove();
            }
            parent.appendChild(el);
        }
    }
    else if (isTag(tag)) {
        if (!el || el.nodeType !== Node.ELEMENT_NODE || el.tagName.toLowerCase() !== tag.name.toLowerCase()) {
            el = document.createElement(tag.name);
            const childNodes = [...parent.childNodes];
            while (childNodes[index]) {
                const removeEl = childNodes.pop();
                if (removeEl)
                    removeEl.remove();
            }
            parent.appendChild(el);
        }
        renderTagToElement(tag, el);
    }
    else if (isHTMLTag(tag) && tag.element !== el) {
        const childNodes = [...parent.childNodes];
        while (childNodes[index]) {
            const removeEl = childNodes.pop();
            if (removeEl)
                removeEl.remove();
        }
        parent.appendChild(tag.element);
        return tag.element;
    }
    return el;
};
