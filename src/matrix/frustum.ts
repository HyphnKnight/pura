export const frustum =
    (left: number, right: number, bottom: number, top: number, near: number, far: number) =>
        (target: Float32Array) => {
            var rl = 1 / (right - left),
                tb = 1 / (top - bottom),
                nf = 1 / (near - far);
            target[0] = (near * 2) * rl;
            target[1] = 0;
            target[2] = 0;
            target[3] = 0;
            target[4] = 0;
            target[5] = (near * 2) * tb;
            target[6] = 0;
            target[7] = 0;
            target[8] = (right + left) * rl;
            target[9] = (top + bottom) * tb;
            target[10] = (far + near) * nf;
            target[11] = -1;
            target[12] = 0;
            target[13] = 0;
            target[14] = (far * near * 2) * nf;
            target[15] = 0;
            return target;
        };
