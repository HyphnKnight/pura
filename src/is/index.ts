/* General Type Discovery */
export const is =
  <type>(func: (x: any) => boolean = (x) => !!x) =>
    (unknown: any): unknown is type =>
      func(unknown);
