import { Vector2d } from '../vector';
import { Vector3d } from '../vector/3d';

export const perspective =
  (camera: Vector3d, focalLength: number, viewWidth: number, viewHeight: number) =>
    // 2d point in world space
    (point: Vector2d): [number, number, number] => {
      const pX = point[0] - camera[0];
      const pY = point[1] - camera[1];
      const cZ = camera[2];
      const relPos = (pY + focalLength);
      let sX = pX + pY * -pX / (pY + focalLength) + viewWidth / 2;
      let sY;
      if (relPos < 0) {
        sY = viewHeight + cZ * pY / relPos;
        sX = pX;
      } else if (relPos > 0) {
        sY = viewHeight - cZ * pY / relPos;
      } else {
        sY = viewHeight;
        sX = pX;
      }
      return [sX, sY, Math.pow(focalLength + pY, 2) + Math.pow(-pX, 2)];
    };
