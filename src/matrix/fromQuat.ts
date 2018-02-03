// Creates a matrix from a quaternion rotation.
export const fromQuat =
    (src: Float32Array) =>
        (target: Float32Array = new Float32Array(16)): Float32Array => {
            const x = src[0];
            const y = src[1];
            const z = src[2];
            const w = src[3];
            const x2 = x + x;
            const y2 = y + y;
            const z2 = z + z;

            const xx = x * x2;
            const yx = y * x2;
            const yy = y * y2;
            const zx = z * x2;
            const zy = z * y2;
            const zz = z * z2;
            const wx = w * x2;
            const wy = w * y2;
            const wz = w * z2;

            target[0] = 1 - yy - zz;
            target[1] = yx + wz;
            target[2] = zx - wy;
            target[3] = 0;

            target[4] = yx - wz;
            target[5] = 1 - xx - zz;
            target[6] = zy + wx;
            target[7] = 0;

            target[8] = zx + wy;
            target[9] = zy - wx;
            target[10] = 1 - xx - yy;
            target[11] = 0;

            target[12] = 0;
            target[13] = 0;
            target[14] = 0;
            target[15] = 1;

            return target;
        };