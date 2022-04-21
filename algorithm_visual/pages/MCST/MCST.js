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
    this.flag = false
    this.from = ''
    this.to = ''
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
    if (this.flag) {
        ctx.fillText(this.weight, (this.x + this.dx) / 2, (this.y + this.dy) / 2 - 8 * xs)
        ctx.fillStyle = 'black'
        ctx.fillText(this.from, this.x - 5 * xs, this.y)
        ctx.fillText(this.to, this.dx + 5 * xs, this.dy)
    } else {
        ctx.fillText(this.weight, (this.x + this.dx) / 2, (this.y + this.dy) / 2)
    }
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

const edges = []

let disjointSet = null

Page({
    onShow() {
        timeout_delay = 500
        this.setData({
            vertexs: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            startVertex: 'A',
            speed: 600,
            canvasWidth: deviceWidth,
            canvasHeight: 430 * xs,
            btnRunColor: 'lightblue',
            iskruskal: false,
            algorithm: 'Prim'
        })

        const query = wx.createSelectorQuery()
        query.select('#MCSTCanvas')
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

    onHide() {
        state = PAUSE
    },

    onUnload() {
        state = PAUSE
    },

    initCanvas() {
        this.fillArcList()
        this.drawGraph()
        this.initRecordTable()
        this.initDisjointSet()
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

    algorithmChange(event) {
        this.setData({
            iskruskal: event.detail.value === 'Kruskal',
            algorithm: event.detail.value
        })
        this.handleRestart()
    },

    async handleRestart() {

        state = PAUSE

        this.setData({
            btnRunColor: 'lightblue'
        })

        await this.sleep(20)

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

        for (let i = 0; i < disjointSet.length; i++) {
            disjointSet[i][0].color = 'white'
            disjointSet[i][1].num = this.data.vertexs[i]
        }

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
        await this.sleep(20)
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

        for (let i = 0; i < disjointSet.length; i++) {
            disjointSet[i][0].color = 'white'
            disjointSet[i][1].num = this.data.vertexs[i]
        }

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

    async unLock() {
        let security = 0
        return new Promise(resolve => {
            let timer = setInterval(() => {
                if (security >= 50 || lock == false) {
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

        if (this.data.algorithm === 'Prim') {
            let startVertex = this.data.startVertex
            await this.prim(startVertex)
        } else {
            await this.kruskal()
        }

        lock = false
    },



    async kruskal() {
        this.drawBottom()
        await this.sleep(timeout_delay)
        if(state == PAUSE){
            lock = false 
            return Promise.resolve()
        }
        let tmpEdges = edges.slice()
        edges.sort((ei, ej) => ei.weight - ej.weight);
        await this.sortEdges(tmpEdges, edges)
        await this.sleep(timeout_delay)
        if(state == PAUSE){
            lock = false 
            return Promise.resolve()
        }
        let moveArc = new Arc(0, 0, 10 * xs, '', 'white')
        moveArc.strokeColor = 'green'
        moveArc.lineWidth = 2
        moveArc.isFill = false
        let vertexs = this.data.vertexs
        while(edges.length > 0) {
            let edge = edges[0]
            edge.lineWidth = 3
            edge.color = 'red'
            edge.draw(this.ctx)

            arcList[map[edge.from]].lines[map[edge.to]].lineWidth = 3
            arcList[map[edge.from]].lines[map[edge.to]].color = 'red'
            arcList[map[edge.to]].lines[map[edge.from]].lineWidth = 3
            arcList[map[edge.to]].lines[map[edge.from]].color = 'red'
            this.drawGraph()

            moveArc.x = edge.x - 5 * xs
            moveArc.y = edge.y
            this.ctx.clearRect(0, 230 * xs, this.data.canvasWidth, this.data.canvasHeight - 230 * xs)
            this.drawDisjointSet()
            this.drawEdges()
            moveArc.draw(this.ctx)

            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false 
                return Promise.resolve()
            }
            let fromIndex = map[edge.from]
            await this.move(moveArc,
                disjointSet[fromIndex][0].x + disjointSet[fromIndex][0].width / 2,
                disjointSet[fromIndex][0].y + disjointSet[fromIndex][0].height / 2)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false 
                return Promise.resolve()
            }
            let fpv = await this.unionFind(fromIndex, moveArc)
            if(state == PAUSE){
                lock = false
                return Promise.resolve()
            }
            let msg = 'find(' + vertexs[fromIndex] + ')=' + vertexs[fpv]
            this.drawResult(msg)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false 
                return Promise.resolve()
            }
            moveArc.x = edge.dx + 5 * xs
            moveArc.y = edge.dy

            this.ctx.clearRect(0, 230 * xs, this.data.canvasWidth, this.data.canvasHeight - 230 * xs)
            this.drawDisjointSet()
            this.drawEdges()
            moveArc.draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false 
                return Promise.resolve()
            }

            let toIndex = map[edge.to]
            await this.move(moveArc,
                disjointSet[toIndex][0].x + disjointSet[toIndex][0].width / 2,
                disjointSet[toIndex][0].y + disjointSet[toIndex][0].height / 2)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false 
                return Promise.resolve()
            }
            let tpv = await this.unionFind(toIndex, moveArc)
            if(state == PAUSE){
                lock = false
                return Promise.resolve()
            }
            if (fpv !== tpv) {
                msg = '(' + msg + ')' + ' != ' + '(find(' + vertexs[toIndex] + ')=' + vertexs[tpv] + ')'
                this.drawResult(msg)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false 
                    return Promise.resolve()
                }
                arcList[map[edge.from]].lines[map[edge.to]].color = 'green'
                arcList[map[edge.to]].lines[map[edge.from]].color = 'green'
                this.drawGraph()
                this.ctx.clearRect(0, 230 * xs, this.data.canvasWidth, this.data.canvasHeight - 230 * xs)
                this.drawDisjointSet()
                this.drawEdges()
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false 
                    return Promise.resolve()
                }
                disjointSet[fpv][0].color = disjointSet[fpv][1].color = 'yellow'
                disjointSet[fpv][0].draw(this.ctx)
                disjointSet[fpv][1].draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false 
                    return Promise.resolve()
                }
                disjointSet[fpv][1].num = vertexs[tpv]
                disjointSet[fpv][1].draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false 
                    return Promise.resolve()
                }
                disjointSet[fpv][0].color = disjointSet[fpv][1].color = 'white'
                disjointSet[fpv][0].draw(this.ctx)
                disjointSet[fpv][1].draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false 
                    return Promise.resolve()
                }
            } else {
                msg = '(' + msg + ')' + ' == ' + '(' + 'find(' + vertexs[toIndex] + ')=' + vertexs[tpv] + ')'
                this.drawResult(msg)
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false 
                    return Promise.resolve()
                }
                arcList[map[edge.from]].lines[map[edge.to]].lineWidth = 1
                arcList[map[edge.from]].lines[map[edge.to]].color = 'gray'
                arcList[map[edge.to]].lines[map[edge.from]].lineWidth = 1
                arcList[map[edge.to]].lines[map[edge.from]].color = 'gray'
                this.drawGraph()
                await this.sleep(timeout_delay)
                if(state == PAUSE){
                    lock = false 
                    return Promise.resolve()
                }
            }
            edges.shift()
            this.ctx.clearRect(0, 205 * xs, this.data.canvasWidth, this.data.canvasHeight - 205 * xs)
            this.drawDisjointSet()
            this.drawEdges()
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false 
                return Promise.resolve()
            }
        }

        return Promise.resolve()
    },

    drawResult(msg) {
        this.ctx.clearRect(0, 200 * xs, this.data.canvasWidth, 30 * xs)
        this.ctx.fillStyle = 'black'
        this.ctx.fillText(msg, this.data.canvasWidth / 2, 215 * xs)
    },

    async unionFind(v, moveArc) {
        disjointSet[v][1].color = 'lightblue'
        disjointSet[v][1].draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state == PAUSE){
            lock = false
            return Promise.resolve(v)
        }
        while (v !== map[disjointSet[v][1].num]) {
            disjointSet[v][1].color = 'white'
            disjointSet[v][1].draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false
                return Promise.resolve(v)
            }
            v = map[disjointSet[v][1].num]
            await this.move(moveArc,
                disjointSet[v][0].x + disjointSet[v][0].width / 2,
                disjointSet[v][0].y + disjointSet[v][0].height / 2)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false
                return Promise.resolve(v)
            }
            disjointSet[v][1].color = 'lightblue'
            disjointSet[v][1].draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state == PAUSE){
                lock = false
                return Promise.resolve(v)
            }
        }
        disjointSet[v][1].color = 'white'
        disjointSet[v][1].draw(this.ctx)
        return Promise.resolve(v)
    },


    async move(target, dx, dy) {
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
                that.ctx.clearRect(0, 230 * xs, that.data.canvasWidth, that.data.canvasHeight - 230 * xs)
                that.drawDisjointSet()
                that.drawEdges()
                target.draw(that.ctx)
                security++
                that.canvas.requestAnimationFrame(render)
            })
        })
    },



    drawBottom() {
        this.ctx.clearRect(0, 205 * xs, this.data.canvasWidth, this.data.canvasHeight - 205 * xs)
        if (this.data.algorithm == 'Prim') {
            this.drawRecordTable()
            this.drawVertexs()
            this.drawMatrix()
        } else {
            this.reSetEdges()
        }
    },

    reSetEdges() {
        edges.length = 0
        let start = this.data.canvasWidth - 240 * xs
        let top = this.data.canvasHeight - 185 * xs
        let moveDown = 0,
            moveLeft = 0
        for (let i = 0; i < adjMatrixList.length; i++) {
            for (let j = i; j < adjMatrixList[0].length; j++) {
                if (i != j && adjMatrixList[i][j].num !== '∞') {
                    moveLeft = Math.floor(edges.length / 6)
                    moveDown = edges.length % 6
                    let line = new Line(start + moveLeft * 60 * xs,
                        top + moveDown * 30 * xs,
                        start + moveLeft * 60 * xs + 30 * xs,
                        top + moveDown * 30 * xs,
                        1,
                        'gray',
                        adjMatrixList[i][j].num)
                    line.from = this.data.vertexs[i]
                    line.to = this.data.vertexs[j]
                    line.flag = true
                    line.draw(this.ctx)
                    edges.push(line)
                }
            }
        }
        this.drawDisjointSet()
    },

    drawEdges() {
        for (let i = 0; i < edges.length; i++) {
            edges[i].draw(this.ctx)
        }
    },



    initDisjointSet() {
        let start = this.data.canvasWidth - 290 * xs
        let top = this.data.canvasHeight - 185 * xs
        disjointSet = new Array(7)
        for (let i = 0; i < disjointSet.length; i++) {
            disjointSet[i] = new Array(2)
            disjointSet[i][0] = new Rect(start - 50 * xs,
                top + 25 * xs * i,
                25 * xs,
                25 * xs,
                this.data.vertexs[i],
                'white')
            disjointSet[i][1] = new Rect(start - 25 * xs,
                top + 25 * xs * i,
                25 * xs,
                25 * xs,
                this.data.vertexs[i],
                'white')
        }
    },
    drawDisjointSet() {
        this.ctx.beginPath()
        this.ctx.fillText('Disjoint Set', disjointSet[0][0].x + 25 * xs, disjointSet[0][0].y - 10 * xs)
        for (let i = 0; i < disjointSet.length; i++) {
            for (let j = 0; j < disjointSet[i].length; j++) {
                disjointSet[i][j].draw(this.ctx)
            }
        }
    },

    find(x, y, edges) {
        for (let i = 0; i < edges.length; i++) {
            if (x == edges[i].x && y == edges[i].y) {
                return i
            }
        }
        return -1
    },


    async sortEdges(tmpEdges, edges) {

        let record = []
        for (let i = 0; i < edges.length; i++) {
            let arr = new Array(6)
            let resIndex = this.find(tmpEdges[i].x, tmpEdges[i].y, edges)
            arr[0] = Math.abs(tmpEdges[i].x - tmpEdges[resIndex].x) / 30
            arr[1] = Math.abs(tmpEdges[i].y - tmpEdges[resIndex].y) / 30
            arr[2] = tmpEdges[i].x
            arr[3] = tmpEdges[i].y
            arr[4] = tmpEdges[resIndex].x
            arr[5] = tmpEdges[resIndex].y
            record.push(arr)
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

                that.ctx.clearRect(that.data.canvasWidth - 250 * xs, 210 * xs, 250 * xs, that.data.canvasHeight - 210 * xs)
                for (let i = 0; i < record.length; i++) {
                    if (record[i][2] > record[i][4]) {
                        tmpEdges[i].x -= record[i][0]
                        if (record[i][3] > record[i][5]) {
                            tmpEdges[i].y -= record[i][1]
                        } else {
                            tmpEdges[i].y += record[i][1]
                        }

                    } else {
                        tmpEdges[i].x += record[i][0]
                        if (record[i][3] > record[i][5]) {
                            tmpEdges[i].y -= record[i][1]
                        } else {
                            tmpEdges[i].y += record[i][1]
                        }
                    }
                    tmpEdges[i].dx = tmpEdges[i].x + 30 * xs
                    tmpEdges[i].dy = tmpEdges[i].y
                    tmpEdges[i].draw(that.ctx)
                }
                security++
                that.canvas.requestAnimationFrame(render)
            })
        })
    },


    async prim(startVertex) {
        this.drawBottom()
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return Promise.resolve()
        }
        let sv = map[startVertex]
        arcList[sv].color = '#FF0000'
        arcList[sv].draw(this.ctx)
        recordTable[sv][3].color = '#FF0000'
        recordTable[sv][3].draw(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return Promise.resolve()
        }
        recordTable[sv][2].color = '#FF6347'
        recordTable[sv][2].draw(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return Promise.resolve()
        }
        recordTable[sv][2].num = 'T'
        recordTable[sv][2].draw(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return Promise.resolve()
        }
        recordTable[sv][2].color = 'white'
        recordTable[sv][2].draw(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return Promise.resolve()
        }
        vertexsList[sv].color = '#87CEFA'
        vertexsList[sv].draw(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return Promise.resolve()
        }
        for (let i = 0; i < recordTable.length; i++) {
            adjMatrixList[sv][i].color = '#FF6347'
            adjMatrixList[sv][i].draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return Promise.resolve()
            }
            adjMatrixList[sv][i].color = '#FCE6C9'
            adjMatrixList[sv][i].draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return Promise.resolve()
            }
            if (i == sv) {
                recordTable[i][1].color = recordTable[i][0].color = 'yellow'
                recordTable[i][1].draw(this.ctx)
                recordTable[i][0].draw(this.ctx)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return Promise.resolve()
                }
                recordTable[i][1].num = 0
                recordTable[i][1].draw(this.ctx)
                recordTable[i][0].num = startVertex
                recordTable[i][0].draw(this.ctx)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return Promise.resolve()
                }
                recordTable[i][1].color = recordTable[i][0].color = 'white'
                recordTable[i][1].draw(this.ctx)
                recordTable[i][0].draw(this.ctx)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
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
                if (state == PAUSE) {
                    lock = false
                    return Promise.resolve()
                }
                recordTable[i][1].color = recordTable[i][0].color = 'yellow'
                recordTable[i][1].draw(this.ctx)
                recordTable[i][0].draw(this.ctx)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return Promise.resolve()
                }

                recordTable[i][1].num = adjMatrixList[sv][i].num
                recordTable[i][0].num = startVertex
                recordTable[i][1].draw(this.ctx)
                recordTable[i][0].draw(this.ctx)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return Promise.resolve()
                }
                recordTable[i][1].color = recordTable[i][0].color = 'white'
                recordTable[i][1].draw(this.ctx)
                recordTable[i][0].draw(this.ctx)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
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
                if (state == PAUSE) {
                    lock = false
                    return Promise.resolve()
                }
            }
        }

        vertexsList[sv].color = 'white'
        vertexsList[sv].draw(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
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
                if (state == PAUSE) {
                    lock = false
                    return Promise.resolve()
                }
                recordTable[j][2].color = 'white'
                recordTable[j][2].draw(this.ctx)
                if (recordTable[j][2].num !== 'T') {
                    recordTable[j][1].color = 'green'
                    recordTable[j][1].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if (state == PAUSE) {
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
                if (state == PAUSE) {
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
            if (state == PAUSE) {
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
            if (state == PAUSE) {
                lock = false
                return Promise.resolve()
            }
            arcList[cur].color = 'orange'
            arcList[cur].draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return Promise.resolve()
            }

            recordTable[cur][2].color = '#FF6347'
            recordTable[cur][2].draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return Promise.resolve()
            }
            recordTable[cur][2].num = 'T'
            recordTable[cur][2].draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return Promise.resolve()
            }
            recordTable[cur][2].color = 'white'
            recordTable[cur][2].draw(this.ctx)
            vertexsList[cur].color = '#87CEFA'
            vertexsList[cur].draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return Promise.resolve()
            }

            for (let j = 0; j < adjMatrixList[0].length; j++) {
                let tmp = recordTable[j][1].num === '∞' ? 1000 : recordTable[j][1].num
                adjMatrixList[cur][j].color = '#FF6347'
                adjMatrixList[cur][j].draw(this.ctx)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return Promise.resolve()
                }
                adjMatrixList[cur][j].color = '#FCE6C9'
                adjMatrixList[cur][j].draw(this.ctx)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return Promise.resolve()
                }

                // 判断j是否已经确定了
                if (adjMatrixList[cur][j].num !== '∞') {
                    recordTable[j][2].color = '#FF6347'
                    recordTable[j][2].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if (state == PAUSE) {
                        lock = false
                        return Promise.resolve()
                    }
                    recordTable[j][2].color = 'white'
                    recordTable[j][2].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if (state == PAUSE) {
                        lock = false
                        return Promise.resolve()
                    }

                }

                if (adjMatrixList[cur][j].num != '∞' &&
                    recordTable[j][2].num !== 'T') {
                    adjMatrixList[cur][j].color = 'blue'
                    adjMatrixList[cur][j].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if (state == PAUSE) {
                        lock = false
                        return Promise.resolve()
                    }

                    recordTable[j][1].color = 'red'
                    recordTable[j][1].draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if (state == PAUSE) {
                        lock = false
                        return Promise.resolve()
                    }

                    arcList[cur].lines[j].color = 'blue'
                    arcList[cur].lines[j].lineWidth = 3
                    arcList[j].lines[cur].color = 'blue'
                    arcList[j].lines[cur].lineWidth = 3
                    arcList[j].color = '#FF6347'

                    if (recordTable[j][0].num !== '-1') {
                        let jpreNode = map[recordTable[j][0].num]
                        arcList[jpreNode].lines[j].lineWidth = 3
                        arcList[jpreNode].lines[j].color = 'red'
                        arcList[j].lines[jpreNode].lineWidth = 3
                        arcList[j].lines[jpreNode].color = 'red'
                    }
                    this.drawGraph()
                    await this.sleep(timeout_delay)

                    if (state == PAUSE) {
                        lock = false
                        return Promise.resolve()
                    }

                    let msg = null
                    if (adjMatrixList[cur][j].num >= tmp) {
                        msg = [adjMatrixList[cur][j].num, '>=', recordTable[j][1].num]
                        this.drawTipMsg(msg)
                        await this.sleep(timeout_delay)
                        if (state == PAUSE) {
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
                        if (state == PAUSE) {
                            lock = false
                            return Promise.resolve()
                        }
                        if (recordTable[j][0].num !== '-1') {
                            let jpreNode = map[recordTable[j][0].num]
                            arcList[jpreNode].lines[j].lineWidth = 1
                            arcList[jpreNode].lines[j].color = 'gray'
                            arcList[j].lines[jpreNode].lineWidth = 1
                            arcList[j].lines[jpreNode].color = 'gray'
                            this.drawGraph()
                            await this.sleep(timeout_delay)
                            if (state == PAUSE) {
                                lock = false
                                return Promise.resolve()
                            }
                        }

                        recordTable[j][1].color = 'white'
                        adjMatrixList[cur][j].color = '#FCE6C9'
                        recordTable[j][1].draw(this.ctx)
                        adjMatrixList[cur][j].draw(this.ctx)

                        this.ctx.clearRect(0, 200 * xs, this.data.canvasWidth, 30 * xs)

                        await this.sleep(timeout_delay)
                        if (state == PAUSE) {
                            lock = false
                            return Promise.resolve()
                        }

                    } else {
                        msg = [adjMatrixList[cur][j].num, '<', recordTable[j][1].num]
                        this.drawTipMsg(msg)
                        await this.sleep(timeout_delay)
                        if (state == PAUSE) {
                            lock = false
                            return Promise.resolve()
                        }
                        if (recordTable[j][0].num !== '-1') {
                            let jpreNode = map[recordTable[j][0].num]
                            arcList[jpreNode].lines[j].lineWidth = 1
                            arcList[jpreNode].lines[j].color = 'gray'
                            arcList[j].lines[jpreNode].lineWidth = 1
                            arcList[j].lines[jpreNode].color = 'gray'
                            this.drawGraph()
                            await this.sleep(timeout_delay)
                            if (state == PAUSE) {
                                lock = false
                                return Promise.resolve()
                            }
                        }

                        recordTable[j][1].color = recordTable[j][0].color = 'yellow'
                        recordTable[j][1].draw(this.ctx)
                        recordTable[j][0].draw(this.ctx)
                        await this.sleep(timeout_delay)
                        if (state == PAUSE) {
                            lock = false
                            return Promise.resolve()
                        }

                        recordTable[j][1].num = adjMatrixList[cur][j].num
                        recordTable[j][1].draw(this.ctx)
                        recordTable[j][0].num = vertexs[cur]
                        recordTable[j][0].draw(this.ctx)
                        await this.sleep(timeout_delay)
                        if (state == PAUSE) {
                            lock = false
                            return Promise.resolve()
                        }

                        recordTable[j][1].color = recordTable[j][0].color = 'white'
                        recordTable[j][1].draw(this.ctx)
                        recordTable[j][0].draw(this.ctx)

                        adjMatrixList[cur][j].color = '#FCE6C9'
                        adjMatrixList[cur][j].draw(this.ctx)

                        arcList[cur].lines[j].color = 'gray'
                        arcList[cur].lines[j].lineWidth = 1
                        arcList[j].lines[cur].color = 'gray'
                        arcList[j].lines[cur].lineWidth = 1
                        arcList[j].color = 'white'
                        this.drawGraph()
                        this.ctx.clearRect(0, 200 * xs, this.data.canvasWidth, 30 * xs)
                        await this.sleep(timeout_delay)
                        if (state == PAUSE) {
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
        let color = ['blue', 'black', 'red']
        for (let i = 0; i < msg.length; i++) {
            this.ctx.fillStyle = color[i]
            this.ctx.fillText(msg[i], (this.data.canvasWidth - 45 * xs) / 2 + 15 * xs * i + 7.5 * xs, 215 * xs)
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
                        let weight = Math.ceil(Math.random() * 100) + 1
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