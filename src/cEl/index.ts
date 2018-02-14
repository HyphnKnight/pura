import { forEach } from '../array';
import {
  canvas,
  ctx,
  rotate,
  setCanvas,
  translate,
} from '../canvas';
import {
  createRectangle,
  Geometry,
  Rectangle,
  Shape,
} from '../geometry';
import {
  isInsideBounding,
  isPointInAlignedRectangle,
  isPointInCircle,
  isPointInPolygon,
} from '../intersection';
import { is } from '../is';
import { Transform } from '../transform';
import {
  addSet,
  magnitudeSqr,
  rotate as rotateVec,
  set,
  subtractSet,
  Vector2d,
} from '../vector';
import {
  addListSet,
  rotateListAround,
} from '../vector/list';

export interface CEl<geometryType extends (Geometry | null)> {
  geometry?: Geometry;
  children?: Array<CEl<any>>;
  render?: (el: CEl<geometryType>) => void;
  interact?: {
    onMouseDown?: (el: CEl<geometryType>, position: Vector2d) => void,
    onMouseMove?: (el: CEl<geometryType>, position: Vector2d) => void,
    onMouseUp?: (el: CEl<geometryType>, position: Vector2d) => void,
  };
}

type InteractionData = [CEl<any>, Geometry, (el: CEl<Geometry>, position: Vector2d) => void];
type InteractionMap = Map<CEl<any>, InteractionData>;

export const onMouseDownCollection = new Map<CEl<any>, InteractionData>();
export const onMouseMoveCollection = new Map<CEl<any>, InteractionData>();
export const onMouseUpCollection = new Map<CEl<any>, InteractionData>();


export let windowGeometry = createRectangle(
  [0, 0],
  0,
  window.innerWidth,
  window.innerHeight,
);

window.onresize =
  () =>
    Object.assign(
      windowGeometry,
      createRectangle(
        [0, 0],
        0,
        window.innerWidth,
        window.innerHeight,
      )
    );

const isInViewport =
  (viewport: Rectangle = windowGeometry) =>
    (geometry: Geometry): boolean =>
      isInsideBounding(viewport, geometry);

const isInWindow = isInViewport(windowGeometry);

const collisionGeometries = new Map<CEl<any>, Geometry>();

const renderCEl =
  (transform: Transform) =>
    (el: CEl<Geometry>) => {
      const { geometry, children, render, interact } = el;

      ctx.save();
      transform.save();

      let collisionGeometry = collisionGeometries.get(el);

      if (!collisionGeometry && geometry) {
        collisionGeometry = Object.assign(
          Object.create(null),
          geometry,
          { position: geometry.position }
        ) as Geometry;
        collisionGeometries.set(el, collisionGeometry);
      }

      if (geometry) {

        translate(geometry.position);

        addSet(transform.position, rotateVec(geometry.position, transform.rotation));

        rotate(geometry.rotation);

        transform.rotation += geometry.rotation;

      }

      if (collisionGeometry) transform.apply(collisionGeometry);

      ctx.save();
      if (render && (!geometry || isInWindow(collisionGeometry as Geometry))) render(el);
      ctx.restore();

      if (children) forEach(children, renderCEl(transform));

      if (interact && collisionGeometry) {
        if (interact.onMouseDown && !onMouseDownCollection.has(el)) {
          onMouseDownCollection.set(el, [el, collisionGeometry, interact.onMouseDown]);
        } else if (!interact.onMouseDown && onMouseDownCollection.has(el)) {
          onMouseDownCollection.delete(el);
        }

        if (interact.onMouseMove && !onMouseMoveCollection.has(el)) {
          onMouseMoveCollection.set(el, [el, collisionGeometry, interact.onMouseMove]);
        } else if (!interact.onMouseMove && onMouseMoveCollection.has(el)) {
          onMouseMoveCollection.delete(el);
        }

        if (interact.onMouseUp && !onMouseUpCollection.has(el)) {
          onMouseUpCollection.set(el, [el, collisionGeometry, interact.onMouseUp]);
        } else if (!interact.onMouseUp && onMouseUpCollection.has(el)) {
          onMouseUpCollection.delete(el);
        }
      }

      ctx.restore();
      transform.restore();

    };

const isTouch: boolean = ('ontouchstart' in window);

const convertEventsToPosition =
  (evt: MouseEvent | TouchEvent): Vector2d =>
    is<MouseEvent>((x) => !!x.clientX)(evt)
      ? [evt.clientX, evt.clientY]
      : [evt.touches[0].clientX, evt.touches[0].clientY];

const isInsideVec: Vector2d = [0, 0];

const isInside =
  (point: Vector2d) =>
    (geometry: Geometry): boolean => {
      const seperation = subtractSet(set(isInsideVec, point), geometry.position);
      if (magnitudeSqr(seperation) > geometry.bounding * geometry.bounding) return false;
      switch (geometry.type) {
      case Shape.Circle: return isPointInCircle(
          point,
          geometry.position,
          geometry.radius
        );
      case Shape.Rectangle: return isPointInAlignedRectangle(
          point,
          geometry.position,
          geometry.width,
          geometry.height
        );
      case Shape.Polygon: return isPointInPolygon(
          point,
          addListSet(
            rotateListAround(
              geometry.points,
              [0, 0],
              geometry.rotation
            ),
            geometry.position
          ),
        );
      default: return false;
      }
    };

let offSetLeft = 0;
let offSetTop = 0;
let scaleX = 1;
let scaleY = 1;

export const calcCanvasSize =
  () => {
    const { top, left, width, height } = canvas.getBoundingClientRect();
    offSetLeft = left;
    offSetTop = top;
    scaleX = canvas.width / width;
    scaleY = canvas.height / height;
  };

calcCanvasSize();
document.addEventListener('DOMContentLoaded', calcCanvasSize);
window.addEventListener('resize', calcCanvasSize);

const interactionHandler =
  (collection: InteractionMap) =>
    (evt: MouseEvent | TouchEvent) => {
      if (!!collection.size) {
        const position = subtractSet(convertEventsToPosition(evt), [offSetLeft, offSetTop]);
        position[0] *= scaleX;
        position[1] *= scaleY;
        const isPositionInside = isInside(position);
        collection.forEach(([element, geometry, effect]) => isPositionInside(geometry) && effect(element, position));
      }
    };

export const renderUI =
  (canvasEl: HTMLCanvasElement, base: CEl<Geometry>): (() => void) | void => {
    setCanvas(canvasEl);

    canvasEl.addEventListener(
      isTouch
        ? 'ontouchstart'
        : 'mousedown',
      interactionHandler(onMouseDownCollection)
    );

    canvasEl.addEventListener(
      isTouch
        ? 'ontouchmove'
        : 'mousemove',
      interactionHandler(onMouseMoveCollection)
    );

    canvasEl.addEventListener(
      isTouch
        ? 'ontouchend'
        : 'mouseup',
      interactionHandler(onMouseUpCollection)
    );

    const render = renderCEl(new Transform());

    return () => render(base);

  };
