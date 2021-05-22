const process = (...param) => param;
const identity = (...args) => args[0];

const otherBoolean = false;

// 123
// 33329
// @loader-helper loop-unrolling
const a = [true, false, , 2].map(process),
    a1 = [1, 2, 3].map(identity);

const a2 = [true, false, otherBoolean].map(process);

// @loader-helper loop-unrolling
const a3 = [
    ['1', 3, false],
    ['2', 8, false],
    ['3', 2, false],
    ['4', 9, false]
].map(identity);

const b = [process(true, 0, [true, false, a]), process(false, 1, [true, false, a]), process(a, 2, [true, false, a])];
