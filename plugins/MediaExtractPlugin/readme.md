### 目标
提取css文件中多媒体查询css样式，并打包成单独的文件，提高css的加载效率

### 场景
假设有main.css
```css
div {
    height: 200px;
    color: red;
    overflow: hidden;
    background-color: aqua;
    margin-bottom: 20px;
}

@media (max-width: 480px) {
    div {
        background-color: lightgreen;
    }
    div {
        color: green;
    }
}

@media (max-width: 960px) {
    div {
        background-color: aliceblue;
    }
    div {
        color: blue;
    }
}



.container{
    color: red;
    background-color: green;
}

body{
    color: blue;
    background: url(2.131f3c4fe7dda6ea7686ecff63b51db8.png) no-repeat;
}




@media (max-width: 960px) {
    .container{
        color: red;
        background-color: blue;
    }
}


/*# sourceMappingURL=main.css.map*/
```
main.css包含一个 `@media (max-width: 480px)`，两个 `@media (max-width: 960px)`，插件在打包时，会从 `main.css` 文件中分别提取 
`@media (max-width: 480px)`并单独打包成 `main@480.css`文件，通过 `link` 标签引入。

由于两个 `@media (max-width: 960px)` 规则相同，因此插件会合并这两个多媒体实例，并打包成一个 `main@960.css` 文件，通过 `link` 标签引入。

最终的结果：

main.css：
```css
div {
    height: 200px;
    color: red;
    overflow: hidden;
    background-color: aqua;
    margin-bottom: 20px;
}


.container{
    color: red;
    background-color: green;
}

body{
    color: blue;
    background: url(2.131f3c4fe7dda6ea7686ecff63b51db8.png) no-repeat;
}


/*# sourceMappingURL=main.css.map*/
```

main@480.css：
```css
    div {
        background-color: lightgreen;
    }
    div {
        color: green;
    }
```

main@960.css：
```css
    div {
        background-color: aliceblue;
    }
    div {
        color: blue;
    }
    .container{
        color: red;
        background-color: blue;
    }
```

index.html：
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Mini Webpack</title>
    <link href="main.css" rel="stylesheet">
    <link href="main@480.css"  media="(max-width:480px)" rel="stylesheet">
    <link href="main@960.css"  media="(max-width:960px)" rel="stylesheet">
  </head>
  <body>
    <div class="container">container</span>
    <div>我是红色</div>
  <script src="main.js"></script></body>
</html>
```


### 优点
在重度响应式设计系统中，能够减少css文件大小，并且根据多媒体类型应用有效的css样式，优先加载有效的css资源，提高css下载效率，解析之行效率，减少首屏时间

### todo
- 目前场景比较单一，只针对了 @media (max-width: ...px) 做处理。实际项目中需要设置几个断点，比如
    + 移动端： max-width: 760px
    + ipad: max-width: 960px
    + 大于960px的视为pc端

- 需要支持sourcemap能力
- 需要支持代码分割懒加载能力。