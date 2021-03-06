export const ortho = (left, right, bottom, top, near, far, target) => {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    target[0] = -2 * lr;
    target[1] = 0;
    target[2] = 0;
    target[3] = 0;
    target[4] = 0;
    target[5] = -2 * bt;
    target[6] = 0;
    target[7] = 0;
    target[8] = 0;
    target[9] = 0;
    target[10] = 2 * nf;
    target[11] = 0;
    target[12] = (left + right) * lr;
    target[13] = (top + bottom) * bt;
    target[14] = (far + near) * nf;
    target[15] = 1;
    return target;
};
