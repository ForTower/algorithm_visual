const app = getApp()
const deviceWidth = app.globalData.width
const xs = deviceWidth / 375
const PAUSE = false,
    PLAY = true
const lightgray = 'rgb(211, 211, 211)'

const table = []
const indexs = []
const printList = []

function Rect(x, y, width, height, value, color) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = color
    this.value = value
    this.next = null
    this.arrow = null
}

Rect.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.strokeStyle = 'black'
    ctx.fillStyle = this.color
    ctx.lineWidth = 1
    ctx.rect(this.x, this.y, this.width, this.height)
    ctx.stroke()
    ctx.fill()
    ctx.moveTo(this.x + 2 / 3 * this.width, this.y)
    ctx.lineTo(this.x + 2 / 3 * this.width, this.y + this.height)
    ctx.stroke()
    ctx.font = 'bold ' + 8 * xs + 'px serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.fillText(this.value, this.x + 1 / 3 * this.width, this.y + this.height / 2)
}

function Arrow(x, y, dx, dy) {
    this.x = x
    this.y = y
    this.dx = dx
    this.dy = dy
}

Arrow.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.dx, this.dy)
    ctx.stroke()
    let flag = this.dx >= this.x ? 1 : 2
    let degree = Math.atan((this.dy - this.y) / (this.dx - this.x))
    ctx.beginPath()
    ctx.moveTo(this.dx, this.dy)
    ctx.lineTo(this.dx + 7 * xs * Math.cos(flag * Math.PI + degree - Math.PI / 180 * 15 * xs),
        this.dy + 7 * xs * Math.sin(flag * Math.PI + degree - Math.PI / 180 * 15 * xs))
    ctx.moveTo(this.dx, this.dy)
    ctx.lineTo(this.dx + 7 * xs * Math.cos(flag * Math.PI + degree + Math.PI / 180 * 15 * xs),
        this.dy + 7 * xs * Math.sin(flag * Math.PI + degree + Math.PI / 180 * 15 * xs))
    ctx.lineTo(this.dx + 7 * xs * Math.cos(flag * Math.PI + degree - Math.PI / 180 * 15 * xs),
        this.dy + 7 * xs * Math.sin(flag * Math.PI + degree - Math.PI / 180 * 15 * xs))
    ctx.fill()
}

function Index(x, y, width, height, index) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.index = index
    this.color = 'white'
}

Index.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)
    ctx.fillStyle = 'red'
    ctx.font = 'bold ' + 10 * xs + 'px serif'
    ctx.textAlign = 'center'
    ctx.fillText(this.index, this.x + this.width / 2, this.y + this.height / 2)
}

function Arc(x, y) {
    this.x = x
    this.y = y
}

Arc.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.strokeStyle = 'green'
    ctx.lineWidth = 2
    ctx.arc(this.x, this.y, 8 * xs, 0, Math.PI * 2)
    ctx.stroke()
}

function Text(x, y, value) {
    this.x = x
    this.y = y
    this.value = value
}
Text.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.font = 'bold ' + 8 * xs + 'px serif'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.fillText(this.value, this.x, this.y)
}

let timeout_delay = 500
let state = PLAY
let msg = ''
let moveSpeed = 50


