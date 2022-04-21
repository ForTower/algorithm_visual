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
    ctx.font = 'bold ' + 12 * xs + 'px serif'
    ctx.fillText(this.num, this.x, this.y)
}



function Line(x, y, dx, dy, lineWidth, color, weight) {
    this.x = x
    this.y = y
    this.dx = dx
    this.dy = dy
    this.lineWidth = lineWidth
    this.color = color
    this.weight = weight
}

Line.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.strokeStyle = this.color
    ctx.lineWidth = this.lineWidth
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.dx, this.dy)
    ctx.stroke()
    ctx.font = 'bold ' + 12 * xs + 'px serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'blue'
    ctx.fillText(this.weight, (this.x + this.dx) / 2, (this.y + this.dy) / 2)
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
    ctx.font = 'bold ' + 12 * xs + 'px serif'
    ctx.fillText(this.num, this.x + this.width / 2, this.y + this.height / 2)
}

let map = {
    'A': 0,
    'B': 1,
    'C': 2,
    'D': 3,
    'E': 4,
    'F': 5,
    'G': 6
}

let map2 = {
    '∞': 1000
}

let arcList = []
let adjMatrixList = null
let vertexsList = []
let recordTable = null
const PAUSE = false
const PLAY = true
let state = PAUSE
let lock = false

