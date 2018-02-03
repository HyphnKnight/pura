import {
  Geometry,
  createRectangle,
  Rectangle,
  Shape,
} from '../geometry';
import { setCanvas, ctx, canvas, translate, rotate } from '../canvas';
import { Transform } from '../transform';
import { forEach } from '../array';
import {
  Vector2d,
  rotate as rotateVec,
  set,
  addSet,
  subtractSet,
  magnitudeSqr,
} from '../vector';
import {
  rotateListAround,
  addListSet,
} from '../vector/list';
import { is } from '../is';
import {
  isPointInCircle,
  isPointInAlignedRectangle,
  isPointInPolygon,
  isInsideBounding,
} from '../intersection';


export type cEl<geometryType extends (Geometry | null)> = {
  geometry?: Geometry,
  children?: cEl<any>[],
  render?: (el: cEl<geometryType>) => void,
  interact?: {
    onMouseDown?: (el: cEl<geometryType>, position: Vector2d) => void,
    onMouseMove?: (el: cEl<geometryType>, position: Vector2d) => void,
    onMouseUp?: (el: cEl<geometryType>, position: Vector2d) => void,
  }
}

type InteractionData = [cEl<any>, Geometry, Function];
type InteractionMap = Map<cEl<any>, InteractionData>;

export const onMouseDownCollection = new Map<cEl<any>, InteractionData>();
export const onMouseMoveCollection = new Map<cEl<any>, InteractionData>();
export const onMouseUpCollection = new Map<cEl<any>, InteractionData>();


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

const collisionGeometries = new Map<cEl<any>, Geometry>();

const renderCEl =
  (transform: Transform) =>
    (el: cEl<Geometry>) => {
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
      render && (!geometry || isInWindow(collisionGeometry as Geometry)) && render(el);
      ctx.restore();

      children && forEach(children, renderCEl(transform));

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
    is<MouseEvent>(evt => !!evt.clientX)(evt)
      ? [evt.clientX, evt.clientY]
      : [evt.touches[0].clientX, evt.touches[0].clientY];

const isInsideVec: Vector2d = [0, 0];

const isInside =
  (point: Vector2d) =>
    (geometry: Geometry): boolean => {
      if (magnitudeSqr(subtractSet(set(isInsideVec, point), geometry.position)) > geometry.bounding * geometry.bounding) return false;
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
        collection.forEach(([cEl, geometry, effect]) => isPositionInside(geometry) && effect(cEl, position));
      }
    };

export const renderUI =
  (canvas: HTMLCanvasElement, base: cEl<Geometry>): (() => void) | void => {
    setCanvas(canvas);

    canvas.addEventListener(
      isTouch
        ? 'ontouchstart'
        : 'mousedown',
      interactionHandler(onMouseDownCollection)
    );

    canvas.addEventListener(
      isTouch
        ? 'ontouchmove'
        : 'mousemove',
      interactionHandler(onMouseMoveCollection)
    );

    canvas.addEventListener(
      isTouch
        ? 'ontouchend'
        : 'mouseup',
      interactionHandler(onMouseUpCollection)
    );

    const render = renderCEl(new Transform());

    return () => render(base);

  };
