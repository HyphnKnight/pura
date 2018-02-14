import { filter, find } from '../array';

export const uniqueId =
  () =>
    Math.random().toString(36).substr(2, 9);

export const abstractSearch =
  (term: string) =>
    (str: string) => {
      const prepedTerm = stripPunctuation(term).toLowerCase();
      const prepedStr = stripPunctuation(str).toLowerCase();
      return !!find(prepedTerm.split(' '), (subTerm) => prepedStr.indexOf(subTerm) !== -1);
    };

export const stripPunctuation =
  (str: string): string =>
    str.replace(/["'.,\/#!$%\^&\*;:’{}=\-_`~()]/g, '');

export const camelCase =
  (str: string): string =>
    stripPunctuation(str).replace(
      /(?:^\w|[A-Z]|\b\w)/g,
      (letter, index) =>
        index === 0 ?
          letter.toLowerCase() :
          letter.toUpperCase()
    ).replace(/\s+/g, '');

export const symbolCase =
  (str: string): string =>
    filter(
      stripPunctuation(str).toUpperCase().split(' '),
      (word: string) => word !== ''
    ).join('_');

export const snakeCase =
  (str: string): string =>
    filter(
      stripPunctuation(str).toLowerCase().split(' '),
      (word: string) => word !== ''
    ).join('_');

export const dashCase =
  (str: string): string =>
    filter(
      stripPunctuation(str).toLowerCase().split(' '),
      (word: string) => word !== ''
    ).join('-');
