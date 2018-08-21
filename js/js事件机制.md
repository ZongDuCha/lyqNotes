### 函数中 return false 到底做了什么？

每次调用return false时，其实做了三件事
```js
event.preventDfefault();

event.stopPropagation();

停止回调函数执行并立即返回
```