Page({
    onShow() {
        timeout_delay = 500
        this.setData({
            vertexs: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            startVertex: 'A',
            speed: 600,
            canvasWidth: deviceWidth,
            canvasHeight: 430 * xs,
            btnRunColor: 'lightblue'
        })

        const query = wx.createSelectorQuery()
        query.select('#dijkstraCanvas')
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
                this.ctx.textBaseline = 'middle'
                this.initCanvas()
            })
    },

    onHide(){
        state = PAUSE
    },

    onUnload(){
        state = PAUSE
    },

    initCanvas() {
        this.fillArcList()
        this.drawGraph()
        this.initRecordTable()
        this.drawRecordTable()
        this.initAdjMatrixList()
        this.fillAdjMatrixList()
        this.drawMatrix()
        this.fillVertexsList()
        this.drawVertexs()

    },

    initRecordTable() {
        recordTable = new Array(7)
        for (let i = 0; i < recordTable.length; i++) {
            recordTable[i] = new Array(4)
            for (let j = 0; j < recordTable[i].length; j++) {
                recordTable[i][j] = new Rect(deviceWidth - 260 * xs - j * 35 * xs,
                    this.data.canvasHeight - 185 * xs + i * 25 * xs,
                    35 * xs,
                    25 * xs,
                    'F',
                    'white')
                if (j == 3) {
                    recordTable[i][j].num = this.data.vertexs[i]
                } else if (j == 1) {
                    recordTable[i][j].num = '∞'
                } else if (j == 0) {
                    recordTable[i][j].num = '-1'
                }
            }
        }
    },

    drawRecordTable() {
        this.ctx.beginPath()
        this.ctx.font = 'bold ' + 10 * xs + 'px serif'
        let colName = ['Path', 'Cost', 'Known', 'V']
        for (let i = 0; i < colName.length; i++) {
            this.ctx.fillText(colName[i], deviceWidth - 260 * xs - i * 35 * xs + 17.5 * xs, this.data.canvasHeight - 195 * xs)
        }
        for (let i = 0; i < recordTable.length; i++) {
            for (let j = 0; j < recordTable[i].length; j++) {
                recordTable[i][j].draw(this.ctx)
            }
        }
    },

    radioChange(event) {
        this.setData({
            startVertex: event.detail.value
        })
    },

    async handleRestart() {

        state = PAUSE

        this.setData({
            btnRunColor: 'lightblue'
        })

        await this.sleep(15)



        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        for (let i = 0; i < arcList.length; i++) {
            arcList[i].color = 'white'
            for (let key in arcList[i].lines) {
                arcList[i].lines[key].lineWidth = 1 
                arcList[i].lines[key].color = 'gray'
            }
        }
        this.drawGraph()

        for (let i = 0; i < recordTable.length; i++) {
            for (let j = 0; j < recordTable[i].length; j++) {
                recordTable[i][j].color = 'white'
                if (j == 0) {
                    recordTable[i][j].num = '-1'
                } else if (j == 1) {
                    recordTable[i][j].num = '∞'
                } else if (j == 2) {
                    recordTable[i][j].num = 'F'
                }
            }
        }
        this.drawRecordTable()

        for (let i = 0; i < vertexsList.length; i++) {
            vertexsList[i].color = 'white'
        }
        this.drawVertexs()

        for (let i = 0; i < adjMatrixList.length; i++) {
            for (let j = 0; j < adjMatrixList[i].length; j++) {
                adjMatrixList[i][j].color = 'white'
            }
        }
        this.drawMatrix()


    },

    async handleClear() {
        state = PAUSE
        this.setData({
            btnRunColor: 'lightblue'
        })
        await this.sleep(15)
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        for (let i = 0; i < arcList.length; i++) {
            arcList[i].color = 'white'
            for (let key in arcList[i].lines) {
                delete arcList[i].lines[key]
            }
        }
        this.drawGraph()

        for (let i = 0; i < recordTable.length; i++) {
            for (let j = 0; j < recordTable[i].length; j++) {
                recordTable[i][j].color = 'white'
                if (j == 0) {
                    recordTable[i][j].num = '-1'
                } else if (j == 1) {
                    recordTable[i][j].num = '∞'
                } else if (j == 2) {
                    recordTable[i][j].num = 'F'
                }
            }
        }

        this.drawRecordTable()

        for (let i = 0; i < vertexsList.length; i++) {
            vertexsList[i].color = 'white'
        }

        this.drawVertexs()

        for (let i = 0; i < adjMatrixList.length; i++) {
            for (let j = 0; j < adjMatrixList[i].length; j++) {
                adjMatrixList[i][j].color = 'white'
                if (i != j) {
                    adjMatrixList[i][j].num = '∞'
                }
            }
        }

        this.drawMatrix()
    },

    async unLock(){
        let security = 0
        return new Promise(resolve=>{
            let timer = setInterval(()=>{
                if(security >= 50 || lock == false){
                    clearInterval(timer)
                    resolve()
                    return
                }
            }, 20)
        })
    },

    async handleRun() {

        if (this.data.btnRunColor != 'lightblue') {
            return
        }

        this.setData({
            btnRunColor: 'rgb(211, 211, 211)'
        })

        await this.unLock()
        lock = true
        state = PLAY
        let startVertex = this.data.startVertex
        await this.dijkstra(startVertex)
        lock = false
    },


    async dijkstra(startVertex) {
        await this.sleep(100)
        if(state == PAUSE){
            lock = false
            return Promise.resolve()
        }
        let sv = map[startVertex]
        arcList[sv].color = '#FF0000'
        arcList[sv].draw(this.ctx)
        recordTable[sv][3].color = '#FF0000'
        recordTable[sv][3].draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state == PAUSE){
            lock = false
            return Promise.resolve()
        }
        recordTable[sv][2].color = '#FF6347'
        recordTable[sv][2].draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state == PAUSE){
            lock = false
            return Promise.resolve()
        }
        recordTable[sv][2].num = 'T'
        recordTable[sv][2].draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state == PAUSE){
            lock = false
            return Promise.resolve()
        }
        recordTable[sv][2].color = 'white'
        recordTable[sv][2].draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state == PAUSE){
            lock = false
            return Promise.resolve()
        }
        vertexsList[sv].color = '#87CEFA'
        vertexsList[sv].draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state == PAUSE){
            lock = false
            return Promise.resolve()
        }
        for (let i = 0; i < recordTable.length; i++) {
            adjMatrixList[sv][i].color = '#FF6347'
            adjMatrixList[sv][i].draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false
                return Promise.resolve()
            }
            adjMatrixList[sv][i].color = '#FCE6C9'
            adjMatrixList[sv][i].draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false
                return Promise.resolve()
            }
            if (i == sv) {
                recordTable[i][1].color = recordTable[i][0].color = 'yellow'
                recordTable[i][1].draw(this.ctx)
                recordTable[i][0].draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }
                recordTable[i][1].num = 0
                recordTable[i][1].draw(this.ctx)
                recordTable[i][0].num = startVertex
                recordTable[i][0].draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }
                recordTable[i][1].color = recordTable[i][0].color = 'white'
                recordTable[i][1].draw(this.ctx)
                recordTable[i][0].draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }
            }
            if (adjMatrixList[sv][i].num !== '∞' && i != sv) {
                arcList[sv].lines[i].color = '#FF6347'
                arcList[sv].lines[i].lineWidth = 3 
                arcList[i].lines[sv].color = '#FF6347'
                arcList[i].lines[sv].lineWidth = 3 
                arcList[i].color = '#FF6347'
                this.drawGraph()
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }
                recordTable[i][1].color = recordTable[i][0].color = 'yellow'
                recordTable[i][1].draw(this.ctx)
                recordTable[i][0].draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }
                
                recordTable[i][1].num = adjMatrixList[sv][i].num
                recordTable[i][0].num = startVertex
                recordTable[i][1].draw(this.ctx)
                recordTable[i][0].draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }
                recordTable[i][1].color = recordTable[i][0].color = 'white'
                recordTable[i][1].draw(this.ctx)
                recordTable[i][0].draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }
                arcList[sv].lines[i].color = 'gray'
                arcList[sv].lines[i].lineWidth = 1 
                arcList[i].lines[sv].color = 'gray'
                arcList[i].lines[sv].lineWidth = 1 
                arcList[i].color = 'white'
                this.drawGraph()
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }
            }
        }

        vertexsList[sv].color = 'white'
        vertexsList[sv].draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state == PAUSE){
            lock = false
            return Promise.resolve()
        }
        let vertexs = this.data.vertexs
        for (let i = 0; i < vertexs.length - 1; i++) {
            let minCost = 1000
            let cur = 0
            for (let j = 0; j < recordTable.length; j++) {
                recordTable[j][2].color = '#FF6347'
                recordTable[j][2].draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }
                recordTable[j][2].color = 'white'
                recordTable[j][2].draw(this.ctx)
                if (recordTable[j][2].num !== 'T') {
                    recordTable[j][1].color = 'green'
                    recordTable[j][1].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if(state == PAUSE){
                        lock = false
                        return Promise.resolve()
                    }
                    recordTable[j][1].color = 'white'
                    recordTable[j][1].draw(this.ctx)
                }

                if (recordTable[j][1].num !== '∞' &&
                    minCost > recordTable[j][1].num &&
                    recordTable[j][2].num !== 'T') {
                    recordTable[cur][1].color = 'white'
                    recordTable[cur][1].draw(this.ctx)
                    recordTable[j][1].color = '#87CEFA'
                    recordTable[j][1].draw(this.ctx)
                    minCost = recordTable[j][1].num
                    cur = j
                }
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }
            }

            if (minCost == 1000) return Promise.resolve()
            recordTable[cur][1].color = 'white'
            recordTable[cur][1].draw(this.ctx)
            recordTable[cur][3].color = 'orange'
            recordTable[cur][3].draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false
                return Promise.resolve()
            }
            let preNode = map[recordTable[cur][0].num]
            arcList[preNode].lines[cur].lineWidth = 3 
            arcList[preNode].lines[cur].color = 'green'
            arcList[cur].lines[preNode].lineWidth = 3 
            arcList[cur].lines[preNode].color = 'green'
            this.drawGraph()
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false
                return Promise.resolve()
            }
            arcList[cur].color = 'orange'
            arcList[cur].draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false
                return Promise.resolve()
            }

            recordTable[cur][2].color = '#FF6347'
            recordTable[cur][2].draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false
                return Promise.resolve()
            }
            recordTable[cur][2].num = 'T'
            recordTable[cur][2].draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false
                return Promise.resolve()
            }
            recordTable[cur][2].color = 'white'
            recordTable[cur][2].draw(this.ctx)
            vertexsList[cur].color = '#87CEFA'
            vertexsList[cur].draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false
                return Promise.resolve()
            }

            for (let j = 0; j < adjMatrixList[0].length; j++) {
                let tmp = recordTable[j][1].num === '∞' ? 1000 : recordTable[j][1].num
                adjMatrixList[cur][j].color = '#FF6347'
                adjMatrixList[cur][j].draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }
                adjMatrixList[cur][j].color = '#FCE6C9'
                adjMatrixList[cur][j].draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false
                    return Promise.resolve()
                }

                if (adjMatrixList[cur][j].num !== '∞') {
                    recordTable[j][2].color = '#FF6347'
                    recordTable[j][2].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if(state == PAUSE){
                        lock = false
                        return Promise.resolve()
                    }
                    recordTable[j][2].color = 'white'
                    recordTable[j][2].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if(state == PAUSE){
                        lock = false
                        return Promise.resolve()
                    }

                }

                if (adjMatrixList[cur][j].num != '∞' &&
                    recordTable[j][2].num !== 'T') {
                    adjMatrixList[cur][j].color = 'blue'
                    adjMatrixList[cur][j].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if(state == PAUSE){
                        lock = false
                        return Promise.resolve()
                    }

                    recordTable[j][1].color = 'red'
                    recordTable[j][1].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if(state == PAUSE){
                        lock = false
                        return Promise.resolve()
                    }

                    recordTable[cur][1].color = 'green'
                    recordTable[cur][1].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if(state == PAUSE){
                        lock = false
                        return Promise.resolve()
                    }

                    arcList[cur].lines[j].color = 'blue'
                    arcList[cur].lines[j].lineWidth = 3 
                    arcList[j].lines[cur].color = 'blue'
                    arcList[j].lines[cur].lineWidth = 3 
                    arcList[j].color = '#FF6347'

                    if(recordTable[j][0].num !== '-1'){
                        let jpreNode = map[recordTable[j][0].num]
                        arcList[jpreNode].lines[j].lineWidth = 3 
                        arcList[jpreNode].lines[j].color = 'red'
                        arcList[j].lines[jpreNode].lineWidth = 3 
                        arcList[j].lines[jpreNode].color = 'red'
                    }
                    this.drawGraph()
                    await this.sleep(timeout_delay)

                    if(state == PAUSE){
                        lock = false
                        return Promise.resolve()
                    }

                    let msg = null
                    if (recordTable[cur][1].num + adjMatrixList[cur][j].num >= tmp) {
                        msg = [recordTable[cur][1].num, '+', adjMatrixList[cur][j].num, '>=', recordTable[j][1].num]
                        this.drawTipMsg(msg)
                        await this.sleep(timeout_delay)
                        if(state == PAUSE){
                            lock = false
                            return Promise.resolve()
                        }
                        arcList[cur].lines[j].color = 'gray'
                        arcList[cur].lines[j].lineWidth = 1 
                        arcList[j].lines[cur].color = 'gray'
                        arcList[j].lines[cur].lineWidth = 1 
                        arcList[j].color = 'white'
                        this.drawGraph()
                        await this.sleep(timeout_delay)
                        if(state == PAUSE){
                            lock = false
                            return Promise.resolve()
                        }
                        if(recordTable[j][0].num !== '-1'){
                            let jpreNode = map[recordTable[j][0].num]
                            arcList[jpreNode].lines[j].lineWidth = 1 
                            arcList[jpreNode].lines[j].color = 'gray'
                            arcList[j].lines[jpreNode].lineWidth = 1 
                            arcList[j].lines[jpreNode].color = 'gray'
                            this.drawGraph()
                            await this.sleep(timeout_delay)
                            if(state == PAUSE){
                                lock = false
                                return Promise.resolve()
                            }
                        }

                        recordTable[j][1].color = 'white'
                        recordTable[cur][1].color = 'white'
                        adjMatrixList[cur][j].color = '#FCE6C9'
                        recordTable[j][1].draw(this.ctx)
                        recordTable[cur][1].draw(this.ctx)
                        adjMatrixList[cur][j].draw(this.ctx)

                        this.ctx.clearRect(0, 200 * xs, this.data.canvasWidth, 30 * xs)

                        await this.sleep(timeout_delay)
                        if(state == PAUSE){
                            lock = false
                            return Promise.resolve()
                        }

                    } else {
                        msg = [recordTable[cur][1].num, '+', adjMatrixList[cur][j].num, '<', recordTable[j][1].num]
                        this.drawTipMsg(msg)
                        await this.sleep(timeout_delay)
                        if(state == PAUSE){
                            lock = false
                            return Promise.resolve()
                        }
                        if(recordTable[j][0].num !== '-1'){
                            let jpreNode = map[recordTable[j][0].num]
                            arcList[jpreNode].lines[j].lineWidth = 1 
                            arcList[jpreNode].lines[j].color = 'gray'
                            arcList[j].lines[jpreNode].lineWidth = 1 
                            arcList[j].lines[jpreNode].color = 'gray'
                            this.drawGraph()
                            await this.sleep(timeout_delay)
                            if(state == PAUSE){
                                lock = false
                                return Promise.resolve()
                            }
                        }

                        recordTable[j][1].color = recordTable[j][0].color = 'yellow'
                        recordTable[j][1].draw(this.ctx)
                        recordTable[j][0].draw(this.ctx)
                        await this.sleep(timeout_delay)
                        if(state == PAUSE){
                            lock = false
                            return Promise.resolve()
                        }

                        recordTable[j][1].num = recordTable[cur][1].num + adjMatrixList[cur][j].num
                        recordTable[j][1].draw(this.ctx)
                        recordTable[j][0].num = vertexs[cur]
                        recordTable[j][0].draw(this.ctx)
                        await this.sleep(timeout_delay)
                        if(state == PAUSE){
                            lock = false
                            return Promise.resolve()
                        }

                        recordTable[j][1].color = recordTable[j][0].color = 'white'
                        recordTable[j][1].draw(this.ctx)
                        recordTable[j][0].draw(this.ctx)

                        recordTable[cur][1].color = 'white'
                        adjMatrixList[cur][j].color = '#FCE6C9'
                        recordTable[cur][1].draw(this.ctx)
                        adjMatrixList[cur][j].draw(this.ctx)

                        arcList[cur].lines[j].color = 'gray'
                        arcList[cur].lines[j].lineWidth = 1 
                        arcList[j].lines[cur].color = 'gray'
                        arcList[j].lines[cur].lineWidth = 1 
                        arcList[j].color = 'white'
                        this.drawGraph()
                        this.ctx.clearRect(0, 200 * xs, this.data.canvasWidth, 30 * xs)
                        await this.sleep(timeout_delay)
                        if(state == PAUSE){
                            lock = false
                            return Promise.resolve()
                        }

                    }
                }

            }
            vertexsList[cur].color = 'white'
            vertexsList[cur].draw(this.ctx)
            await this.sleep(timeout_delay)
        }

        return Promise.resolve()
    },

    drawTipMsg(msg) {
        this.ctx.clearRect(0, 200 * xs, this.data.canvasWidth, 30 * xs)
        this.ctx.beginPath()
        let color = ['green', 'black', 'blue', 'black', 'red']
        for (let i = 0; i < msg.length; i++) {
            this.ctx.fillStyle = color[i]
            this.ctx.fillText(msg[i], (this.data.canvasWidth - 75 * xs) / 2 + 15 * xs * i + 7.5 * xs, 215 * xs)
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
                    '∞',
                    'white')
                if (i == j) {
                    adjMatrixList[i][j].num = 0
                }
            }
        }
    },

    drawMatrix() {
        let vertexs = this.data.vertexs
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

    fillVertexsList() {
        let vertexs = this.data.vertexs
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
        let vertexs = this.data.vertexs
        for (let i = 0; i < vertexs.length; i++) {
            vertexsList[i].draw(this.ctx)
        }
    },

    createGraph(event) {
        if (this.data.btnRunColor === 'rgb(211, 211, 211)') {
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
                if (i == j) {
                    continue
                }
                if (x > adjMatrixList[i][j].x &&
                    x < adjMatrixList[i][j].x + 25 * xs &&
                    y > adjMatrixList[i][j].y &&
                    y < adjMatrixList[i][j].y + 25 * xs) {
                    if (adjMatrixList[i][j].num != '∞' || adjMatrixList[j][i].num != '∞') {
                        adjMatrixList[i][j].num = adjMatrixList[j][i].num = '∞'
                        delete arcList[i].lines[j]
                        delete arcList[j].lines[i]
                    } else {
                        let weight = Math.ceil(Math.random() * 30) + 1
                        adjMatrixList[i][j].num = adjMatrixList[j][i].num = weight
                        arcList[i].lines[j] = new Line(arcList[i].x, arcList[i].y, arcList[j].x, arcList[j].y, 1, 'gray', weight)
                        arcList[j].lines[i] = new Line(arcList[j].x, arcList[j].y, arcList[i].x, arcList[i].y, 1, 'gray', weight)
                    }
                    adjMatrixList[i][j].draw(this.ctx)
                    adjMatrixList[j][i].draw(this.ctx)
                    this.drawGraph()
                    break
                }
            }
        }

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

    async sleep(delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, delay)
        })
    }
})