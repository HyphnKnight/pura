import { round } from '../math';
import {
  addSet,
  scaleSet, Vector2d,
} from '../vector';
import {
  forEachList,
  mapList,
  subtractList, VectorList,
} from '../vector/list';

export let canvas: HTMLCanvasElement = document.createElement('canvas');
export let ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;

export const setCanvas =
  (newCanvas: HTMLCanvasElement, canvasAttributes?: CanvasRenderingContext2DSettings) => {
    canvas = newCanvas;
    const newContext = newCanvas.getContext('2d', canvasAttributes);
    if (newContext) ctx = newContext;
  };

const originVector: Vector2d = [0, 0];

export const translate =
  (vec: Vector2d) =>
    ctx.translate(round(vec[0]), round(vec[1]));

export const rotate =
  (angle: number) =>
    ctx.rotate(angle);

export const clearRect =
  (vec: Vector2d, width: number, height: number) =>
    ctx.clearRect(round(vec[0]), round(vec[1]), round(width), round(height));

export const clear =
  () =>
    clearRect(originVector, canvas.width, canvas.height);

export const moveTo =
  (vec: Vector2d) =>
    ctx.moveTo(round(vec[0]), round(vec[1]));

export const lineTo =
  (vec: Vector2d) =>
    ctx.lineTo(round(vec[0]), round(vec[1]));

export const quadraticCurveTo =
  (vec: Vector2d, control: Vector2d) =>
    ctx.quadraticCurveTo(
      round(control[0]),
      round(control[1]),
      round(vec[0]),
      round(vec[1])
    );

const arc =
  (vec: Vector2d, radius: number, startAngle: number, endAngle: number, counterClockwise: boolean) =>
    ctx.arc(round(vec[0]), round(vec[1]), radius, startAngle, endAngle, counterClockwise);

const rect =
  (vec: Vector2d, width: number, height: number) =>
    ctx.rect(round(vec[0]), round(vec[1]), round(width), round(height));

export const drawImage =
  (image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap) =>
    (vec: Vector2d, width: number, height: number) =>
      ctx.drawImage(image, round(vec[0]), round(vec[1]), width, height);

export const drawSlicedImage =
  (image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap) =>
    (vec: Vector2d, slice: Vector2d, sliceWidth: number, sliceHeight: number, width: number, height: number) =>
      ctx.drawImage(image, round(slice[0]), round(slice[1]), sliceWidth, sliceHeight, round(vec[0]), round(vec[1]), width, height);


export const drawLine =
  (points: VectorList, angle: number = 0) => {
    const origin: Vector2d = [points[0], points[1]];
    const adjustedPoints = subtractList(points, origin);
    ctx.save();
    translate(origin);
    rotate(angle);
    moveTo(originVector);
    forEachList(adjustedPoints, lineTo);
    ctx.restore();
  };

export const drawPolygon =
  (position: Vector2d, points: VectorList, angle: number = 0) => {
    const first: Vector2d = [
      points[points.length - 2],
      points[points.length - 1],
    ];
    ctx.save();
    translate(position);
    rotate(angle);
    moveTo(first);
    forEachList(points, lineTo);
    ctx.restore();
  };

export const drawOval =
  (position: Vector2d, points: VectorList, angle: number = 0) => {
    const midPoints = mapList(
      points,
      (pnt, index) => scaleSet(
        addSet(
          points[index * 2 - 2]
            ? [points[index * 2 - 2], points[index * 2 - 1]]
            : [points[points.length - 2], points[points.length - 1]],
          pnt
        ),
        0.5,
      ) as Vector2d,
    );
    ctx.save();
    translate(position);
    rotate(angle);
    moveTo([midPoints[0], midPoints[1]]);
    let i = 0;
    while ((i += 2) <= 9) {
      quadraticCurveTo(
        midPoints[i]
          ? [midPoints[i], midPoints[i + 1]]
          : [midPoints[0], midPoints[1]],
        [points[i - 2], points[i - 1]]
      );
    }
    ctx.restore();
  };

export const drawRectangle =
  (position: Vector2d, width: number, height: number, angle: number = 0) => {
    ctx.save();
    translate(position);
    rotate(angle);
    rect([-width / 2, -height / 2], round(width), round(height));
    ctx.restore();
  };

export const drawArc =
  (vec: Vector2d, radius: number = 100, angle: number = 0, startAngle: number = 0, endAngle: number = 2 * Math.PI, counterClockwise: boolean = false) => {
    ctx.save();
    translate(vec);
    rotate(angle);
    arc(originVector, radius, startAngle, endAngle, counterClockwise);
    ctx.restore();
  };

const fill =
  <DrawFunction extends (...args: any) => any>(draw: DrawFunction) =>
    (style: string, ...args: Parameters<DrawFunction>) => {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = style;
      draw(...args as any);
      ctx.fill();
      ctx.restore();
    };

export interface StrokeOptions {
  style?: string;
  thickness?: number;
}

const stroke =
  <DrawFunction extends (...args: any) => any>(draw: DrawFunction) =>
    (options: StrokeOptions, ...args: Parameters<DrawFunction>) => {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = options.style ?? '';
      ctx.lineWidth = options.thickness ?? 1;
      draw(...args as any);
      ctx.stroke();
      ctx.restore();
    };

export const fillPolygon = fill(drawPolygon);
export const fillOval = fill(drawOval);
export const fillRectangle = fill(drawRectangle);
export const fillLine = fill(drawLine);
export const fillArc = fill(drawArc);

export const strokePolygon = stroke(drawPolygon);
export const strokeOval = stroke(drawOval);
export const strokeRectangle = stroke(drawRectangle);
export const strokeLine = stroke(drawLine);
export const strokeArc = stroke(drawArc);

export interface FontOptions {
  style?: string;
  font?: string;
  textAlign?: CanvasTextAlign;
  horizontalAlign?: boolean;
  textBaseline?: CanvasTextBaseline;
  maxWidth?: number;
}

export const strokeText =
  (fontOptions: FontOptions, position: Vector2d, text: string, angle: number = 0) => {

    ctx.save();

    ctx.strokeStyle = fontOptions.style ?? ctx.strokeStyle;
    ctx.font = fontOptions.font ?? ctx.font;
    ctx.textAlign = fontOptions.textAlign ?? ctx.textAlign;
    ctx.textBaseline = fontOptions.textBaseline ?? ctx.textBaseline;

    rotate(angle);

    if (fontOptions.horizontalAlign) {
      const { width } = ctx.measureText(text);
      translate([-width / 2, 0]);
    }

    ctx.strokeText(
      text,
      round(position[0]),
      round(position[1]),
      fontOptions.maxWidth
    );

    ctx.restore();

  };

export const fillText =
  (fontOptions: FontOptions, position: Vector2d, text: string, angle: number = 0): void => {

    ctx.save();

    ctx.fillStyle = fontOptions.style ?? ctx.fillStyle;
    ctx.font = fontOptions.font ?? ctx.font;
    ctx.textAlign = fontOptions.textAlign ?? ctx.textAlign;
    ctx.textBaseline = fontOptions.textBaseline ?? ctx.textBaseline;

    rotate(angle);

    if (fontOptions.horizontalAlign) {
      const { width } = ctx.measureText(text);
      translate([-width / 2, 0]);
    }

    ctx.fillText(
      text,
      round(position[0]),
      round(position[1]),
      fontOptions.maxWidth
    );

    ctx.restore();
  };
