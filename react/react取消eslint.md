在根目录下找到package.json文件修改以下配置：
```js
"eslintConfig": {
    "extends": "react-app",
    "rules": {
      "no-undef": "off",
      "no-restricted-globals": "off",
      "no-unused-vars": "off"
    }
}
```