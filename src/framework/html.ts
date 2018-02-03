import { forEach } from '../array';
import { uniqueId } from '../string';
import {
  isString,
  isNumber,
  isFunction,
  isBoolean,
  isArray,
  isUndefined,
  isNode,
} from '../is/type';

export interface EventCallback {
  (event: Event): void;
}

export type Tag = {
  name: string;
  attributes: {
    [prop: string]: string | number | boolean | EventCallback;
  };
  children: (Tag | HTMLTag | string)[];
}

export type HTMLTag = {
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

const openAndCloseTag = /(<[a-z0-9-]+\s*((\w+\s*=\s*".*?"\s*)|\w+\s*)*\s*\/?>)|(<\/[a-z0-9-]+>)/g;

const whitespaceOnly = /^[\s\t\n]+$/;

const tagName = /[a-z0-9]+(-[a-z0-9]+)?/;
const tagAttributes = /(\w+\s*=\s*"(\n|.)*?")|(\w+)/g;

const insertedTag = /tag_[a-z0-9]+_/g;

const parseTag =
  (tagText: string, eventMap: Map<string, EventCallback>): Tag | null => {
    const tagResult = tagName.exec(tagText);

    if (!tagResult) return null;

    const { 0: name, index } = tagResult;
    const attributes: Tag['attributes'] = {};
    let result: true | RegExpExecArray | null = true;

    tagAttributes.lastIndex = index + name.length + 1;

    while (result) {
      result = tagAttributes.exec(tagText);
      if (result) {
        const [attributeText] = result;
        const [name, valueInQuotes] = attributeText.split('=');
        if (valueInQuotes) {
          const value = valueInQuotes.slice(1, -1);
          attributes[name] = eventMap.get(value) || value;
        } else {
          attributes[name] = true;
        }
      }
    }

    return {
      name, attributes,
      children: [] as (Tag | string)[],
    };
  };

const parser =
  (html: string, eventMap: Map<string, EventCallback>, tags: Map<string, Tag | HTMLTag>): Tag => {
    const content: Tag[] = [];
    let result: true | RegExpExecArray | null = true;
    let lastIndex = 0;

    while (result) {

      result = openAndCloseTag.exec(html);

      if (result) {

        const { index, 1: startTag, 4: endTag } = result;

        if (startTag) {

          let textValue = html.substr(lastIndex, index - lastIndex);
          lastIndex = index + startTag.length;

          if (!whitespaceOnly.test(textValue) && textValue !== '') {
            let tagResult: RegExpExecArray | true | null = true;
            while (tagResult) {
              tagResult = insertedTag.exec(textValue);
              if (tagResult) {
                const text = textValue.slice(2, tagResult.index);
                text !== '' && content[content.length - 1].children.push(text);
                const tagId = textValue.slice(tagResult.index, tagResult.index + tagResult[0].length);
                content[content.length - 1].children.push(tags.get(tagId) as Tag);
                textValue = textValue.slice(tagResult.index + tagResult[0].length);
                insertedTag.lastIndex = -1;
              } else if (!whitespaceOnly.test(textValue) && textValue !== '') {
                content[content.length - 1].children.push(textValue);
              }
            }
          }

          const parsedStartTag = parseTag(startTag, eventMap);
          if (/\/>$/.test(startTag) && parsedStartTag) {
            content[content.length - 1].children.push(parsedStartTag);
          } else if (parsedStartTag) {
            content.push(parsedStartTag);
          }

        } else if (endTag) {

          let textValue = html.substr(lastIndex, index - lastIndex);
          lastIndex = index + endTag.length;

          const lastTag = content.pop() as Tag;

          if (!whitespaceOnly.test(textValue) && textValue !== '') {
            let tagResult: RegExpExecArray | true | null = true;
            while (tagResult) {
              tagResult = insertedTag.exec(textValue);
              if (tagResult) {
                const text = textValue.slice(2, tagResult.index);
                text !== '' && lastTag.children.push(text);
                const tagId = textValue.slice(tagResult.index, tagResult.index + tagResult[0].length);
                lastTag.children.push(tags.get(tagId) as Tag);
                textValue = textValue.slice(tagResult.index + tagResult[0].length);
                insertedTag.lastIndex = -1;
              } else if (!whitespaceOnly.test(textValue) && textValue !== '') {
                lastTag.children.push(textValue);
              }
            }
          }

          const [endTagName] = endTag.match(/[\w-]+/) as string[];

          if (lastTag.name !== endTagName) {
            throw `${endTagName} is being closed before ${lastTag.name} is has been closed`;
          }
          if (!content[content.length - 1] && lastTag) {
            openAndCloseTag.lastIndex = -1;
            return lastTag;
          } else {
            if (isString(lastTag.children[0])) {
              lastTag.children[0] = (lastTag.children[0] as string).replace(/^\s*/, '');
            }
            if (isString(lastTag.children[lastTag.children.length - 1])) {
              lastTag.children[lastTag.children.length - 1] = (lastTag.children[lastTag.children.length - 1] as string).replace(/\s*$/, '');
            }
            content[content.length - 1].children.push(lastTag);
          }
        }
      }
    }
    return content[0];
  };

type ValidInput =
  undefined |
  null |
  string |
  number |
  boolean |
  Tag |
  HTMLElement |
  EventCallback;

const parseParameter =
  (events: Map<string, EventCallback>, tags: Map<string, Tag | HTMLTag>, parameter: ValidInput | ValidInput[]): string | null => {
    if (isUndefined(parameter) || (!parameter && isBoolean(parameter))) {
      return null;
    } else if (isString(parameter) || isNumber(parameter) || isBoolean(parameter)) {
      return String(parameter);
    } else if (isFunction(parameter)) {
      const eventKey = `evt_${uniqueId()}_`;
      events.set(eventKey, parameter);
      return eventKey;
    } else if (isTag(parameter)) {
      const tagKey = `tag_${uniqueId()}_`;
      tags.set(tagKey, parameter as Tag);
      return tagKey;
    } else if (isArray(parameter) && parameter.length) {
      let html = '';
      forEach(
        parameter,
        (param) => html += parseParameter(events, tags, param),
      );
      return html;
    } else if (isNode(parameter)) {
      const tagKey = `tag_${uniqueId()}_`;
      const HTMLTag: HTMLTag = {
        name: (parameter as HTMLElement).tagName,
        element: (parameter as HTMLElement),
      };
      tags.set(tagKey, HTMLTag);
      return tagKey;
    }
    return null;
  }

export const tag =
  (str: TemplateStringsArray, ...parameters: (ValidInput | ValidInput[])[]) => {
    const events = new Map<string, EventCallback>();
    const tags = new Map<string, Tag | HTMLTag>();
    let htmlText = '';
    let i = -1;
    while (++i < str.length) {
      htmlText += str[i];
      const parameter = parseParameter(events, tags, parameters[i]);
      if (parameter) htmlText += parameter;
    }
    return parser(htmlText, events, tags);
  };
