const process = (...param) => param;

const identity = (...args) => args[0];

const otherBoolean = false; // 123
// 33329
// @loader-helper loop-unrolling

const a = [
        process(true, 0, [true, false, , 2]),
        process(false, 1, [true, false, , 2]),
        ,
        process(2, 3, [true, false, , 2])
    ],
    a1 = [identity(1, 0, [1, 2, 3]), identity(2, 1, [1, 2, 3]), identity(3, 2, [1, 2, 3])];
const a2 = [true, false, otherBoolean].map(process); // @loader-helper loop-unrolling

const a3 = [
    identity(['1', 3, false], 0, [
        ['1', 3, false],
        ['2', 8, false],
        ['3', 2, false],
        ['4', 9, false]
    ]),
    identity(['2', 8, false], 1, [
        ['1', 3, false],
        ['2', 8, false],
        ['3', 2, false],
        ['4', 9, false]
    ]),
    identity(['3', 2, false], 2, [
        ['1', 3, false],
        ['2', 8, false],
        ['3', 2, false],
        ['4', 9, false]
    ]),
    identity(['4', 9, false], 3, [
        ['1', 3, false],
        ['2', 8, false],
        ['3', 2, false],
        ['4', 9, false]
    ])
];
const b = [process(true, 0, [true, false, a]), process(false, 1, [true, false, a]), process(a, 2, [true, false, a])];
