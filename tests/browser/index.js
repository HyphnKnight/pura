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
function find(array, func) {
    let i = -1;
    while (++i < array.length) {
        if (func(array[i], i, array))
            return array[i];
    }
    return null;
}
const unique = (array) => filter(array, (value, index, self) => indexOf(self, value) === index);

/* General Type Discovery */
const is = (func = (x) => !!x) => (unknown) => func(unknown);

/* Type Testing */
const isNull = is((u) => u === null);
const isUndefined = is((u) => typeof u === 'undefined');
const isNullOrUndefined = is((u) => isNull(u) || isUndefined(u));
const isString = is((u) => typeof u === 'string');
const isNumber = is((u) => typeof u === 'number');
const isBoolean = is((u) => typeof u === 'boolean');
const isFunction = is((u) => !!u && u.constructor && u.call && u.apply);
const isArray = is((u) => Array.isArray(u));
const isMap = is((u) => !!u && u.__proto__ === Map.prototype);
const isSet = is((u) => !!u && u.__proto__ === Set.prototype);
const isObjectLiteral = is((u) => {
    if (!u || typeof u !== 'object')
        return false;
    let tmp = u;
    while (true) {
        tmp = Object.getPrototypeOf(tmp);
        if (tmp === null) {
            break;
        }
    }
    return Object.getPrototypeOf(u) === tmp;
});
const isNode = is((u) => typeof Node === 'object'
    ? u instanceof Node
    : u && typeof u === 'object' && typeof u.nodeType === 'number' && typeof u.nodeName === 'string');
const isComparable = is((u) => isNullOrUndefined(u) ||
    isNumber(u) ||
    isBoolean(u) ||
    isString(u) ||
    isFunction(u) ||
    typeof u === 'symbol');
