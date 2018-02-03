export type FoV = [
    number, //up
    number, //down
    number, //left
    number  //right
]

export const perspectiveFromFieldOfView =
    (fov: FoV, near: number, far: number, target: Float32Array) => {
        const upTan = Math.tan(fov[0] * Math.PI / 180.0);
        const downTan = Math.tan(fov[1] * Math.PI / 180.0);
        const leftTan = Math.tan(fov[2] * Math.PI / 180.0);
        const rightTan = Math.tan(fov[3] * Math.PI / 180.0);
        const xScale = 2.0 / (leftTan + rightTan);
        const yScale = 2.0 / (upTan + downTan);

        target[0] = xScale;
        target[1] = 0.0;
        target[2] = 0.0;
        target[3] = 0.0;
        target[4] = 0.0;
        target[5] = yScale;
        target[6] = 0.0;
        target[7] = 0.0;
        target[8] = -((leftTan - rightTan) * xScale * 0.5);
        target[9] = ((upTan - downTan) * yScale * 0.5);
        target[10] = far / (near - far);
        target[11] = -1.0;
        target[12] = 0.0;
        target[13] = 0.0;
        target[14] = (far * near) / (near - far);
        target[15] = 0.0;
        return target;
    }

