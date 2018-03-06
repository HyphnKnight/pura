(function () {
'use strict';

function forEach(array, func) {
    let i = -1;
    while (++i < array.length)
        func(array[i], i, array);
    return array;
}
function reduce(array, func, base) {
    let i = -1;
    while (++i < array.length)
        base = func(base, array[i], i, array);
    return base;
}
const map = (array, func) => reduce(array, (result, value, index, self) => {
    result.push(func(value, index, self));
    return result;
}, []);
const filter = (array, func = (x) => !!x) => reduce(array, (result, value, index, self) => func(value, index, self)
    ? (result.push(value), result)
    : result, []);
const indexOf = (array, value) => {
    let i = -1;
    while (++i < array.length) {
        if (array[i] === value)
            return i;
    }
    return null;
};
const unique = (array) => filter(array, (value, index, self) => indexOf(self, value) === index);

/* General Type Discovery */
const is = (func = (x) => !!x) => (unknown) => func(unknown);

const isUndefined = is((u) => typeof u === 'undefined');
const isString = is((u) => typeof u === 'string');
const isNumber = is((u) => typeof u === 'number');
const isBoolean = is((u) => typeof u === 'boolean');
const isFunction = is((u) => !!u && u.constructor && u.call && u.apply);
const isArray = is((u) => Array.isArray(u));
const isNode = is((u) => typeof Node === 'object'
    ? u instanceof Node
    : u && typeof u === 'object' && typeof u.nodeType === 'number' && typeof u.nodeName === 'string');

const uniqueId = () => Math.random().toString(36).substr(2, 9);

const isTag = (unknown) => !!unknown &&
    !unknown.nodeType &&
    isString(unknown.name) &&
    !!unknown.attributes &&
    !!unknown.children;
const isHTMLTag = (unknown) => !!unknown &&
    isString(unknown.name) &&
    !!unknown.element;

const isAlphaChar = (c) => c >= 'A' && c <= 'z';
const isWhitespaceChar = (c) => c === '\n' ||
    c === ' ' ||
    c === '\t';
const isNumberChar = (c) => c >= '0' && c <= '9';
const parser = (html, eventMap, tags) => {
    if (html[0] !== '<') {
        throw new Error(`Invalid first character, must be a '<' found a ${html[0]}`);
    }
    const content = [];
    let activeTag = null;
    let cIndex = -1;
    let i = -1;
    let char = '';
    let activeString = '';
    let attrName = '';
    let buildingTag = '';
    while (i < html.length) {
        char = html[++i];
        activeString = '';
        if (char === '<' && html[i + 1] === '/') {
            // end tag
            ++i;
            char = html[++i];
            // loop past whitespace
            while (isWhitespaceChar(char))
                char = html[++i];
            // check for proper tag name start char
            if (!isAlphaChar(char)) {
                throw new Error(`Invalid tag name discovered first character can't be ${char}`);
            }
            // loop through tag name
            while (!isWhitespaceChar(char) && (isAlphaChar(char) || char === '-' || isNumberChar(char)) && char) {
                activeString += char;
                char = html[++i];
            }
            // loop past whitespace
            while (isWhitespaceChar(char))
                char = html[++i];
            if (char === '>') {
                activeTag = content[cIndex];
                activeString = activeString.toUpperCase();
                if (activeTag.name === activeString) {
                    activeString = '';
                    const parent = content[--cIndex];
                    if (!parent) {
                        return activeTag;
                    }
                    else {
                        parent.children.push(activeTag);
                    }
                }
                else {
                    throw new Error(`Invalid html attempting to close ${activeString} before closing ${content[cIndex].name}.`);
                }
            }
            else {
                throw new Error(`Invalid end tag discovered expected closing '>' found ${char}.`);
            }
        }
        else if (char === '<') {
            // tag
            activeString = '';
            char = html[++i];
            // check for proper tag name start char
            if (!isAlphaChar(char)) {
                throw new Error(`Invalid tag name discovered first character can't be ${char}.`);
            }
            // loop through tag name
            while (!isWhitespaceChar(char) && (isAlphaChar(char) || char === '-' || isNumberChar(char)) && char) {
                activeString += char;
                char = html[++i];
            }
            // check for valid next char
            if (isWhitespaceChar(char) || char === '/' || char === '>') {
                activeTag = {
                    name: activeString.toUpperCase(),
                    attributes: {},
                    children: [],
                };
                content[++cIndex] = activeTag;
                activeString = '';
                // loop past whitespace
                while (isWhitespaceChar(char))
                    char = html[++i];
                // loop through attributes
                // stop if find end of tag
                while (!(char === '>' || (char === '/' && html[i + 1] === '>'))) {
                    // loop past whitespace
                    while (isWhitespaceChar(char))
                        char = html[++i];
                    // loop through name
                    if (!isAlphaChar(char)) {
                        throw new Error(`Invalid property name discovered first character can't be ${char}.`);
                    }
                    // loop through property name
                    while (!isWhitespaceChar(char) && (isAlphaChar(char) || char === '-' || isNumberChar(char)) && char) {
                        activeString += char;
                        char = html[++i];
                    }
                    attrName = activeString;
                    activeString = '';
                    // loop past whitespace
                    while (isWhitespaceChar(char))
                        char = html[++i];
                    // is valued attribute
                    if (char === '=') {
                        char = html[++i];
                        // loop past whitespace
                        while (isWhitespaceChar(char))
                            char = html[++i];
                        if (char === '"') {
                            char = html[++i];
                            while (char !== '"' || html[i - 1] === '\\') {
                                activeString += char;
                                char = html[++i];
                            }
                            char = html[++i];
                            activeTag.attributes[attrName] = eventMap.get(activeString) || activeString;
                            activeString = '';
                        }
                        else {
                            throw new Error(`Invalid property value must be wrapped in quotes.`);
                        }
                    }
                    else {
                        activeTag.attributes[attrName] = true;
                    }
                    // loop past whitespace
                    while (isWhitespaceChar(char))
                        char = html[++i];
                }
                if (char !== '>') {
                    // this is self closing
                    i += 2;
                    if (content[cIndex - 1]) {
                        const parent = content[cIndex - 1];
                        parent.children.push(activeTag);
                    }
                    else {
                        if (cIndex !== 0) {
                            throw new Error(`Unclosed tag ${content[cIndex].name}.`);
                        }
                        else {
                            return content[cIndex];
                        }
                    }
                }
            }
            else {
                throw new Error(`Invalid tag name discovered ${activeString + char}.`);
            }
        }
        else {
            // string handling
            while (char !== '<' && char) {
                if (char === 't' && html[i + 1] === 'a' && html[i + 2] === 'g' && html[i + 3] === '_' && html[i + 13] === '_') {
                    buildingTag = html.slice(i, i + 14);
                    i += 14;
                    const insertTag = tags.get(buildingTag);
                    if (insertTag) {
                        content[cIndex].children.push(activeString, insertTag);
                        activeString = '';
                    }
                    else {
                        activeString += buildingTag;
                    }
                }
                else {
                    activeString += char;
                }
                char = html[++i];
            }
            if (char === '<') {
                --i;
                content[cIndex].children.push(activeString);
            }
        }
    }
    if (cIndex !== 0) {
        throw new Error(`Unclosed tag ${content[cIndex].name}.`);
    }
    else {
        return content[cIndex];
    }
};
const parseParameter = (events, tags, parameter) => {
    if (isUndefined(parameter) || (!parameter && isBoolean(parameter))) {
        return null;
    }
    else if (isString(parameter) || isNumber(parameter) || isBoolean(parameter)) {
        return String(parameter);
    }
    else if (isFunction(parameter)) {
        const eventKey = `evt_${uniqueId()}_`;
        events.set(eventKey, parameter);
        return eventKey;
    }
    else if (isTag(parameter)) {
        const tagKey = `tag_${uniqueId()}_`;
        tags.set(tagKey, parameter);
        return tagKey;
    }
    else if (isArray(parameter) && parameter.length) {
        let html = '';
        forEach(parameter, (param) => html += parseParameter(events, tags, param));
        return html;
    }
    else if (isNode(parameter)) {
        const tagKey = `tag_${uniqueId()}_`;
        const newHTMLTag = {
            name: parameter.tagName,
            element: parameter,
        };
        tags.set(tagKey, newHTMLTag);
        return tagKey;
    }
    return null;
};
const tag = (str, ...parameters) => {
    const events = new Map();
    const tags = new Map();
    let htmlText = '';
    let i = -1;
    while (++i < str.length) {
        htmlText += str[i];
        const parameter = parseParameter(events, tags, parameters[i]);
        if (parameter)
            htmlText += parameter;
    }
    return parser(htmlText.trim(), events, tags);
};

const events = new Map();
const attachEvent = (el, type, func) => {
    let typeMap = events.get(type);
    if (!typeMap) {
        typeMap = new Map();
        events.set(type, typeMap);
        document.body.addEventListener(type, (event) => {
            const callback = typeMap.get(event.target);
            if (callback)
                callback(event);
        });
    }
    typeMap.set(el, func);
};

const getAttributes = (el) => {
    const result = {};
    forEach([...Array.from(el.attributes)], (node) => result[node.nodeName] = node.nodeValue || '');
    return result;
};
// This is ok because this will only ever come from one location.
let scriptCache;
const renderToBody = (tag) => {
    scriptCache = scriptCache || map(filter([...document.body.childNodes], (node) => !!node && !!node.tagName && node.tagName.toLowerCase() === 'script'), (node) => ({
        name: 'script',
        element: node,
    }));
    if (tag.children.indexOf(scriptCache[0]) === -1) {
        tag.children.push(...scriptCache);
    }
    render(tag, document.body);
    return document.body;
};
const applyTagPropsToElement = (tag, target) => {
    forEach(unique([
        ...Object.keys(getAttributes(target)),
        ...Object.keys(tag.attributes),
    ]), (propName) => {
        if (typeof tag.attributes[propName] === 'undefined') {
            target.removeAttribute(propName);
        }
        else if (propName.toLowerCase().slice(0, 1) === 'on') {
            attachEvent(target, propName.slice(2).toLowerCase(), tag.attributes[propName]);
        }
        else if (isBoolean(tag.attributes[propName])) {
            if (!tag.attributes[propName] && !!target.getAttribute(propName)) {
                target.removeAttribute(propName);
            }
            else if (tag.attributes[propName] && !target.getAttribute(propName)) {
                target.setAttribute(propName, String(tag.attributes[propName]));
            }
        }
        else if (target.getAttribute(propName) !== String(tag.attributes[propName])) {
            target.setAttribute(propName, String(tag.attributes[propName]));
        }
    });
    return target;
};
const render = (tag, target) => {
    if (tag.name !== target.nodeName) {
        throw new Error(`Render attempting to render a ${target.nodeName} as ${tag.name}`);
    }
    else if (target.id !== '' && (tag.attributes.id || '') !== target.id) {
        throw new Error(`Render attempting to render tag with id #${tag.attributes.id} to an element with the id of #${target.id}`);
    }
    applyTagPropsToElement(tag, target);
    let activeTags = [
        [target, tag.children],
    ];
    while (activeTags.length) {
        const nextTags = [];
        let atIndex = -1;
        while (++atIndex < activeTags.length) {
            const [parent, childTags] = activeTags[atIndex];
            const childNodes = [...parent.childNodes];
            let childTagIndex = -1;
            while (++childTagIndex < childTags.length) {
                const childTag = childTags[childTagIndex];
                const childElement = childNodes[childTagIndex];
                if (isString(childTag)) {
                    if (childElement && childElement.nodeType === Node.TEXT_NODE) {
                        if (childTag !== '') {
                            if (childElement.nodeValue !== childTag)
                                childElement.nodeValue = childTag;
                        }
                        else {
                            childElement.remove();
                        }
                    }
                    else {
                        while (childNodes[childTagIndex]) {
                            const removeEl = childNodes.pop();
                            if (removeEl)
                                removeEl.remove();
                        }
                        if (childTag !== '') {
                            parent.appendChild(document.createTextNode(childTag));
                        }
                    }
                }
                else if (isTag(childTag)) {
                    let tagRef = childElement;
                    if (!childElement || childElement.nodeType !== Node.ELEMENT_NODE || childElement.tagName !== childTag.name) {
                        while (childNodes[childTagIndex]) {
                            const removeEl = childNodes.pop();
                            if (removeEl)
                                removeEl.remove();
                        }
                        tagRef = document.createElement(childTag.name);
                        parent.appendChild(tagRef);
                    }
                    applyTagPropsToElement(childTag, tagRef);
                    if (childTag.children.length) {
                        nextTags.push([
                            tagRef,
                            childTag.children,
                        ]);
                    }
                }
                else if (isHTMLTag(childTag) && childTag.element !== childElement) {
                    while (childNodes[childTagIndex]) {
                        const removeEl = childNodes.pop();
                        if (removeEl)
                            removeEl.remove();
                    }
                    parent.appendChild(childTag.element);
                }
            }
        }
        activeTags = nextTags;
    }
    return target;
};

const testInsertedTag = tag`
<a href="/">this is a test</a>
`;

const testStringInsert = `\
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere quam \
scelerisque elit venenatis, vel feugiat augue commodo. Nam vel pulvinar sem. \
Pellentesque egestas augue non vestibulum fermentum. Mauris fermentum orci \
non ultricies vulputate. Nunc at ornare dui. Mauris eget elit non ipsum \
imperdiet porta. Aenean eget ultricies magna. Etiam a nisl nec urna imperdiet mattis. \
Maecenas tincidunt justo at purus suscipit commodo. Nam vitae velit lacinia, \
sodales est vitae, venenatis felis.\
`;

renderToBody(tag`
  <body>
    <h1>Test header</h1>
    <p>${testStringInsert}</p>
    ${testInsertedTag}
  </body>
`);

}());
