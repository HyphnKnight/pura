export { render, renderToElement, renderToBody } from './render';
export { tag, Tag } from './html';

/**
 * Module:
 * The proper way to build modules is to create a tag and
 * render it to an html element and then export that element
 * to be embedded in the project later.
 * 
 * This prevents multiple unnecessary rerenders and restructures.
 */

/**
 * Single Render:
 * Assumes that the tag being rendered represents the object
 * being rendered too. This reduces the need for container elements.
 */
