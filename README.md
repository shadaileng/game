> https://developer.mozilla.org/zh-CN/docs/Games 的学习案例

# <center>游戏开发</center>

[toc]

## 一. 序言

得益于`JavaScript`实时编译技术性能的大幅提升，以及新开放的`API`,开发基于`HTML5`的游戏更加容易.

### 1 功能与对应的技术

浏览器`web`平台实现的功能与对应的技术:

功能|技术
---|---
音频|`Web Audio API`
图形|`WebGL (OpenGL ES 2.0)`
输入|`Touch events`, `Gamepad API`, `设备传感器`, `WebRTC`,` Full Screen API`, `Pointer Lock API`
语言|`JavaScript` (或是`C/C++`使用`Emscripten`来编译成`JavaScript`)
网络|`WebRTC`和/或`WebSockets`
存储|`IndexedDB`或是 "云(存储)"
`Web`|`HTML`, `CSS`, `SVG`,`Social API`(还有其他很多很多东西！)

### 2 游戏结构与工作流程

#### 2.1 呈现\接受\解析\计算\重复

每个视频游戏的目标是向用户`呈现`一个场景,`接受`用户的输入,将输入`解析`成动作信息,并`计算`这些动作在场景中的变化,游戏场景是不断`重复`的,直到有终止游戏的信号出现.

有一些游戏是通过用户输入来驱动游戏循环的,通过输入来判断下一个要呈现的游戏场景,如: 找不同游戏

有一些游戏是控制每个时间点,每一帧都遍历游戏逻辑,实现呈现场景状态.

#### 2.2 构建一个游戏循环

游戏场景是循环渲染的结果,在循环过程中响应事件回调函数,处理用户输入事件.`window.requestAnimationFrame()`回调调用函数本身可以形成循环.

```
window.main = function(){
  window.requestAnimationFrame(main);
  //无论你的主循环需要做什么
};

main(); //开始循环
```

上面的程序中出现了两个问题:
- `main()`函数污染了`window`对象
- 没有提供停止循环的方法

第一个问题可以使用立即调用的函数表达式(`IIFE`)创建创建游戏循环.第二个问题可以创建一个`Game`主体对象,保存`requestAnimationFrame`返回值`stopKey`,需要停止循环时,调用`window.cancelAnimationFrame()`方法,并传入`stopKey`.

```
;(function(){
  function main(){
    Game.stopKey = window.requestAnimationFrame(main);
    //你的主循环内容
  }
  main(); //开始循环
})();
```

`requestAnimationFrame`方法会给回调函数传入一个精确到千分之一毫秒的事件对象`DOMHighResTimeStamp`,用来记录循环时间.

```
;(function(){
	Game = {}
	function main(tFrame) {
		Game.stopKey = requestAnimationFrame(main)
		console.log(tFrame)
	}
	main()
})();
```

每帧的工作时间

```
;(function(){
	function init() {
		Game = {
			tickLength: 16, 				// 20Hz
			lastTick: performance.now(),	// 最后更新时间
			stopKey: 0
		}
	}
	function updateBatch(tickNum) {
		for(let i = 0; i < tickNum; i++) {
			Game.lastTick = Game.lastTick + Game.tickLength
			update(Game.lastTick)
		}
	}
	function update(lastTick) {
		console.log('update: ' + lastTick)
	}
	function render(tFrame) {
		
	}
	function main(tFrame) {
		Game.stopKey = requestAnimationFrame(main)
		let nextTick = Game.lastTick + Game.tickLength
		let tickNum = 0
		/*
		console.log('tFrame: ' + tFrame)
		console.log('Game.lastTick: ' + Game.lastTick)
		console.log('nextTick: ' + nextTick)
		*/
		if (tFrame > nextTick) {
			let sinceTick = tFrame - Game.lastTick
			tickNum = Math.floor((tFrame - Game.lastTick) / Game.tickLength)
		}
		
//		console.log('tFrame: ' + tFrame)
//		console.log('now: ' + performance.now())
		
		updateBatch(tickNum)
		render(tFrame)
		Game.lastTick = tFrame
	}
	init()
	main()
})();

```

# 二. 游戏开发技术

## 1 Canvas

`<canvas>`是`HTML5`新增的元素，可用于通过使用`JavaScript`中的脚本来绘制图形。它可以用于绘制图形，制作照片，创建动画，甚至可以进行实时视频处理或渲染。

- `<canvas>`标签
    ```
    <canvas id="canvas"></canvas>
    ```
- `js`获取`canvas`对象以及上下文(`context`)
    ```
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ```
- 根据上下文(`context`)绘制图像
    ```
    ctx.fillStyle = 'green';
    ctx.fillRect(10, 10, 100, 100);
    ```
