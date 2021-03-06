export const rotate = (src, rotation, axis, target) => {
    let [x, y, z] = axis;
    let len = Math.sqrt(x * x + y * y + z * z);
    let s, c, t, a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, b00, b01, b02, b10, b11, b12, b20, b21, b22;
    if (Math.abs(len) < 0.000001)
        return null;
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    s = Math.sin(rotation);
    c = Math.cos(rotation);
    t = 1 - c;
    a00 = src[0];
    a01 = src[1];
    a02 = src[2];
    a03 = src[3];
    a10 = src[4];
    a11 = src[5];
    a12 = src[6];
    a13 = src[7];
    a20 = src[8];
    a21 = src[9];
    a22 = src[10];
    a23 = src[11];
    // Construct the elements of the rotation matrix
    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;
    // Perform rotation-specific matrix multiplication
    target[0] = a00 * b00 + a10 * b01 + a20 * b02;
    target[1] = a01 * b00 + a11 * b01 + a21 * b02;
    target[2] = a02 * b00 + a12 * b01 + a22 * b02;
    target[3] = a03 * b00 + a13 * b01 + a23 * b02;
    target[4] = a00 * b10 + a10 * b11 + a20 * b12;
    target[5] = a01 * b10 + a11 * b11 + a21 * b12;
    target[6] = a02 * b10 + a12 * b11 + a22 * b12;
    target[7] = a03 * b10 + a13 * b11 + a23 * b12;
    target[8] = a00 * b20 + a10 * b21 + a20 * b22;
    target[9] = a01 * b20 + a11 * b21 + a21 * b22;
    target[10] = a02 * b20 + a12 * b21 + a22 * b22;
    target[11] = a03 * b20 + a13 * b21 + a23 * b22;
    if (src !== target) {
        target[12] = src[12];
        target[13] = src[13];
        target[14] = src[14];
        target[15] = src[15];
    }
    return target;
};