Page({
    onShow() {
        this.setData({
            canvasWidth: deviceWidth,
            canvasHeight: 500 * xs,
            inputValue: Math.ceil(Math.random() * 998),
            btnBgc: ['white', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue'],
            speed: 600,
            isBin: false
        })

        const query = wx.createSelectorQuery()
        query.select('#linkHashCanvas')
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
                this.fillTable()
                this.drawTable()
            })
            this.initVal()
    },

    onHide(){
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        state = PAUSE
    },

    onUnload(){
        state = PAUSE
    },

    initVal() {
        timeout_delay = 500
        state = PLAY
        msg = ''
        moveSpeed = 50
        printList.length = 0
    },

    fillTable() {
        for (let i = 0; i < 16; i++) {
            table[i] = new Rect(27 * xs, 60 * xs + 20 * xs * i, 25 * xs, 20 * xs, '', 'white')
            indexs[i] = new Index(5 * xs, 60 * xs + 20 * xs * i, 20 * xs, 20 * xs, i)
        }
    },
    // 0表示要打印插入的矩形，1表示只打印msg
    drawTipMsg(msg) {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, 55 * xs)
        this.ctx.beginPath()
        this.ctx.font = 'bold ' + 11 * xs + 'px serif'
        this.ctx.textAlign = 'start'
        this.ctx.fillStyle = 'black'
        this.ctx.fillText(msg, 10 * xs, 10 * xs)
        this.ctx.textAlign = 'center'
        let left = (this.data.canvasWidth - 125 * xs) / 2
        this.ctx.fillText(this.data.inputValue, left + 25 * xs / 2, 30 * xs)
        this.ctx.fillText('%', left + 25 * xs + 25 * xs / 2, 30 * xs)
        this.ctx.fillText(16, left + 50 * xs + 25 * xs / 2, 30 * xs)
        this.ctx.fillText('=', left + 75 * xs + 25 * xs / 2, 30 * xs)
        this.ctx.fillText(this.data.inputValue % 16, left + 100 * xs + 25 * xs / 2, 30 * xs)
    },

    drawTable() {
        for (let i = 0; i < 16; i++) {
            indexs[i].draw(this.ctx)
            let cur = table[i]
            while (cur !== null) {
                cur.draw(this.ctx)
                if (cur.arrow !== null) {
                    cur.arrow.draw(this.ctx)
                }
                cur = cur.next
            }
        }
    },

    insert() {
        this.select(2)
    },

    delete() {
        this.select(3)
    },

    find() {
        this.select(4)
    },

    print() {
        this.select(5)
    },

    clear() {
        this.select(6)
    },

    async select(index) {
        if (this.data.btnBgc[index] === lightgray) {
            return
        }
        if (this.data.inputValue === '' && (index === 2 || index === 3 || index === 4)) {
            wx.showToast({
                title: '输入不能为空',
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
        this.ctx.clearRect(0, 390 * xs, this.data.canvasWidth, this.data.canvasHeight - 390 * xs)
        switch (index) {
            case 2:
                await this.insertVisual(this.data.inputValue)
                this.setData({
                    inputValue: Math.ceil(Math.random() * 998)
                })
                break
            case 3:
                await this.deleteVisual(this.data.inputValue)
                break
            case 4:
                await this.findVisual(this.data.inputValue)
                break
            case 5:
                await this.printVisual()
                break
            case 6:
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

    async deleteVisual(value) {
        msg = 'Deleting Element: ' + value
        this.drawTipMsg(msg)
        let rect = new Rect(60 * xs, 25 * xs, 25 * xs, 18 * xs, value, 'white')
        let left = (this.data.canvasWidth - 125 * xs) / 2
        let arc = new Arc(left + 100 * xs + 25 * xs / 2, 30 * xs)
        let r = value % 16
        arc.draw(this.ctx)
        rect.draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state === PAUSE){
            return Promise.resolve()
        }
        await this.move(arc, indexs[r].x + indexs[r].width / 2, indexs[r].y + indexs[r].height / 2, rect, 0, null)
        await this.sleep(timeout_delay)
        if(state === PAUSE){
            return Promise.resolve()
        }
        let cur = table[r].next
        let pre = table[r]
        while (cur !== null) {
            rect.color = 'orange'
            cur.color = 'orange'
            cur.draw(this.ctx)
            rect.draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state === PAUSE){
                return Promise.resolve()
            }
            rect.color = 'white'
            cur.color = 'white'
            rect.draw(this.ctx)
            cur.draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state === PAUSE){
                return Promise.resolve()
            }
            if (cur.value === rect.value) {
                if (cur.next !== null) {
                    pre.arrow.dx = cur.next.x
                    pre.arrow.dy = cur.next.y + cur.next.height / 2
                    cur.arrow = null
                    this.reDraw(rect)
                    pre.next = cur.next
                    cur.next = null
                    await this.move(pre.next, cur.x, cur.y, rect, 3, pre)
                } else {
                    pre.next = null
                    pre.arrow = null
                    msg = 'Deleted Element: ' + value
                    this.reDraw(null)
                }
                return Promise.resolve()
            }
            pre = cur
            cur = cur.next
        }
        msg = 'Element ' + value + ' Not Found, Delete Failed'
        this.reDraw(rect)
        return Promise.resolve()
    },

    async printVisual() {
        printList.length = 0
        msg = '正在打印哈希表'
        this.drawPrint(msg)
        let cur = null
        for (let i = 0; i < 16; i++) {
            indexs[i].color = '#54bd68'
            indexs[i].draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state === PAUSE){
                return Promise.resolve()
            }
            cur = table[i].next
            while (cur !== null) {
                cur.color = '#54bd68'
                let text = new Text(cur.x + cur.width / 3, cur.y + cur.height / 2, cur.value)
                let top = 420 * xs + Math.floor(printList.length / 17) * 15 * xs
                let left = 15 * xs + printList.length % 17 * 20 * xs
                await this.move(text, left, top, null, 2, null)
                printList.push(text)
                cur.color = 'white'
                cur.draw(this.ctx)
                cur = cur.next
            }
            indexs[i].color = 'white'
            indexs[i].draw(this.ctx)
        }
        msg = '打印完成'
        this.ctx.clearRect(0, 0, this.data.canvasWidth, 55 * xs)
        this.ctx.beginPath()
        this.ctx.font = 'bold ' + 11 * xs + 'px serif'
        this.ctx.textAlign = 'start'
        this.ctx.fillStyle = 'black'
        this.ctx.fillText(msg, 10 * xs, 10 * xs)
        return Promise.resolve()
    },

    drawPrint(msg) {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        this.drawTable()
        this.ctx.beginPath()
        this.ctx.font = 'bold ' + 11 * xs + 'px serif'
        this.ctx.textAlign = 'start'
        this.ctx.fillStyle = 'black'
        this.ctx.fillText(msg, 10 * xs, 10 * xs)
        this.ctx.fillText('Print:', 10 * xs, 400 * xs)
        for (let i = 0; i < printList.length; i++) {
            printList[i].draw(this.ctx)
        }
    },

    clearVisual() {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        for (let i = 0; i < 16; i++) {
            table[i].next = null
            table[i].arrow = null
        }
        this.drawTable()
    },

    async findVisual(value) {
        msg = 'Finding Element: ' + value
        this.drawTipMsg(msg)
        let left = (this.data.canvasWidth - 125 * xs) / 2
        let arc = new Arc(left + 100 * xs + 25 * xs / 2, 30 * xs)
        arc.draw(this.ctx)
        let r = value % 16
        await this.move(arc, indexs[r].x + indexs[r].width / 2, indexs[r].y + indexs[r].height / 2, null, 0, null)
        await this.sleep(timeout_delay)
        if(state === PAUSE){
            return Promise.resolve()
        }
        let cur = table[r].next
        while (cur !== null) {
            cur.color = 'orange'
            this.reDraw(null)
            await this.sleep(timeout_delay)
            if(state === PAUSE){
                return Promise.resolve()
            }
            cur.color = 'white'
            this.reDraw(null)
            await this.sleep(timeout_delay)
            if(state === PAUSE){
                return Promise.resolve()
            }
            if (cur.value === value) {
                msg = 'Finding Element: ' + value + ' Found!'
                this.drawTipMsg(msg)
                return Promise.resolve()
            }
            cur = cur.next
        }
        if (table[r].next === null) {
            this.reDraw(null)
        }
        msg = 'Finding Element: ' + value + ' Not Found!'
        this.drawTipMsg(msg)
        return Promise.resolve()
    },

    async insertVisual(value) {
        msg = 'Inserting: ' + value
        this.drawTipMsg(msg)
        let rect = new Rect(60 * xs, 25 * xs, 25 * xs, 18 * xs, value, 'white')
        let left = (this.data.canvasWidth - 125 * xs) / 2
        let arc = new Arc(left + 100 * xs + 25 * xs / 2, 30 * xs)
        let r = value % 16
        arc.draw(this.ctx)
        rect.draw(this.ctx)
        await this.sleep(timeout_delay)
        if(state === PAUSE){
            return Promise.resolve()
        }
        await this.move(arc, indexs[r].x + indexs[r].width / 2, indexs[r].y + indexs[r].height / 2, rect, 0, null)
        await this.sleep(timeout_delay)
        if(state === PAUSE){
            return Promise.resolve()
        }
        let cur = table[r]
        let len = 0
        while (cur.next !== null) {
            len++
            cur = cur.next
            cur.color = 'orange'
            rect.color = 'orange'
            this.reDraw(rect)
            await this.sleep(timeout_delay)
            if(state === PAUSE){
                return Promise.resolve()
            }
            cur.color = 'white'
            rect.color = 'white'
            this.reDraw(rect)
            await this.sleep(timeout_delay)
            if(state === PAUSE){
                return Promise.resolve()
            }
            if (cur.value === rect.value) {
                msg = value + ' 已存在，插入失败'
                this.drawTipMsg(msg)
                return Promise.resolve()
            }
        }
        if (len === 8) {
            msg = '链表的长度不能大于8，插入失败'
            this.drawTipMsg(msg)
            return Promise.resolve()
        }
        cur.arrow = new Arrow(cur.x + cur.width * 5 / 6, cur.y + cur.height / 2,
            rect.x, rect.y + rect.height / 2)
        cur.next = rect
        await this.move(rect, cur.x + 35 * xs, table[r].y + 1 * xs, null, 1, cur)

        msg = 'Inserted: ' + value
        this.drawTipMsg(msg)
        return Promise.resolve()
    },

    async move(target, dx, dy, rect, type = 0, cur = null) {
        let speedx = Math.abs(target.x - dx) / moveSpeed
        let speedy = Math.abs(target.y - dy) / moveSpeed
        let ax = target.x,
            ay = target.y
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
                security++

                // 圆环或文字的移动
                if (type === 0) {
                    that.reDraw(rect)
                    target.draw(that.ctx)
                }
                // 插入矩形的移动
                else if (type === 1) {
                    cur.arrow.dx = target.x
                    cur.arrow.dy = target.y + target.height / 2
                    that.reDraw(rect)
                } else if (type === 2) {
                    // 文字的移动
                    that.drawPrint(msg)
                    target.draw(that.ctx)
                } else {
                    // 删除过程中的移动
                    cur.arrow.dx = target.x
                    cur.arrow.dy = target.y + target.height / 2
                    let n = target.next
                    let pre = target
                    while (n !== null) {
                        n.x = 35 * xs + pre.x
                        pre = n
                        n = n.next
                    }
                    // 设置箭头的位置
                    n = target
                    while (n !== null) {
                        if (n.arrow !== null) {
                            n.arrow.x = n.x + n.width * 5 / 6
                            n.arrow.dx = n.next.x
                        }
                        n = n.next
                    }
                    // 重新绘制
                    that.reDraw(rect)
                }
                that.canvas.requestAnimationFrame(render)
            })
        })
    },

    reDraw(rect) {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        this.drawTipMsg(msg)
        this.drawTable()
        if (rect !== null) {
            rect.draw(this.ctx)
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

    async sleep(delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, delay)
        })
    },

    slowDown() {
        if (this.data.btnBgc[7] === lightgray) {
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
        if (this.data.btnBgc[8] === lightgray) {
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
    }

})