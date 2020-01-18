export const createQuadraticBezier = (start, mid, end) => (t) => ([
    start[0] * (1 - t) * (1 - t) +
        mid[0] * 2 * (1 - t) * t +
        end[0] * t * t,
    start[1] * (1 - t) * (1 - t) +
        mid[1] * 2 * (1 - t) * t +
        end[1] * t * t,
]);
export const createCubicBezier = (start, midA, midB, end) => (t) => ([
    start[0] * (1 - t) * (1 - t) * (1 - t) +
        midA[0] * 3 * (1 - t) * (1 - t) * t +
        midB[0] * 3 * (1 - t) * t * t +
        end[0] * t * t * t,
    start[1] * (1 - t) * (1 - t) * (1 - t) +
        midA[1] * 3 * (1 - t) * (1 - t) * t +
        midB[1] * 3 * (1 - t) * t * t +
        end[1] * t * t * t,
]);
