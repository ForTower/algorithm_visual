const app = getApp()
const deviceWidth = app.globalData.width
const xs = deviceWidth / 375
const PAUSE = false,
    PLAY = true
const dis = [100 * xs, 40 * xs, 25 * xs, 8 * xs, 5 * xs]
const lightgray = 'rgb(211, 211, 211)'

// 存放所有节点对象的集合
const nodeList = []
// 数组，用来存放矩形对象
const arrList = []
// 移动文字
const target = []

let timeout_delay = 500
let moveSpeed = 50
let state = PLAY
let msg = ''
// 数组此时的下标
let index = 0


function Node(value, index, x, y) {
    this.value = value
    this.index = index
    this.layer = -1
    this.x = x
    this.y = y
    this.leftLine = null
    this.rightLine = null
    this.color = '#54bd68'
}

Node.prototype.draw = function (ctx) {
    ctx.beginPath()
    // 在屏幕绘制节点
    ctx.textAlign = 'center'
    ctx.font = 'bold ' + 8 * xs + 'px serif'
    ctx.fillStyle = this.color
    ctx.arc(this.x, this.y, 8 * xs, 0, Math.PI * 2)
    ctx.fill()
    // 绘制节点的内容
    ctx.fillStyle = 'black'
    ctx.fillText(this.value, this.x, this.y)
    // 绘制下标
    ctx.fillStyle = 'red'
    ctx.font = 'bold ' + 10 * xs + 'px serif'
    ctx.fillText(this.index, this.x, this.y + 13 * xs)
}

function Rect(x, y, width, height, value, index) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.value = value
    this.index = index
    this.color = 'white'
}

Rect.prototype.draw = function (ctx) {
    ctx.beginPath()
    // 绘制矩形
    ctx.font = 'bold ' + 8 * xs + 'px serif'
    ctx.textAlign = 'center'
    ctx.lineWidth = 1
    ctx.strokeStyle = 'black'
    ctx.fillStyle = this.color
    ctx.rect(this.x, this.y, this.width, this.height)
    ctx.stroke()
    ctx.fill()
    // 绘制文字
    ctx.fillStyle = 'black'
    ctx.fillText(this.value, this.x + this.width / 2, this.y + this.height / 2)
    // 绘制下标
    ctx.fillStyle = 'red'
    ctx.font = 'bold ' + 10 * xs + 'px serif'
    ctx.fillText(this.index, this.x + this.width / 2, this.y + this.height + 7 * xs)
}

function Text(x, y, value, dx, dy) {
    this.x = x
    this.y = y
    this.value = value
    this.dx = dx
    this.dy = dy
    this.speedx = Math.abs(this.x - this.dx) / moveSpeed
    this.speedy = Math.abs(this.y - this.dy) / moveSpeed
}


Text.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.font = 'bold ' + 8 * xs + 'px serif'
    ctx.fillText(this.value, this.x, this.y)
}

function Line(x, y, sx, sy) {
    // 出发点
    this.x = x
    this.y = y
    // 到达点
    this.sx = sx
    this.sy = sy
}

Line.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'black'
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.sx, this.sy)
    ctx.stroke()
}



