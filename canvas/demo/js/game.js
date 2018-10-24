function init() {
	Game = {
		tickLength: 16, 				// 20Hz
		lastTick: performance.now(),	// 最后更新时间
		stopKey: 0,
		canvas: null,
		context: null,
	}
	Game.canvas = document.querySelector('#canvas')
	Game.context = Game.canvas ? Game.canvas.getContext('2d') : null,
	Game.x = 0
	Game.y = 0
	Game.d = 0
	Game.s = 1
	Game.msg = ''
	Game.canvas.addEventListener('mousemove', function(e) {
		console.log("(" + e.offsetX + ", " + e.offsetY + ")")
	})
}
function updateBatch(tickNum) {
	for(let i = 0; i < tickNum; i++) {
		Game.lastTick = Game.lastTick + Game.tickLength
		update(Game.lastTick)
	}
}
function update(lastTick) {
//		console.log('update: ' + lastTick)
	if (Game.d == 0) {
		Game.x += Game.s
		if(Game.x >= 25) Game.d = 1
	} else if (Game.d == 1) {
		Game.y += Game.s
		if(Game.y >= 25) Game.d = 2
	}else if (Game.d == 2) {
		Game.x -= Game.s
		if(Game.x <= 0) Game.d = 3
	}else if (Game.d == 3) {
		Game.y -= Game.s
		if(Game.y <= 0) Game.d = 0
	}
	Game.msg = '(' + Game.x + ', ' + Game.y + ')'
}
function render(tFrame) {
	let context = Game.context
	context.clearRect(0, 0, 400, 300)
	draw(50, 50, 50, 50, Game.x, Game.y)
	drawCircle(context)
	bezierCurve(context)
	path2D(context)
	colorStyle(context)
	context.font = "48px serif";
	context.fillText(Game.msg, 10, 280)
	
}
function main(tFrame) {
	Game.stopKey = requestAnimationFrame(main)
	let nextTick = Game.lastTick + Game.tickLength
	let tickNum = 0
	if (tFrame > nextTick) {
		let sinceTick = tFrame - Game.lastTick
		tickNum = Math.floor((tFrame - Game.lastTick) / Game.tickLength)
	}
	
	updateBatch(tickNum)
	render(tFrame)
	Game.lastTick = tFrame
}
function draw(x, y, w, h, offsetX, offsetY, context) {
	context = context || Game.context
	context.fillRect(x - w / 2, y - h / 2, w, h)
	context.clearRect(x - w / 2 + offsetX, y - h / 2 + offsetY, w / 2, h / 2)
	context.strokeRect(x - w * 4 / 10 + offsetX, y - h * 4 / 10 + offsetY, w * 3 / 10, h * 3 / 10)
}
function drawCircle(context) {
	context.beginPath()
	context.moveTo(150, 150)
	context.arc(150-25, 150, 25, Math.PI * 2, 0)
	context.closePath()
	context.stroke()
	
	context.beginPath()
	context.moveTo(150, 150)
	context.arcTo(150, 100, 200, 200, 25)
	context.closePath()
	context.stroke()
}

function bezierCurve(context) {
	context.beginPath()
	context.moveTo(100, 50)
	context.quadraticCurveTo(150, 100, 200, 50)
	context.closePath()
	context.stroke()
	
	context.beginPath()
	context.moveTo(200, 50)
	context.bezierCurveTo(230, 0,260, 100, 300, 50)
	context.closePath()
	context.stroke()
	
	context.beginPath()
	context.moveTo(300, 50)
	context.rect(300, 50, 100, 50)
	context.closePath()
	context.stroke()
}

function path2D(context) {
	let path = new Path2D
	path.rect(200, 100, 100, 50)
	path.moveTo(250, 100)
	path.arc(250, 125, 25, - Math.PI / 2, Math.PI / 2)
	path.bezierCurveTo(237.5, 112.5, 262.5, 137.5, 250, 100)
	context.stroke(path)
}

function colorStyle(context) {
	context.save()
	let path = new Path2D
	path.rect(300, 150, 100, 100)
	context.stroke(path)
	for(let x = 0; x < 100; x++) {
		for(let y = 0; y < 100; y++) {
			context.fillStyle = 'rgb(255, 255, 1)'
			context.fillRect(300 + x * 2.55, 150 + y * 2.55, 2.55, 2.55)
		}
	}
	context.restore()
}