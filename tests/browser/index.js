(function () {
'use strict';

function forEach(array, func) {
    let i = -1;
    while (++i < array.length)
        func(array[i], i, array);
    return array;
}

forEach(
  [1,2,3,4,5,6,7,8,9],
  (x) => console.log(x),
);

}());
