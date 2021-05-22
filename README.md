<div align="center">
<h1>babel-plugin-loop-unrolling</h1>

<p>loop unrolling some code at build-time</p>
</div>

---
## 问题 

在开发过程中经常会为了构造一些数组或者复用一些逻辑以减少重复代码写了Array.map循环来生成  
比如在使用 `antd#Select` 时构造 `Options` 或者 `antd#Table` 构造 `Columns`
```ts
const options = [
    { label: 'optionA', value: 1 },
    { label: 'optionB', value: 2 },
    { label: 'optionC', value: 3 },
    { label: 'optionD', value: 4 },
    { label: 'optionE', value: 5 },
];

// 没错 我觉得重复写 label: xx 和 value: xxx 也是重复的浪费
// ⬇️ ⬇️ ⬇️ ⬇️ 我通常喜欢写成这样 
const options = (
    [
        ['OptionA', 1],
        ['OptionB', 2],
        ['OptionC', 3],
        ['OptionD', 4],
        ['OptionE', 5],
    ] as [label: string, value: number][]
).map(([label, value]) => ({ label, value }));

// or like this
const start = parseSomeValue(period.start);
const end = parseSomeValue(period.end);
// ⬇️ ⬇️ ⬇️ ⬇️ 我通常写成这样
const [start, end] = [
    period.start,
    period.end
].map(parseSomeValue);
```
当重复的东西多出来的时候，我会更倾向于「构造」出来，而非写出来  
但是当我阅读到「尽量的避免循环」和「循环展开」「Duff's Device」相关的概念时  
我就担心起了过度的这么写是否是一种性能损失

## 解法 

在开发过程中，依旧按照减少重复的风格来写，但是在输出成代码时，再将其转化为非循环写法

```ts
const toOptionObject = ([label, value]: [string, number]) => {
    return ({ label, value });
};
// @loader-helper loop-unrolling
const options = (
    [
        ['OptionA', 1],
        ['OptionB', 2],
        ['OptionC', 3],
        ['OptionD', 4],
        ['OptionE', 5],
    ] as [label: string, value: number][]
).map(toOptionObject);


// ↓ ↓ ↓ ↓ ↓ ↓
const toOptionObject = ([label, value]: [string, number]) => {
    return ({ label, value });
};

const a = [
    toOptionObject(['OptionA', 1]),
    toOptionObject(['OptionB', 2]),
    toOptionObject(['OptionC', 3]),
    toOptionObject(['OptionD', 4]),
    toOptionObject(['OptionE', 5])
];

```
通过插件转化之后，将会展开循环的内容。

## 安装和使用

哦吼 抱歉 还没有发到 npm 上去，如果想玩的话，可能暂时需要麻烦你 clone 下来 build 一下了 :stuck_out_tongue_winking_eye:

### 插件参数

支持修改生效语句的注释指令标记  
```ts
interface PluginConfig {
    /**
     * 需要用在行注释，且同行中没有其他的注释内容
     * 判断时将会按照 trim 后的规则进行比较
     * 比如 '  1  ' 和 '1' 和 '1   ' 是等价的
     * @default ' @loader-helper loop-unrolling'
     */
    directive?: string
}
```
```js
// in babel.config.js
module.exports = {
    plugins: [
        [
            'babel-plugin-loop-unrolling',
            { directive: '@your-custom-directive' }
        ]
    ]
};
```
```js
// @your-custom-directive
const a = [1,2,3,4].map(add);
```

## TODO

- [ ] 在 JSX 中可以直接使用
```js
function App() {
    return (
        <div>
        {
            ['TabA', 'TabB', 'TabC'].map(mapToTab)
        }
        </div>
    )
}
```
- [ ] 匿名箭头函数使用 提取出匿名函数变为临时函数
```js
const a = [1, 2, 3].map(i => i + 1);
// ↓ ↓ ↓ ↓ ↓ ↓ 
const _tmp = i => i + 1;
const a = [
    _tmp(1, 0, [1,2,3]),
    _tmp(2, 1, [1,2,3]),
    _tmp(3, 2, [1,2,3])
];
```
- [ ] 确定数量的 spread 元素使用
```js
const a = [1,2,3,4,...[5,6,7]].map(i => i + 1);
// ↓ ↓ ↓ ↓ ↓ ↓ 
const _tmp = i => i + 1;
const a = [
    _tmp(1, 0, [1,2,3,4,5,6,7]),
    _tmp(2, 1, [1,2,3,4,5,6,7]),
    _tmp(3, 2, [1,2,3,4,5,6,7]),
    _tmp(4, 3, [1,2,3,4,5,6,7]),
    _tmp(5, 4, [1,2,3,4,5,6,7]),
    _tmp(6, 5, [1,2,3,4,5,6,7]),
    _tmp(7, 6, [1,2,3,4,5,6,7])
];
```

## 感谢

- [babel-plugin-preval](https://github.com/kentcdodds/babel-plugin-preval) 提供的项目结构参考  
- [kcd-scripts](https://github.com/kentcdodds/kcd-scripts) 提供的脚手架 script  
- [babel-handbook/plugin-handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) 还有官方插件指南的

<div style="display: flex; align-items: center;justify-content: space-around">
<p> 上面前两个东西都是这个老哥的，感谢他 </p>
<a href="https://kentcdodds.com"><img src="https://avatars.githubusercontent.com/u/1500684?v=3?s=100" width="100px;" alt=""/><br /><sub><b>Kent C. Dodds</b></sub></a>
</div>