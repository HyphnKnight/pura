import { Vector3d } from '../vector/3d';

export const scale =
    (src: Float32Array, scaleVec: Vector3d, target: Float32Array) => {
      const [x, y, z] = scaleVec;
      target[0] = src[0] * x;
      target[1] = src[1] * x;
      target[2] = src[2] * x;
      target[3] = src[3] * x;
      target[4] = src[4] * y;
      target[5] = src[5] * y;
      target[6] = src[6] * y;
      target[7] = src[7] * y;
      target[8] = src[8] * z;
      target[9] = src[9] * z;
      target[10] = src[10] * z;
      target[11] = src[11] * z;
      target[12] = src[12];
      target[13] = src[13];
      target[14] = src[14];
      target[15] = src[15];
      return target;
    };
