export const perspective =
    (fovy: number, aspect: number, near: number, far: number, target: Float32Array) => {
      const f = 1.0 / Math.tan(fovy / 2);
      const nf = 1 / (near - far);
      target[0] = f / aspect;
      target[1] = 0;
      target[2] = 0;
      target[3] = 0;
      target[4] = 0;
      target[5] = f;
      target[6] = 0;
      target[7] = 0;
      target[8] = 0;
      target[9] = 0;
      target[10] = (far + near) * nf;
      target[11] = -1;
      target[12] = 0;
      target[13] = 0;
      target[14] = (2 * far * near) * nf;
      target[15] = 0;
      return target;
    };