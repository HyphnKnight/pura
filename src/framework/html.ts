import { forEach } from '../array';
import {
  isArray,
  isBoolean,
  isFunction,
  isNode,
  isNumber,
  isString,
  isUndefined,
} from '../is/type';
import { uniqueId } from '../string';
import {
  EventCallback,
  HTMLTag,
  isTag,
  Tag,
} from './types';


const isAlphaChar =
  (c: string): boolean =>
    c >= 'A' && c <= 'z';

const isWhitespaceChar =
  (c: string): boolean =>
    c === '\n' ||
    c === ' ' ||
    c === '\t';

const isNumberChar =
  (c: string): boolean =>
    c >= '0' && c <= '9';

const parser =
  (html: string, eventMap: Map<string, EventCallback>, tags: Map<string, Tag | HTMLTag>): Tag => {
    const content: Tag[] = [];
    let activeTag: null | Tag = null;
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
        while (isWhitespaceChar(char)) char = html[++i];

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
        while (isWhitespaceChar(char)) char = html[++i];

        if (char === '>') {
          activeTag = content[cIndex];
          if (activeTag.name === activeString) {
            activeString = '';
            const parent = content[--cIndex];
            if (!parent) {
              return activeTag;
            } else {
              parent.children.push(activeTag);
            }
          } else {
            throw new Error(`Invalid html attempting to close ${activeString} before closing ${content[cIndex].name}.`);
          }
        } else {
          throw new Error(`Invalid end tag discovered expected closing '>' found ${char}`);
        }

      } else if (char === '<') {
        // tag
        activeString = '';
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
          while (isWhitespaceChar(char)) char = html[++i];

          // loop through attributes
          // stop if find end of tag
          while (!(char === '>' || (char === '/' && html[i + 1] === '>'))) {
            // loop past whitespace
            while (isWhitespaceChar(char)) char = html[++i];

            // loop through name
            if (!isAlphaChar(char)) {

              throw new Error(`Invalid property name discovered first character can't be ${char}`);
            }

            // loop through property name
            while (!isWhitespaceChar(char) && (isAlphaChar(char) || char === '-' || isNumberChar(char)) && char) {
              activeString += char;
              char = html[++i];
            }

            attrName = activeString;
            activeString = '';

            // loop past whitespace
            while (isWhitespaceChar(char)) char = html[++i];
            // is valued attribute
            if (char === '=') {
              char = html[++i];

              // loop past whitespace
              while (isWhitespaceChar(char)) char = html[++i];

              if (char === '"') {
                char = html[++i];

                while (char !== '"' || html[i - 1] === '\\') {
                  activeString += char;
                  char = html[++i];
                }
                char = html[++i];

                activeTag.attributes[attrName] = eventMap.get(activeString) || activeString;
                activeString = '';
              } else {
                throw new Error(`Invalid property value must be wrapped in quotes.`);
              }

            } else {
              activeTag.attributes[attrName] = true;
            }

            // loop past whitespace
            while (isWhitespaceChar(char)) char = html[++i];

          }

          if (char !== '>') {
            // this is self closing
            i += 2;
            if (content[cIndex - 1]) {
              const parent = content[cIndex - 1];
              parent.children.push(activeTag);
            } else {
              if (cIndex !== 0) {
                throw new Error(`Unclosed tag ${content[cIndex].name}.`);
              } else {
                return content[cIndex];
              }
            }
          }
        } else {
          throw new Error(`Invalid tag name discovered ${activeString + char}.`);
        }
      } else {
        // string handling
        while (char !== '<' && char) {
          if (char === 't' && html[i + 1] === 'a' && html[i + 2] === 'g' && html[i + 3] === '_' && html[i + 12] === '_') {
            buildingTag = html.slice(i, i + 13);
            i += 13;
            const insertTag = tags.get(buildingTag);
            if (insertTag) {
              content[cIndex].children.push(
                activeString,
                insertTag,
              );
              activeString = '';
            } else {
              activeString += buildingTag;
            }
          } else {
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
    } else {
      return content[cIndex];
    }
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
      const newHTMLTag: HTMLTag = {
        name: (parameter as HTMLElement).tagName,
        element: (parameter as HTMLElement),
      };
      tags.set(tagKey, newHTMLTag);
      return tagKey;
    }
    return null;
  };

export const tag =
  (str: TemplateStringsArray, ...parameters: Array<ValidInput | ValidInput[]>) => {
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
