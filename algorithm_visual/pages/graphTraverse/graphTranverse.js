let app = getApp()
let deviceWidth = app.globalData.width
let xs = deviceWidth / 375
let timeout_delay = 500

function Arc(x, y, radius, num, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.num = num
    this.color = color
    this.lines = {}
    this.strokeColor = 'gray'
    this.lineWidth = 1
    this.isFill = true
}
Arc.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.lineWidth = this.lineWidth
    ctx.strokeStyle = this.strokeColor
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    if (this.isFill) {
        ctx.fill()
    }
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.fillText(this.num, this.x, this.y)
}
let arcList = []

function Line(x, y, dx, dy, lineWidth, color) {
    this.x = x
    this.y = y
    this.dx = dx
    this.dy = dy
    this.lineWidth = lineWidth
    this.color = color
}

Line.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.strokeStyle = this.color
    ctx.lineWidth = this.lineWidth
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.dx, this.dy)
    ctx.stroke()
}

let way = 0

function LinkNode(value) {
    this.value = value
    this.next = null
}

function Queue() {
    this.head = null
    this.tail = null
    this.size = 0
}

Queue.prototype.enqueue = function (value) {
    let newLinkNode = new LinkNode(value)
    if (this.head == null) {
        this.head = newLinkNode
    }
    this.size++
    if (this.tail != null) {
        this.tail.next = newLinkNode
    }
    this.tail = newLinkNode
}

Queue.prototype.dequeue = function () {
    if (this.head == null) {
        return
    }
    this.size--
    let res = this.head
    this.head = res.next
    if (this.head == null) {
        this.tail = null
    }
    return res.value
}

Queue.prototype.isEmpty = function () {
    if (this.head == null) {
        return true
    }
    return false
}
Queue.prototype.getSize = function () {
    return this.size
}

function Rect(x, y, width, height, num, color) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.num = num
    this.color = color
    this.strokeColor = 'gray'
}


Rect.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.strokeStyle = this.strokeColor
    ctx.lineWidth = 1
    ctx.rect(this.x, this.y, this.width, this.height)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = 'black'
    ctx.fillText(this.num, this.x + this.width / 2, this.y + this.height / 2)
}

let vertexs = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
let visitedRect = []

let vertexsList = []

let moveArc = null

let lock = false

let map = {
    'A': 0,
    'B': 1,
    'C': 2,
    'D': 3,
    'E': 4,
    'F': 5,
    'G': 6
}

const PAUSE = false
const PLAY = true
let state = PAUSE

let printList = []
let queueList = []
let adjMatrixList = null

