import { Tag, HTMLTag } from './html';
export declare const renderToElement: (tag: Tag, target?: HTMLElement) => HTMLElement;
export declare const renderToBody: (tag: Tag) => HTMLElement;
export declare const render: (tag: string | Tag | HTMLTag, parent?: HTMLElement, index?: number) => HTMLElement;