Page({
    onShow() {
        this.setData({
            canvasWidth: deviceWidth,
            canvasHeight: 400 * xs,
            btnBgc: ['white', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue'],
            speed: 600,
            model: 'max',
            isBin: false,
            inputValue: Math.ceil(Math.random() * 998)
        })
        // 每一次执行onShow方法时都要重新设置以下这些值
        this.initVal()
        this.initArrList()
        const query = wx.createSelectorQuery()
        query.select('#pqCanvas')
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
                this.drawRect()
            })

    },

    onUnload() {
        state = PAUSE
    },

    onHide() {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        state = PAUSE
    },

    initVal() {
        timeout_delay = 500
        moveSpeed = 50
        nodeList.length = 0
        arrList.length = 0
        state = PLAY
        msg = ''
        index = 0
        target.length = 0
    },

    initArrList() {
        let left = (deviceWidth - 330 * xs) / 2
        let top = 300 * xs
        for (let i = 0; i < 30; i++) {
            if (i < 15) {
                arrList[i] = new Rect(left + i * 22 * xs, top, 22 * xs, 22 * xs, '', i)
            } else {
                arrList[i] = new Rect(left + i % 15 * 22 * xs, top + 44 * xs, 22 * xs, 22 * xs, '', i)
            }
        }
    },

    set(index, value) {
        arrList[index].value = value
    },

    drawRect() {
        for (let i = 0; i < 30; i++) {
            arrList[i].draw(this.ctx)
        }
    },

    push() {
        this.select(2)
    },

    poll() {
        this.select(3)
    },

    peek() {
        this.select(4)
    },

    clear() {
        this.select(5)
    },



    async select(id) {

        if (this.data.btnBgc[id] === lightgray) {
            return
        }

        if (id === 2 && this.data.inputValue === '') {
            wx.showToast({
                title: '输入不能为空！',
                icon: 'none',
                duration: 1000
            })
            return
        }

        let btnBgc = this.data.btnBgc
        for (let i = 0; i < btnBgc.length; i++) {
            btnBgc[i] = lightgray
        }
        this.setData({
            btnBgc,
            isBin: true
        })

        state  = PLAY

        switch (id) {
            case 2:
                await this.pushVisual(this.data.inputValue)
                this.setData({
                    inputValue: Math.ceil(Math.random() * 998)
                })
                break
            case 3:
                await this.pollVisual()
                break
            case 4:
                await this.peekVisual()
                break
            case 5:
                this.clearVisual()
                break
        }

        btnBgc[0] = 'white'
        for (let i = 1; i < btnBgc.length; i++) {
            btnBgc[i] = 'lightblue'
        }
        this.setData({
            btnBgc,
            isBin: false
        })
    },

    async pollVisual() {
        if (nodeList.length === 0) {
            wx.showToast({
                title: '优先队列为空，出队失败！',
                icon: 'none',
                duration: 1000
            })
            return Promise.resolve()
        }
        index--
        msg = 'Polling Element: '
        this.drawTipMsg(msg)
        let text = new Text(nodeList[0].x,
            nodeList[0].y,
            nodeList[0].value,
            40 * xs,
            25 * xs)
        target.push(text)
        nodeList[0].value = ''
        arrList[0].value = ''
        await this.move(target)
        if(state === PAUSE){
            return Promise.resolve()
        }
        msg = 'Polled Element: ' + target[0].value
        if (index === 0) {
            nodeList.pop()
            this.reDraw()
            target.length = 0
            return Promise.resolve()
        }
        target.length = 0

        await this.sleep(timeout_delay)
        if(state === PAUSE){
            return Promise.resolve()
        }
        text = new Text(nodeList[index].x,
            nodeList[index].y,
            nodeList[index].value,
            nodeList[0].x,
            nodeList[0].y)
        target.push(text)
        nodeList[index].value = ''
        let offset = arrList[index].width / 2
        text = new Text(arrList[index].x + offset,
            arrList[index].y + offset,
            arrList[index].value,
            arrList[0].x + offset,
            arrList[0].y + offset)
        arrList[index].value = ''
        target.push(text)
        await this.move(target)
        if(state === PAUSE){
            return Promise.resolve()
        }
        arrList[0].value = nodeList[0].value = target[0].value
        target.length = 0

        let pIndex = (index - 1) >>> 1
        nodeList.pop()
        let line = null
        // 右孩子
        if ((index & 1) === 0) {
            line = nodeList[pIndex].rightLine
        } else {
            // 左孩子
            line = nodeList[pIndex].leftLine
        }
        await this.lineMove(line, nodeList[pIndex].x, nodeList[pIndex].y)
        if(state === PAUSE){
            return Promise.resolve()
        }
        await this.sleep(timeout_delay)
        if(state === PAUSE){
            return Promise.resolve()
        }
        // 右孩子
        if ((index & 1) === 0) {
            nodeList[pIndex].rightLine = null
        } else {
            // 左孩子
            nodeList[pIndex].leftLine = null
        }

        // 向下调整
        await this.shifDown()
        return Promise.resolve()
    },

    async shifDown() {
        let half = nodeList.length >>> 1
        let k = 0
        while (k < half) {
            let child = (k << 1) + 1
            let tVal = nodeList[child].value
            let right_child = child + 1
            if (right_child < nodeList.length) {
                nodeList[child].color = arrList[child].color = 'orange'
                nodeList[right_child].color = arrList[right_child].color = 'orange'
                this.reDraw()
                await this.sleep(timeout_delay)
                if(state === PAUSE){
                    return Promise.resolve()
                }
                nodeList[child].color = nodeList[right_child].color = '#54bd68'
                arrList[child].color = arrList[right_child].color = 'white'
                this.reDraw()
                await this.sleep(timeout_delay)
                if(state === PAUSE){
                    return Promise.resolve()
                }
                if (this.compare(nodeList[right_child].value, tVal) < 0) {
                    tVal = nodeList[child = right_child].value
                }
            }
            nodeList[k].color = nodeList[child].color = 'orange'
            arrList[k].color = arrList[child].color = 'orange'
            this.reDraw()
            await this.sleep(timeout_delay)
            if(state === PAUSE){
                return Promise.resolve()
            }
            if (this.compare(nodeList[k].value, tVal) <= 0) {
                nodeList[k].color = nodeList[child].color = '#54bd68'
                arrList[k].color = arrList[child].color = 'white'
                this.reDraw()
                break
            }
            // 0 nodeList[k].value
            let text = new Text(nodeList[k].x, nodeList[k].y, nodeList[k].value, nodeList[child].x, nodeList[child].y)
            target.push(text)
            // 1 nodeList[child].value
            text = new Text(nodeList[child].x, nodeList[child].y, nodeList[child].value, nodeList[k].x, nodeList[k].y)
            target.push(text)
            let offset = arrList[0].width / 2
            // 2 arrList[k].value
            text = new Text(arrList[k].x + offset, arrList[k].y + offset, arrList[k].value, arrList[child].x + offset, arrList[child].y + offset)
            target.push(text)
            // 3 arrList[child].value
            text = new Text(arrList[child].x + offset, arrList[child].y + offset, arrList[child].value, arrList[k].x + offset, arrList[k].y + offset)
            target.push(text)
            nodeList[k].value = nodeList[child].value = arrList[k].value = arrList[child].value = ''
            await this.move(target)
            if(state === PAUSE){
                return Promise.resolve()
            }
            await this.sleep(timeout_delay)
            if(state === PAUSE){
                return Promise.resolve()
            }

            // 交换位置
            nodeList[child].value = target[0].value
            nodeList[k].value = target[1].value
            arrList[child].value = target[2].value
            arrList[k].value = target[3].value
            nodeList[k].color = nodeList[child].color = '#54bd68'
            arrList[k].color = arrList[child].color = 'white'
            target.length = 0
            this.reDraw()
            if(child < half){
                await this.sleep(timeout_delay)
                if(state === PAUSE){
                    return Promise.resolve()
                }
            }
            k = child
        }
        return Promise.resolve()
    },

    async pushVisual(value) {
        if (index === 30) {
            wx.showToast({
                title: '数组的长度不能大于30, 入队失败',
                icon: 'none',
                duration: 1000
            })
            return Promise.resolve()
        }
        msg = 'Pushing Element: ' + value
        this.drawTipMsg(msg)
        let text = new Text(40 * xs, 25 * xs, value, arrList[index].x + arrList[index].width / 2, arrList[index].y + arrList[index].height / 2)
        text.draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state === PAUSE){
            return Promise.resolve()
        }
        target.push(text)
        await this.move(target)
        if(state === PAUSE){
            return Promise.resolve()
        }
        target.length = 0
        arrList[index].value = value
        let node = null
        if (index === 0) {
            node = new Node(value, index, this.data.canvasWidth / 2, 60 * xs)
            node.draw(this.ctx)
        } else {
            // 父节点的下标
            let pIndex = (index - 1) >>> 1
            // 在父节点的左边
            let layer = nodeList[pIndex].layer + 1
            if (index % 2 == 1) {
                node = new Node(value, index,
                    nodeList[pIndex].x - dis[layer],
                    nodeList[pIndex].y + 40 * xs)
            } else {
                // 在父节点的右边
                node = new Node(value, index,
                    nodeList[pIndex].x + dis[layer],
                    nodeList[pIndex].y + 40 * xs)
            }
            node.layer = layer
            let line = new Line(nodeList[pIndex].x, nodeList[pIndex].y, nodeList[pIndex].x, nodeList[pIndex].y)
            if (nodeList[pIndex].x > node.x) {
                nodeList[pIndex].leftLine = line
            } else {
                nodeList[pIndex].rightLine = line
            }
            await this.lineMove(line, node.x, node.y)
            if(state === PAUSE){
                return Promise.resolve()
            }
            node.draw(this.ctx)
        }
        nodeList.push(node)
        await this.shifUp(index)
        index++
        return Promise.resolve()
    },

    // 向上调整
    async shifUp(index) {
        // target.length一定等于0
        while (index > 0) {
            let parent = (index - 1) >>> 1
            nodeList[parent].color = nodeList[index].color = 'orange'
            arrList[parent].color = arrList[index].color = 'orange'
            this.reDraw()
            await this.sleep(timeout_delay)
            if(state === PAUSE){
                return Promise.resolve()
            }
            if (this.compare(nodeList[parent].value, nodeList[index].value) <= 0) {
                nodeList[parent].color = nodeList[index].color = '#54bd68'
                arrList[parent].color = arrList[index].color = 'white'
                this.reDraw()
                break
            }
            // 0 nodeList[parent].value
            let text = new Text(nodeList[parent].x, nodeList[parent].y, nodeList[parent].value, nodeList[index].x, nodeList[index].y)
            target.push(text)
            // 1 nodeList[index].value
            text = new Text(nodeList[index].x, nodeList[index].y, nodeList[index].value, nodeList[parent].x, nodeList[parent].y)
            target.push(text)
            let offset = arrList[parent].width / 2
            // 2 arrList[parent].value
            text = new Text(arrList[parent].x + offset,
                arrList[parent].y + offset,
                arrList[parent].value,
                arrList[index].x + offset,
                arrList[index].y + offset)
            target.push(text)
            // 3 arrList[index].value
            text = new Text(arrList[index].x + offset,
                arrList[index].y + offset,
                arrList[index].value,
                arrList[parent].x + offset,
                arrList[parent].y + offset)
            target.push(text)
            arrList[index].value = arrList[parent].value = ''
            nodeList[index].value = nodeList[parent].value = ''
            await this.move(target)
            if(state === PAUSE){
                return Promise.resolve()
            }
            await this.sleep(timeout_delay)
            if(state === PAUSE){
                return Promise.resolve()
            }
            nodeList[parent].color = nodeList[index].color = '#54bd68'
            arrList[parent].color = arrList[index].color = 'white'
            this.reDraw()
            if(parent > 0){
                await this.sleep(timeout_delay)
                if(state === PAUSE){
                    return Promise.resolve()
                }
            }
            // 交换两个数的
            nodeList[parent].value = target[1].value
            nodeList[index].value = target[0].value
            arrList[parent].value = target[3].value
            arrList[index].value = target[2].value
            index = parent
            // 将target数组的内容清空
            target.length = 0
        }
        return Promise.resolve()
    },



    async move(target) {
        let security = 0
        let that = this
        return new Promise(resolve => {
            let handlerId = that.canvas.requestAnimationFrame(function render() {
                if (security >= moveSpeed || state === PAUSE) {
                    that.canvas.cancelAnimationFrame(handlerId)
                    resolve()
                    return
                }
                for (let i = 0; i < target.length; i++) {
                    if (target[i].x > target[i].dx) {
                        target[i].x -= target[i].speedx
                        if (target[i].y > target[i].dy) {
                            target[i].y -= target[i].speedy
                        } else {
                            target[i].y += target[i].speedy
                        }

                    } else {
                        target[i].x += target[i].speedx
                        if (target[i].y > target[i].dy) {
                            target[i].y -= target[i].speedy
                        } else {
                            target[i].y += target[i].speedy
                        }
                    }
                }
                security++
                that.reDraw()
                that.canvas.requestAnimationFrame(render)
            })
        })
    },

    lineMove(line, dx, dy) {
        let speedx = Math.abs(line.sx - dx) / moveSpeed
        let speedy = Math.abs(line.sy - dy) / moveSpeed
        if (speedx == 0 && speedy == 0) {
            return Promise.resolve()
        }
        let security = 0
        let that = this
        return new Promise(resolve => {
            let handlerId = that.canvas.requestAnimationFrame(function render() {
                if (security >= moveSpeed || state === PAUSE) {
                    that.canvas.cancelAnimationFrame(handlerId)
                    resolve()
                    return
                }
                if (line.sx > dx) {
                    line.sx -= speedx
                    if (line.sy > dy) {
                        line.sy -= speedy
                    } else {
                        line.sy += speedy
                    }

                } else {
                    line.sx += speedx
                    if (line.sy > dy) {
                        line.sy -= speedy
                    } else {
                        line.sy += speedy
                    }
                }
                security++
                that.reDraw()
                that.canvas.requestAnimationFrame(render)
            })
        })
    },

    reDraw() {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        this.drawTipMsg(msg)
        // 绘制指向关系
        for (let i = 0; i < nodeList.length; i++) {
            if (nodeList[i].leftLine !== null) {
                nodeList[i].leftLine.draw(this.ctx)
            }
            if (nodeList[i].rightLine !== null) {
                nodeList[i].rightLine.draw(this.ctx)
            }
        }
        // 绘制节点对象
        for (let i = 0; i < nodeList.length; i++) {
            nodeList[i].draw(this.ctx)
        }


        // 绘制数组
        for (let i = 0; i < arrList.length; i++) {
            arrList[i].draw(this.ctx)
        }

        // 绘制移动的数字
        for (let i = 0; i < target.length; i++) {
            target[i].draw(this.ctx)
        }
    },


    compare(val1, val2) {
        if (this.data.model === 'min') {
            return val1 - val2
        } else {
            return val2 - val1
        }
    },


    drawTipMsg(msg) {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, 50 * xs)
        this.ctx.beginPath()
        this.ctx.textAlign = 'start'
        this.ctx.fillStyle = 'black'
        this.ctx.font = 'bold ' + 10 * xs + 'px serif'
        this.ctx.fillText(msg, 20 * xs, 10 * xs)
    },


    async peekVisual() {
        if (nodeList.length === 0) {
            wx.showToast({
                title: '优先队列为空！',
                icon: 'none',
                duration: 1000
            })
            return Promise.resolve()
        }
        msg = 'Peeking Element: '
        this.drawTipMsg(msg)
        let text = new Text(nodeList[0].x,
            nodeList[0].y,
            nodeList[0].value,
            40 * xs,
            25 * xs)
        target.push(text)
        await this.move(target)
        target.length = 0
        return Promise.resolve()
    },

    clearVisual() {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        nodeList.length = 0
        target.length = 0
        for(let i = 0; i < arrList.length; i ++){
            arrList[i].value = ''
            arrList[i].color = 'white'
        }
        this.drawRect()
        index = 0
    },


    slowDown() {
        if (this.data.btnBgc[6] === lightgray) {
            return
        }
        if (timeout_delay >= 1000) {
            return
        }
        timeout_delay += 100
        moveSpeed += 10
        this.setData({
            speed: this.data.speed - 100
        })
    },

    speedUp() {
        if (this.data.btnBgc[7] === lightgray) {
            return
        }
        if (timeout_delay <= 100) {
            return
        }
        timeout_delay -= 100
        if (moveSpeed > 30) {
            moveSpeed -= 10
        }

        this.setData({
            speed: this.data.speed + 100
        })

    },

    async modelChange(event) {
        this.setData({
            model: event.detail.value
        })
        this.clearVisual()
    },

    handleInput(event) {
        if (event.detail.value.trim() === '') {
            this.setData({
                inputValue: ''
            })
        } else {
            this.setData({
                inputValue: parseInt(event.detail.value)
            })
        }
    },

    random() {
        if (this.data.btnBgc[1] === lightgray) {
            return
        }
        this.setData({
            inputValue: Math.ceil(Math.random() * 998)
        })
    },

    async sleep(delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, delay);
        })
    }

})