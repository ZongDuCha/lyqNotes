
### 由一个组件，向下找到所有指定的组件
```js
// 递归将找到的组件合并为一个数组并返回
function findComponentsDownward (context, componentName) {
  return context.$children.reduce((components, child) => {
    if (child.$options.name === componentName) components.push(child);
    const foundChilds = findComponentsDownward(child, componentName);
    return components.concat(foundChilds);
  }, []);
}
```
 