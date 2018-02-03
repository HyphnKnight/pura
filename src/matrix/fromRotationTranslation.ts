export const fromRotationTranslation =
    (q: Float32Array, v: Float32Array) =>
        (target: Float32Array = new Float32Array(16)): Float32Array => {
            // Quaternion math
            const x = q[0];
            const y = q[1];
            const z = q[2];
            const w = q[3];
            const x2 = x + x;
            const y2 = y + y;
            const z2 = z + z;

            const xx = x * x2;
            const xy = x * y2;
            const xz = x * z2;
            const yy = y * y2;
            const yz = y * z2;
            const zz = z * z2;
            const wx = w * x2;
            const wy = w * y2;
            const wz = w * z2;

            target[0] = 1 - (yy + zz);
            target[1] = xy + wz;
            target[2] = xz - wy;
            target[3] = 0;
            target[4] = xy - wz;
            target[5] = 1 - (xx + zz);
            target[6] = yz + wx;
            target[7] = 0;
            target[8] = xz + wy;
            target[9] = yz - wx;
            target[10] = 1 - (xx + yy);
            target[11] = 0;
            target[12] = v[0];
            target[13] = v[1];
            target[14] = v[2];
            target[15] = 1;

            return target;
        };
