import { reduce, times, flatten, map } from '../array';
export const sum = (...numbers) => {
    let num = 0;
    for (let i = numbers.length - 1; i >= 0; --i) {
        num += numbers[i];
    }
    return num;
};
export const noise = (list, getNeighbors, getValue, setValue, iterations = 1) => {
    for (let i = list.length - 1; i >= 0; --i) {
        const neighbors = getNeighbors(list[i]);
        const neighborValue = sum(...map(neighbors, getValue)) / neighbors.length;
        const newValue = neighborValue + getValue(list[i]) / 2;
        setValue(list[i], newValue);
    }
    if (!!iterations)
        noise(list, getNeighbors, getValue, setValue, iterations - 1);
    return list;
};
function getGridNeighbors(grid, x, y, radius = 1) {
    const results = [];
    for (let yOffset = radius * -1; yOffset < radius + 1; ++yOffset) {
        for (let xOffset = radius * -1; xOffset < radius + 1; ++xOffset) {
            const newY = y + yOffset;
            const newX = x + xOffset;
            if (!!grid[newY] && !!grid[newY][newX] && (!!yOffset || !!xOffset)) {
                results.push(grid[newY][newX]);
            }
        }
    }
    return results;
}
export function gridNoise(width, height, iterations = 3) {
    const noise = times(height, () => times(width, () => Math.random()));
    for (let i = iterations; i >= 0; --i) {
        for (let y = noise.length - 1; y >= 0; --y) {
            for (let x = noise[y].length - 1; x >= 0; --x) {
                const center = noise[y][x];
                const neighbors = getGridNeighbors(noise, x, y);
                noise[y][x] = ((reduce(neighbors, (total, value) => total + value, 0) / neighbors.length) + center) / 2;
            }
        }
    }
    const allValues = flatten(noise);
    const min = Math.min.apply(null, allValues);
    const max = Math.max.apply(null, allValues);
    for (let y = noise.length - 1; y >= 0; --y) {
        for (let x = noise[y].length - 1; x >= 0; --x) {
            noise[y][x] = (noise[y][x] - min) / (max - min);
        }
    }
    return noise;
}