/* Comparison */
function isEqual(valueA, valueB) {
    if (isComparable(valueA) && isComparable(valueB)) {
        return valueA === valueB;
    }
    else if (isArray(valueA) && isArray(valueB)) {
        return valueA.length === valueB.length &&
            !find(valueA, (value, index) => !isEqual(value, valueB[index]));
    }
    else if (isObjectLiteral(valueA) && isObjectLiteral(valueB)) {
        const keysA = Object.keys(valueA);
        const keysB = Object.keys(valueB);
        return keysA.length === keysB.length &&
            !find(keysA, (key) => !isEqual(valueA[key], valueB[key]));
    }
    else if (isMap(valueA) && isMap(valueB)) {
        const keysA = [...valueA.keys()];
        const keysB = [...valueB.keys()];
        return keysA.length === keysB.length &&
            !find(keysA, (key) => !isEqual(valueA.get(key), valueB.get(key)));
    }
    else if (isSet(valueA) && isSet(valueB)) {
        return valueA.size === valueB.size &&
            isEqual([...valueA.entries()], [...valueB.entries()]);
    }
    return false;
}

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
const events = new Map();
const tags = new Map();
const primitives = new Map();
const parseParameter = (parameter) => {
    if (isNullOrUndefined(parameter)) {
        return null;
    }
    else if (isString(parameter)) {
        return String(parameter);
    }
    else if (isNumber(parameter) || isBoolean(parameter)) {
        const paramKey = `prm_${uniqueId()}_`;
        primitives.set(paramKey, parameter);
        return paramKey;
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
        forEach(parameter, (param) => html += parseParameter(param));
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
    let html = '';
    let i = -1;
    while (++i < str.length) {
        html += str[i];
        const parameter = parseParameter(parameters[i]);
        if (parameter !== null)
            html += parameter;
    }
    html = html.trim();
    if (html[0] !== '<') {
        throw new Error(`Invalid first character, must be a '<' found a ${html[0]}`);
    }
    const content = [];
    let activeTag = null;
    let cIndex = -1;
    let char = '';
    let activeString = '';
    let attrName = '';
    let buildingTag = '';
    i = -1;
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
                            if (events.has(activeString)) {
                                activeTag.attributes[attrName] = events.get(activeString);
                            }
                            else if (primitives.has(activeString)) {
                                activeTag.attributes[attrName] = primitives.get(activeString);
                            }
                            else {
                                activeTag.attributes[attrName] = activeString;
                            }
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
                    ++i;
                    if (content[cIndex - 1]) {
                        const parent = content[--cIndex];
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
                    i += 13;
                    const insertTag = tags.get(buildingTag);
                    if (insertTag) {
                        content[cIndex].children.push(activeString, insertTag);
                        activeString = '';
                    }
                    else {
                        activeString += buildingTag;
                    }
                }
                else if (char === 'p' && html[i + 1] === 'r' && html[i + 2] === 'm' && html[i + 3] === '_' && html[i + 13] === '_') {
                    buildingTag = html.slice(i, i + 14);
                    i += 13;
                    const insertString = primitives.get(buildingTag);
                    activeString += insertString;
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

function debounce(func, wait, leading = true, maxWait = Number.MAX_VALUE) {
    let invokeTime = 0;
    if (leading) {
        return function debounceLeadingInside(...args) {
            const time = Date.now();
            if (time - invokeTime > wait) {
                invokeTime = Date.now();
                func(...args);
            }
        };
    }
    else {
        let attemptedInvoke = 0;
        let delay;
        return function debounceTrailingInside(...args) {
            const time = Date.now();
            if (attemptedInvoke === 0) {
                attemptedInvoke = time;
            }
            if (!!delay && time - attemptedInvoke < maxWait) {
                window.clearTimeout(delay);
            }
            if (time - attemptedInvoke < maxWait) {
                delay = setTimeout(() => {
                    attemptedInvoke = 0;
                    func(...args);
                }, wait);
            }
        };
    }
}

const events$1 = new Map();
const auditEvents = debounce((parent = document.body) => events$1.forEach((eventMap) => eventMap.forEach((_, el) => !parent.contains(el) && eventMap.delete(el))), 16, false, 320);
const attachEvent = (el, type, func) => {
    let typeMap = events$1.get(type);
    if (!typeMap) {
        typeMap = new Map();
        events$1.set(type, typeMap);
        document.body.addEventListener(type, (event) => {
            const callback = typeMap.get(event.target);
            if (callback)
                callback(event);
        });
    }
    typeMap.set(el, func);
    auditEvents(document.body);
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
        if (typeof tag.attributes[propName] === 'undefined' || tag.attributes[propName] === false) {
            target.removeAttribute(propName);
        }
        else if (propName.toLowerCase().slice(0, 2) === 'on') {
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

const createTextInput = (initConfig) => {
    const element = document.createElement('field-set');
    const id = uniqueId();
    const config = Object.assign({}, initConfig);
    return (props) => {
        Object.assign(config, initConfig, props);
        return render(tag `
        <field-set class="--text">
          <label for="${id}" >${config.label}</label>
          <input
            id="${id}"
            type="text"
            disabled="${config.disabled || false}"
            placeholder="${config.placeholder || ''}"
            autocomplete="${config.autocomplete || 'none'}"
            value="${config.value}"
            oninput="${event => config.onInput(event.target.value)}"
          />
        </field-set>
      `, element);
    };
};
const createNumberInput = (initConfig) => {
    const element = document.createElement('field-set');
    const id = uniqueId();
    const config = Object.assign({ type: 'number' }, initConfig);
    return (props) => {
        Object.assign(config, initConfig, props);
        return render(tag `
        <field-set class="--${config.type}">
          <label for="${id}" >${config.label}</label>
          <input
            id="${id}"
            type="${config.type}"
            disabled="${config.disabled || false}"
            placeholder="${config.placeholder || ''}"
            min="${config.min || 0}"
            max="${config.max || 100}"
            step="${config.step || 1}"
            value="${config.value}"
            oninput="${event => config.onInput(Number(event.target.value))}"
          />
        </field-set>
      `, element);
    };
};
const createPasswordInput = (initConfig) => {
    const element = document.createElement('field-set');
    const id = uniqueId();
    const config = Object.assign({}, initConfig);
    return (props) => {
        Object.assign(config, initConfig, props);
        return render(tag `
        <field-set class="--password">
          <label for="${id}" >${config.label}</label>
          <input
            id="${id}"
            type="password"
            disabled="${config.disabled || false}"
            autocomplete="${config.autocomplete || 'none'}"
            placeholder="${config.placeholder || ''}"
            value="${config.value}"
            oninput="${event => config.onInput(event.target.value)}"
          />
        </field-set>
      `, element);
    };
};
const createSearchInput = (initConfig) => {
    const element = document.createElement('field-set');
    const id = uniqueId();
    const config = Object.assign({}, initConfig);
    return (props) => {
        Object.assign(config, initConfig, props);
        return render(tag `
        <field-set class="--search">
          <label for="${id}" >${config.label}</label>
          <input
            id="${id}"
            list="${`list_${id}`}"
            type="search"
            disabled="${config.disabled || false}"
            placeholder="${config.placeholder || ''}"
            autocomplete="${config.autocomplete || 'none'}"
            value="${config.value}"
            oninput="${event => config.onInput(event.target.value)}"
          />
          ${!!config.options ? tag `<datalist id="${`list_${id}`}">
            ${map(config.options || [], (option) => tag `<option value="${option}" />`)}
          </datalist>` : null}
        </field-set>
      `, element);
    };
};
const createCheckbox = (initConfig) => {
    const element = document.createElement('field-set');
    const id = uniqueId();
    const config = Object.assign({}, initConfig);
    return (props) => {
        Object.assign(config, initConfig, props);
        return render(tag `
        <field-set class="--checkbox">
          <label for="${id}" >${config.label}</label>
          <input
            id="${id}"
            type="checkbox"
            disabled="${config.disabled || false}"
            checked="${config.value}"
            onchange="${() => config.onInput(!config.value)}"
          />
        </field-set>
      `, element);
    };
};
const createRadioButton = (label, name) => {
    const element = document.createElement('li');
    const id = uniqueId();
    return (config) => render(tag `
        <li>
          <label for="${id}" >${label}</label>
          <input
            id="${id}"
            type="radio"
            name="${name}"
            disabled="${config.disabled || false}"
            checked="${config.value === label}"
            onchange="${() => config.onInput(label)}"
          />
        </li>
      `, element);
};
const createRadioInput = (initConfig) => {
    const element = document.createElement('field-set');
    const config = Object.assign({}, initConfig);
    const name = `name_${uniqueId}`;
    const options = map(config.options, (option) => createRadioButton(option, name));
    return (props) => {
        Object.assign(config, initConfig, props);
        return render(tag `
        <field-set class="--radio">
          <ul>
            ${map(options, (create) => create(config))}
          </ul>
        </field-set>
      `, element);
    };
};
const createSelectItem = (value) => (option) => {
    if (isString(option)) {
        return tag `
          <option
            value="${option}"
            selected="${value ? value === option : false}"
          >${option}</option>`;
    }
    else {
        return tag `
          <optgroup
            label="${option.label}"
            disabled="${option.disabled || false}">
            ${map(option.options, createSelectItem(value))}
          </optgroup>
        `;
    }
};
const createSelectInput = (initConfig) => {
    const element = document.createElement('field-set');
    const id = uniqueId();
    const config = Object.assign({}, initConfig);
    return (props) => {
        Object.assign(config, initConfig, props);
        return render(tag `
        <field-set class="--select">
          <label for="${id}">${config.label}</label>
          <select
            id="${id}"
            value="${config.value}"
            disabled="${config.disabled || false}"
            oninput="${event => config.onInput(event.target.value)}"
            >
            ${map(config.options, createSelectItem(config.value))}
          </select>
        </field-set>
      `, element);
    };
};

const setStore = (store) => (updateObj) => {
    const objKeys = Object.keys(updateObj);
    let oldStore;
    if (objKeys.map((key) => {
        if (!isEqual(updateObj[key], store.__store__[key])) {
            if (!oldStore) {
                oldStore = Object.assign({}, store.__store__);
            }
            store.__store__[key] = updateObj[key];
            return true;
        }
        else {
            return false;
        }
    }).some((x) => x)) {
        forEach(Object.keys(store.subscriptions), (key) => store.subscriptions[key](store.__store__, oldStore));
    }
};
const protectedSubscribe = (store) => (keys, func) => store.subscribe((newState, oldstate) => find(keys, (key) => newState[key] !== oldstate[key]) &&
    func(newState, oldstate));
const createStore = (protoObj) => {
    const subscriptions = {};
    const newStore = {
        subscriptions: {},
        subscribe: (func) => {
            const key = uniqueId();
            subscriptions[key] = func;
            return () => {
                delete subscriptions[key];
            };
        },
        protectedSubscribe: () => () => { throw new Error('Store failed to initialize'); },
        set: () => { throw new Error('Store failed to initialize'); },
        [Symbol.iterator]: () => (function iteratorMaker(savedProtoObj) {
            const objKeys = Object.keys(savedProtoObj);
            let index = 0;
            return {
                next() {
                    const result = { value: savedProtoObj[objKeys[index]], done: true };
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
    forEach(Object.keys(protoObj), (key) => {
        newStore.__store__[key] = protoObj[key];
        Object.defineProperty(newStore, key, {
            set: (value) => {
                if (!isEqual(value, newStore.__store__[key])) {
                    const oldStore = Object.assign({}, newStore.__store__);
                    newStore.__store__[key] = value;
                    Object.keys(subscriptions).forEach((subKey) => subscriptions[subKey](newStore.__store__, oldStore));
                }
            },
            get: () => newStore.__store__[key]
        });
    });
    Object.defineProperty(newStore, 'JSON', {
        set: (string) => newStore.set(JSON.parse(string)),
        get: () => JSON.stringify(newStore.__store__)
    });
    newStore.set = setStore(newStore);
    newStore.protectedSubscribe = protectedSubscribe(newStore);
    return Object.preventExtensions(newStore);
};

const testInsertedTag = tag`
<a href="/">this is a test</a>
`;

const state = createStore({
  value: 'test',
  password: '',
  search: '',
  checkbox: false,
  radio: false,
  age: 0,
  select: '',
});

window.state = state;

const SampleInput = createTextInput({
  label:'username',
  onInput: (value) => state.value = value,
  value: '',
});
const passwordTest = /[A-z0-9]+/;
const SamplePassword = createPasswordInput({
  label:'password',
  onInput :(value) => {
    if (passwordTest.test(value)) {
      state.password = value.toLowerCase();
    }
  }
});
const SampleSearch = createSearchInput({
  label: 'search',
  onInput: (value) => {
    state.search = value;
  },
});
const SampleCheckbox = createCheckbox({
  label:'add email',
  onInput:(value) => state.checkbox = value,
});
const SampleRadio = createRadioInput({
  onInput: value => console.log(state.radio = value),
  options: [
    'option A',
    'option B',
    'option C',
  ]
});

const SampleNumber = createNumberInput({
  label:'Age',
  onInput:(value) => state.age = value,
});

const SampleNumberSlider = createNumberInput({
  label:'Age',
  type:'range',
  max:100,
  min:0,
  step: 5,
  onInput:(value) => state.age = value,
});

const SampleSelect = createSelectInput({
  label: 'Select stuff',
  options: [
    'option A',
    'option B',
    'option C',
    {
      label:'Sub group',
      options: [
        'option D-A',
        'option D-B',
        'option D-C',
        'option D-D',
      ]
    }
  ],
  onInput: (value) => {
    state.select = value;
  },
});

state.subscribe((state) => renderToBody(tag`
  <body>
    <h1>${state.value}</h1>
    ${testInsertedTag}
    ${SampleInput({value:state.value})}
    <span>${state.password}</span>
    ${SamplePassword({value:state.password})}
    ${SampleSearch({value:state.search})}
    <span>${state.checkbox?'checked':'unchecked'}</span>
    ${SampleCheckbox({value:state.checkbox})}
    <span>${state.radio}</span>
    ${SampleRadio({value:state.radio})}
    <span>${state.age}</span>
    ${SampleNumber({value:state.age})}
    ${SampleNumberSlider({value:state.age})}
    <span>${state.select}</span>
    ${SampleSelect({value: state.select})}
  </body>
`));

state.value = 'something';

}());