### 1.1 基本用法

#### 1.1.1 canvas标签

`<canvas>` 标签只有两个属性 —— `width`和`height`,默认值分别为`300px`和`150px`,用来定义画布的大小.

如果浏览器不支持`canvas`标签,会显示`canvas`标签的内部元素,闭合标签`</canvas>`不能省略.

```
<canvas id="stockGraph" width="150" height="150">
  current stock price: $3.15 +0.15
</canvas>

<canvas id="clock" width="150" height="150">
  <img src="images/clock.png" width="150" height="150" alt=""/>
</canvas>
```
    
#### 1.1.2 context渲染上下文

`<canvas>`元素创造了一个固定大小的画布，它公开了一个或多个渲染上下文，其可以用来绘制和处理要展示的内容

通过`getContext()`方法可以获取画布的`context`,`2D`渲染上下文需要传入参数`'2d'`.
```
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
```

为了防止浏览器不支持`canvas`标签而获取`context`失败,需要在获取`context`之气那检查支持性

```
var canvas = document.getElementById('canvas');

if (canvas.getContext){
  var ctx = canvas.getContext('2d');
  // drawing code here
} else {
  // canvas-unsupported code here
}
```

模板:
```
<html>
  <head>
    <title>Canvas tutorial</title>
    <script type="text/javascript">
      function draw(){
        var canvas = document.getElementById('tutorial');
        if (canvas.getContext){
          var ctx = canvas.getContext('2d');
        }
      }
    </script>
    <style type="text/css">
      canvas { border: 1px solid black; }
    </style>
  </head>
  <body onload="draw();">
    <canvas id="tutorial" width="150" height="150"></canvas>
  </body>
</html>
```

### 1.2 绘制图形

`Canvas`坐标系是从左往右为`x`轴正轴,从上到下是`y`轴正轴.

#### 1.2.1 矩形
1. 填充矩形
    ```
    context.fillRect(x, y, width, height)
    ```
2. 矩形边框
    ```
    context.strokeRect(x, y, width, height)
    ```
3. 清除矩形区域
    ```
    context.clearRect(x, y, width, height)
    ```

#### 1.2.2 路径

路径是由许多子路径构成的,所有子路径存放在一个列表中,当调用`beginPath()`方法时,清空列表,重新绘制路径.

1. 开始路径
    ```
    context.beginPath()
    ```
2. 移动笔触,设置起始位置
    ```
    context.moveTo(x, y)
    ```
3. 绘制路径
    - 线
        ```
        context.lineTo(x, y)
        ```
    - 圆弧
        ```
        // x, y: 位置
        // r: 半径
        // startRadian: 起点弧度
        // endRadian: 终点弧度
        // anticlockwise: 是否顺时针,默认true
        context.arc(x, y, r, startRadian, endRadian, anticlockwise)
        
        // 根据给定的控制点和半径画一段圆弧，再以直线连接两个控制点
        context.arcTo(x1, y1, x2, y2, r)
        ```
    - 贝塞尔曲线
        - 二次贝塞尔曲线
            ```
            // cp1x, cp1y: 控制点
            // x, y: 结束点
            context.quadraticCurveTo(cp1x, cp1y, x, y)
            ```
        - 三次贝塞尔曲线
            ```
            // cp1x, cp1y: 第一控制点
            // cp2x, cp2y: 第二控制点
            // x, y: 结束点
            context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)
            ```
        - 矩形
            ```
            context.rect(x, y, width, height)
            ```
4. 闭合路径,路径首尾连接
    ```
    context.closePath()
    ```
5. 绘制路径
    - 绘制边框
        ```
        context.stroke()
        ```
    - 填充图形
        ```
        context.fille()
        ```

6. `Path2D`对象
    ```
    let path = new Path2D
	path.rect(200, 100, 100, 50)
	path.moveTo(250, 100)
	path.arc(250, 125, 25, - Math.PI / 2, Math.PI / 2)
	path.bezierCurveTo(237.5, 112.5, 262.5, 137.5, 250, 100)
	context.stroke(path)
    ```
#### 1.2.3 色彩

`context`有两种色彩属性:
- `fillStyle`: 填充颜色
- `strokeStyle`: 边框颜色

```
ctx.fillStyle = "orange";
ctx.fillStyle = "#FFA500";
ctx.fillStyle = "rgb(255,165,0)";
ctx.fillStyle = "rgba(255,165,0,1)";
```

# 参考
- [Canvas 绘图模糊问题解析](https://www.jianshu.com/p/f443685953ea)
