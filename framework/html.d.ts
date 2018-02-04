export interface EventCallback {
    (event: Event): void;
}
export declare type Tag = {
    name: string;
    attributes: {
        [prop: string]: string | number | boolean | EventCallback;
    };
    children: (Tag | HTMLTag | string)[];
};
export declare type HTMLTag = {
    name: string;
    element: HTMLElement;
};
export declare const isTag: (unknown: any) => unknown is Tag;
export declare const isHTMLTag: (unknown: any) => unknown is HTMLTag;
export declare const tag: (str: TemplateStringsArray, ...parameters: (string | number | boolean | HTMLElement | EventCallback | Tag | (string | number | boolean | HTMLElement | EventCallback | Tag | null | undefined)[] | null | undefined)[]) => Tag;
