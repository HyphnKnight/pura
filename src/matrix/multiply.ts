export const multiply =
    (a: Float32Array, b: Float32Array, target: Float32Array): Float32Array => {
      const a00 = a[0];
      const a01 = a[1];
      const a02 = a[2];
      const a03 = a[3];
      const a10 = a[4];
      const a11 = a[5];
      const a12 = a[6];
      const a13 = a[7];
      const a20 = a[8];
      const a21 = a[9];
      const a22 = a[10];
      const a23 = a[11];
      const a30 = a[12];
      const a31 = a[13];
      const a32 = a[14];
      const a33 = a[15];

        // Cache only the current line of the second matrix
      let b0 = b[0];
      let b1 = b[1];
      let b2 = b[2];
      let b3 = b[3];
      target[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      target[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      target[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      target[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

      b0 = b[4];
      b1 = b[5];
      b2 = b[6];
      b3 = b[7];
      target[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      target[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      target[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      target[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

      b0 = b[8];
      b1 = b[9];
      b2 = b[10];
      b3 = b[11];
      target[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      target[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      target[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      target[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

      b0 = b[12];
      b1 = b[13];
      b2 = b[14];
      b3 = b[15];
      target[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      target[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      target[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      target[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      return target;
    };