Page({
    onShow() {
        timeout_delay = 500
        way = 0
        lock = false
        printList.length = 0
        queueList.length = 0
        this.setData({
            btnBgc: ['lightgreen', 'lightblue', 'lightblue'],
            canvasWidth: deviceWidth,
            canvasHeight: 430 * xs,
            speed: 600,
            vertexs: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            startVertex: 'A'
        })

        const query = wx.createSelectorQuery()
        query.select('#graphTrCanvas')
            .fields({
                node: true,
                size: true
            })
            .exec((res) => {
                this.canvas = res[0].node
                this.ctx = this.canvas.getContext('2d')
                const dpr = wx.getSystemInfoSync().pixelRatio
                this.canvas.width = res[0].width * dpr
                this.canvas.height = res[0].height * dpr
                this.ctx.scale(dpr, dpr)
                this.ctx.font = 'bold ' + 12 * xs + 'px serif'
                this.ctx.textAlign = 'center'
                this.ctx.textBaseline = 'middle'
                this.initCanvas()
            })
    },

    onHide() {
        state = PAUSE
    },

    onUnload() {
        state = PAUSE
    },

    initCanvas() {
        this.fillArcList()
        this.drawGraph()
        this.initAdjMatrixList()
        this.fillAdjMatrixList()
        this.drawMatrix()
        this.fillVertexsList()
        this.drawVertexs()
        this.fillVisitedRect()
        this.drawVisitedRect()
    },

    drawGraph() {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, 200 * xs)
        for (let i = 0; i < arcList.length; i++) {
            let lines = arcList[i].lines
            for (let line in lines) {
                lines[line].draw(this.ctx)
            }
        }
        for (let i = 0; i < arcList.length; i++) {
            arcList[i].draw(this.ctx)
        }

    },

    drawMatrix() {
        this.ctx.beginPath()
        this.ctx.fillStyle = 'black'
        for (let j = 0; j < adjMatrixList.length; j++) {
            this.ctx.fillText(vertexs[j], adjMatrixList[0][j].x + 12.5 * xs, adjMatrixList[0][j].y - 10 * xs)
        }
        for (let i = 0; i < adjMatrixList.length; i++) {
            for (let j = 0; j < adjMatrixList[0].length; j++) {
                adjMatrixList[i][j].draw(this.ctx)
            }
        }
    },

    createGraph(event) {
        
        if (this.data.btnBgc[2] === 'rgb(211, 211, 211)') {
            return
        }
        let x = event.changedTouches[0].x
        let y = event.changedTouches[0].y
        if (x < deviceWidth - 185 * xs ||
            x > deviceWidth - 10 * xs ||
            y < this.data.canvasHeight - 185 * xs ||
            y > this.data.canvasHeight - 10 * xs) {
            return
        }

        for (let i = 0; i < adjMatrixList.length; i++) {
            for (let j = 0; j < adjMatrixList[i].length; j++) {
                if (i == j) continue
                if (x > adjMatrixList[i][j].x &&
                    x < adjMatrixList[i][j].x + 25 * xs &&
                    y > adjMatrixList[i][j].y &&
                    y < adjMatrixList[i][j].y + 25 * xs) {
                    if (adjMatrixList[i][j].num === '1' || adjMatrixList[j][i].num === '1') {
                        adjMatrixList[i][j].num = adjMatrixList[j][i].num = ''
                        delete arcList[i].lines[j]
                        delete arcList[j].lines[i]
                    } else {
                        adjMatrixList[i][j].num = adjMatrixList[j][i].num = '1'
                        arcList[i].lines[j] = new Line(arcList[i].x, arcList[i].y, arcList[j].x, arcList[j].y, 1, 'gray')
                        arcList[j].lines[i] = new Line(arcList[j].x, arcList[j].y, arcList[i].x, arcList[i].y, 1, 'gray')
                    }
                    adjMatrixList[i][j].draw(this.ctx)
                    adjMatrixList[j][i].draw(this.ctx)
                    this.drawGraph()
                    break
                }

            }
        }

    },
    fillArcList() {
        arcList.length = 0
        let marginLeft = (deviceWidth - 240 * xs) / 2
        let arc = new Arc(marginLeft, 20 * xs, 10 * xs, 'A', '#F0FFFF')
        arcList.push(arc)
        arc = new Arc(marginLeft, 180 * xs, 10 * xs, 'B', '#F0FFFF')
        arcList.push(arc)
        arc = new Arc(marginLeft + 240 * xs, 180 * xs, 10 * xs, 'C', '#F0FFFF')
        arcList.push(arc)
        arc = new Arc(marginLeft + 240 * xs, 20 * xs, 10 * xs, 'D', '#F0FFFF')
        arcList.push(arc)
        arc = new Arc(marginLeft + 120 * xs, 60 * xs, 10 * xs, 'E', '#F0FFFF')
        arcList.push(arc)
        arc = new Arc(marginLeft + 40 * xs, 115 * xs, 10 * xs, 'F', '#F0FFFF')
        arcList.push(arc)
        arc = new Arc(marginLeft + 200 * xs, 115 * xs, 10 * xs, 'G', '#F0FFFF')
        arcList.push(arc)
    },


    initAdjMatrixList() {
        adjMatrixList = new Array(7)
        for (let i = 0; i < adjMatrixList.length; i++) {
            adjMatrixList[i] = new Array(7)
            for (let j = 0; j < adjMatrixList[i].length; j++) {
                adjMatrixList[i][j] = null
            }
        }
    },

    fillAdjMatrixList() {
        for (let i = 0; i < adjMatrixList.length; i++) {
            for (let j = 0; j < adjMatrixList[0].length; j++) {
                adjMatrixList[i][j] = new Rect(deviceWidth - 185 * xs + j * 25 * xs,
                    this.data.canvasHeight - 185 * xs + i * 25 * xs,
                    25 * xs,
                    25 * xs,
                    '',
                    'white')
            }
        }
    },

    fillVisitedRect() {
        for (let i = 0; i < 7; i++) {
            visitedRect[i] = new Rect(deviceWidth - 250 * xs,
                this.data.canvasHeight - 185 * xs + i * 25 * xs,
                25 * xs,
                25 * xs,
                'F',
                'white')
        }
    },

    fillVertexsList() {
        for (let i = 0; i < vertexs.length; i++) {
            vertexsList[i] = new Rect(deviceWidth - 215 * xs,
                this.data.canvasHeight - 185 * xs + i * 25 * xs,
                25 * xs,
                25 * xs,
                vertexs[i],
                'white')
            vertexsList[i].strokeColor = 'white'
        }
    },

    drawVertexs() {
        for (let i = 0; i < vertexs.length; i++) {
            vertexsList[i].draw(this.ctx)
        }
    },

    drawVisitedRect() {
        this.ctx.beginPath()
        this.ctx.fillText('Visited', visitedRect[0].x + 12.5 * xs, this.data.canvasHeight - 195 * xs)
        for (let i = 0; i < visitedRect.length; i++) {
            visitedRect[i].draw(this.ctx)
        }
    },


    handleDfs() {
        this.select(0)
    },

    handleBfs() {
        this.select(1)
    },

    select(index) {
        if (index == way) {
            return
        }
        this.handleRestart()
        let btnBgc = this.data.btnBgc
        btnBgc[way] = 'lightblue'
        btnBgc[index] = 'lightgreen'
        this.setData({
            btnBgc
        })
        way = index
    },

    async getFirstVex(v1) {
        for (let j = 0; j < adjMatrixList[0].length; j++) {
            adjMatrixList[v1][j].color = '#FF6347'
            adjMatrixList[v1][j].draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                return Promise.resolve(-1)
            }
            adjMatrixList[v1][j].color = '#FFDEAD'
            adjMatrixList[v1][j].draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                return Promise.resolve(-1)
            }
            if (adjMatrixList[v1][j].num === '1') {
                return Promise.resolve(j)
            }

        }
        return Promise.resolve(-1)
    },

    async getNextVex(v1, v2) {
        for (let j = v2 + 1; j < adjMatrixList[0].length; j++) {
            adjMatrixList[v1][j].color = '#FF6347'
            adjMatrixList[v1][j].draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                return Promise.resolve(-1)
            }
            adjMatrixList[v1][j].color = '#FFDEAD'
            adjMatrixList[v1][j].draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                return Promise.resolve(-1)
            }
            if (adjMatrixList[v1][j].num === '1') {
                return Promise.resolve(j)
            }
        }
        return Promise.resolve(-1)
    },

    async dfsDemo() {
        let sv = map[this.data.startVertex]
        moveArc = new Arc(arcList[sv].x, arcList[sv].y, 15 * xs, '', 'white')
        moveArc.strokeColor = 'green'
        moveArc.lineWidth = 2
        moveArc.isFill = false
        moveArc.draw(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return Promise.resolve()
        }
        await this.dfsVisualProcess(sv)
        return Promise.resolve()
    },

    async dfsVisualProcess(v) {
        await this.move(moveArc, arcList[v].x, arcList[v].y, 0)    
        vertexsList[v].color = 'lightblue'
        vertexsList[v].draw(this.ctx)
        arcList[v].color = 'orange'
        arcList[v].draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state == PAUSE){
            lock = false
            return Promise.resolve()
        }
        let newArc = new Arc(arcList[v].x, arcList[v].y, arcList[v].radius, arcList[v].num, arcList[v].color)
        printList.push(newArc)
        await this.move(printList[printList.length - 1], visitedRect[0].x - 40 * xs, this.data.canvasHeight - 175 * xs + (printList.length - 1) * 25 * xs, 0)
        if(state == PAUSE){
            lock = false
            return Promise.resolve()
        }

        visitedRect[v].color = 'orange'
        visitedRect[v].draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state == PAUSE){
            lock = false
            return Promise.resolve()
        }
        visitedRect[v].num = 'T'
        visitedRect[v].draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state == PAUSE){
            lock = false
            return Promise.resolve()
        }
        visitedRect[v].color = 'white'
        visitedRect[v].draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state == PAUSE){
            lock = false
            return Promise.resolve()
        }
        let w = await this.getFirstVex(v)
        while (w != -1) {
            visitedRect[w].color = 'orange'
            visitedRect[w].draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false
                return Promise.resolve()
            }
            visitedRect[w].color = 'white'
            visitedRect[w].draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false
                return Promise.resolve()
            }
            if (visitedRect[w].num === 'F') {
                vertexsList[v].color = 'white'
                vertexsList[v].draw(this.ctx)
                await this.dfsVisualProcess(w)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }
                await this.move(moveArc, arcList[v].x, arcList[v].y, 0)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }
            }
            vertexsList[v].color = 'lightblue'
            vertexsList[v].draw(this.ctx)
            w = await this.getNextVex(v, w)
        }
        vertexsList[v].color = 'white'
        vertexsList[v].draw(this.ctx)
        return Promise.resolve()

    },

    async bfsDemo() {
        this.drawQueue()
        let sv = map[this.data.startVertex]
        moveArc = new Arc(arcList[sv].x, arcList[sv].y, 15 * xs, '', 'white')
        moveArc.strokeColor = 'green'
        moveArc.lineWidth = 2
        moveArc.isFill = false
        moveArc.draw(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return Promise.resolve()
        }
        arcList[sv].color = 'lightgreen'
        let newArc = new Arc(arcList[sv].x, arcList[sv].y, arcList[sv].radius, arcList[sv].num, arcList[sv].color)
        arcList[sv].draw(this.ctx)
        queueList.push(newArc)
        await this.move(newArc, visitedRect[0].x - 110 * xs + 12.5 * xs, this.data.canvasHeight - 175 * xs + (queueList.length - 1) * 25 * xs, 1)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return Promise.resolve()
        }
        visitedRect[sv].color = 'orange'
        visitedRect[sv].draw(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return Promise.resolve()
        }
        visitedRect[sv].num = 'T'
        visitedRect[sv].draw(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return Promise.resolve()
        }
        visitedRect[sv].color = 'white'
        visitedRect[sv].draw(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return Promise.resolve()
        }
        let queue = new Queue()
        queue.enqueue(sv)
        // 队列不为空
        while (!queue.isEmpty()) {
            let u = queue.dequeue()
            queueList[0].color = 'orange'
            queueList[0].draw(this.ctx)
            arcList[u].color = 'orange'
            arcList[u].draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return Promise.resolve()
            }
            printList.push(queueList.shift())
            await this.move(printList[printList.length - 1], visitedRect[0].x - 40 * xs, this.data.canvasHeight - 175 * xs + (printList.length - 1) * 25 * xs, 2)

            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return Promise.resolve()
            }
            vertexsList[u].color = 'lightblue'
            vertexsList[u].draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return Promise.resolve()
            }
            let w = await this.getFirstVex(u)

            while (w != -1) {
                visitedRect[w].color = 'orange'
                visitedRect[w].draw(this.ctx)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return Promise.resolve()
                }
                visitedRect[w].color = 'white'
                visitedRect[w].draw(this.ctx)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return Promise.resolve()
                }
                if (visitedRect[w].num === 'F') {
                    await this.move(moveArc, arcList[w].x, arcList[w].y, 1)
                    await this.sleep(timeout_delay)
                    if (state == PAUSE) {
                        lock = false
                        return Promise.resolve()
                    }
                    arcList[w].color = 'lightgreen'
                    arcList[w].draw(this.ctx)
                    newArc = new Arc(arcList[w].x, arcList[w].y, arcList[w].radius, arcList[w].num, arcList[w].color)
                    queueList.push(newArc)
                    await this.move(newArc, visitedRect[0].x - 110 * xs + 12.5 * xs, this.data.canvasHeight - 175 * xs + (queueList.length - 1) * 25 * xs, 1)
                    await this.sleep(timeout_delay)
                    if (state == PAUSE) {
                        lock = false
                        return Promise.resolve()
                    }
                    visitedRect[w].color = 'orange'
                    visitedRect[w].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if (state == PAUSE) {
                        lock = false
                        return Promise.resolve()
                    }
                    visitedRect[w].num = 'T'
                    visitedRect[w].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if (state == PAUSE) {
                        lock = false
                        return Promise.resolve()
                    }
                    visitedRect[w].color = 'white'
                    visitedRect[w].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if (state == PAUSE) {
                        lock = false
                        return Promise.resolve()
                    }
                    queue.enqueue(w)
                }
                w = await this.getNextVex(u, w)
                if (state == PAUSE) {
                    lock = false
                    return Promise.resolve()
                }
            }
            vertexsList[u].color = 'white'
            vertexsList[u].draw(this.ctx)
        }
        return Promise.resolve()
    },

    async sleep(delay = 1000) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, delay)
        })
    },

    async move(target, dx, dy, type) {
        let speedx = Math.abs(target.x - dx) / 30
        let speedy = Math.abs(target.y - dy) / 30
        let ax = target.x,
            ay = target.y
        if (speedx == 0 && speedy == 0) {
            return Promise.resolve()
        }
        let security = 0
        let that = this
        return new Promise(resolve => {
            let handlerId = that.canvas.requestAnimationFrame(function render() {
                if (security >= 30 || state == PAUSE) {
                    that.canvas.cancelAnimationFrame(handlerId)
                    resolve()
                    return
                }
                if (ax > dx) {
                    target.x -= speedx
                    if (ay > dy) {
                        target.y -= speedy
                    } else {
                        target.y += speedy
                    }
                } else {
                    target.x += speedx
                    if (ay > dy) {
                        target.y -= speedy
                    } else {
                        target.y += speedy
                    }
                }
                that.reDraw(type)
                security++
                that.canvas.requestAnimationFrame(render)
            })
        })
    },

    reDraw(type) {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        this.drawGraph()
        // dfs
        if (type != 0) {
            // bfs
            // 出队列
            if (type === 2) {
                let step = 25 * xs / 30
                for (let i = 0; i < queueList.length; i++) {
                    queueList[i].y -= step
                }
            }
            // 绘制队列的内容
            this.drawQueue()
        }
        this.drawVisitedRect()
        this.drawVertexs()
        this.drawMatrix()
        this.drawPrint()
        if (moveArc != null) {
            moveArc.draw(this.ctx)
        }
    },


    drawQueue() {
        this.ctx.beginPath()
        this.strokeStyle = 'gray'
        this.ctx.moveTo(visitedRect[0].x - 110 * xs, this.data.canvasHeight - 185 * xs)
        this.ctx.lineTo(visitedRect[0].x - 110 * xs, this.data.canvasHeight - 35 * xs)
        this.ctx.lineTo(visitedRect[0].x - 85 * xs, this.data.canvasHeight - 35 * xs)
        this.ctx.lineTo(visitedRect[0].x - 85 * xs, this.data.canvasHeight - 185 * xs)
        this.ctx.stroke()
        this.ctx.fillStyle = 'black'
        this.ctx.fillText('Q', visitedRect[0].x - 97.5 * xs, this.data.canvasHeight - 22.5 * xs)
        for (let i = 0; i < queueList.length; i++) {
            queueList[i].draw(this.ctx)
        }
    },

    drawPrint() {
        this.ctx.beginPath()
        this.ctx.fillStyle = 'black'
        this.ctx.fillText('Print', visitedRect[0].x - 40 * xs, this.data.canvasHeight - 195 * xs)
        for (let i = 0; i < printList.length; i++) {
            printList[i].draw(this.ctx)
        }
    },

    async unLock() {
        let security = 0
        return new Promise(resolve => {
            let timer = setInterval(() => {
                if (security >= 50 || lock == false) {
                    clearInterval(timer)
                    resolve()
                    return
                }
                security++
            }, 20)
        })
    },

    async demo() {
        let btnBgc = this.data.btnBgc
        if (btnBgc[2] === 'rgb(211, 211, 211)') {
            return
        }
        btnBgc[2] = 'rgb(211, 211, 211)'
        this.setData({
            btnBgc
        })
        await this.unLock()
        lock = true
        state = PLAY
        this.drawPrint()
        if (way === 0) {
            await this.dfsDemo()
        } else {
            await this.bfsDemo()
        }
        lock = false
    },


    slowDown() {
        if (timeout_delay >= 1000) {
            return
        }
        timeout_delay += 100
        this.setData({
            speed: this.data.speed - 100
        })
    },

    speedUp() {
        if (timeout_delay <= 100) {
            return
        }
        timeout_delay -= 100
        this.setData({
            speed: this.data.speed + 100
        })
    },

    async clear() {
        let btnBgc = this.data.btnBgc
        btnBgc[2] = 'lightblue'
        this.setData({
            btnBgc
        })
        state = PAUSE
        await this.sleep(15)

        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        for (let i = 0; i < arcList.length; i++) {
            arcList[i].color = '#F0FFFF'
            for (let key in arcList[i].lines) {
                delete arcList[i].lines[key]
            }
        }
        for (let i = 0; i < adjMatrixList.length; i++) {
            for (let j = 0; j < adjMatrixList[0].length; j++) {
                adjMatrixList[i][j].num = ''
                adjMatrixList[i][j].color = 'white'
            }
        }
        for (let i = 0; i < visitedRect.length; i++) {
            visitedRect[i].color = 'white'
            visitedRect[i].num = 'F'
        }

        for (let i = 0; i < vertexsList.length; i++) {
            vertexsList[i].color = 'white'
        }

        printList.length = 0
        queueList.length = 0
        
        this.drawGraph()
        this.drawMatrix()
        this.drawVertexs()
        this.drawVisitedRect()
    },

    radioChange(event) {
        this.setData({
            startVertex: event.detail.value
        })
    },

    async handleRestart() {
        state = PAUSE
        let btnBgc = this.data.btnBgc
        btnBgc[2] = 'lightblue'
        this.setData({
            btnBgc
        })
        await this.sleep(15)
        this.restart()
    },

    restart() {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        for (let i = 0; i < arcList.length; i++) {
            arcList[i].color = '#F0FFFF'
            for (let key in arcList[i].lines) {
                arcList[i].lines[key].lineWidth = 1
                arcList[i].lines[key].color = 'gray'
            }
        }
        for (let i = 0; i < adjMatrixList.length; i++) {
            for (let j = 0; j < adjMatrixList[0].length; j++) {
                adjMatrixList[i][j].color = 'white'
            }
        }
        for (let i = 0; i < visitedRect.length; i++) {
            visitedRect[i].color = 'white'
            visitedRect[i].num = 'F'
        }

        for (let i = 0; i < vertexsList.length; i++) {
            vertexsList[i].color = 'white'
        }
        printList.length = 0
        queueList.length = 0
        this.drawGraph()
        this.drawMatrix()
        this.drawVertexs()
        this.fillVisitedRect()
        this.drawVisitedRect()
    },


})