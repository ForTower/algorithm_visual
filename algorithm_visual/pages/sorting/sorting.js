var app = getApp()
const deviceWidth = app.globalData.width
const xs = deviceWidth / 375

let sort = 0
let isPlay = true //异步程序是否正在执行中，false表示停止异步程序的执行
let isSort = false //是否正在排序 false表示没有正在排序
let lock = true
let originalArray = [113, 8, 145, 42, 106, 56, 64, 98, 88, 124]
let start = 0
let timeout_delay = 500
const space = 5 * xs
const width = 25 * xs
const increasement = 30 * xs
// 基数排序需要用到
let bucketStart = 0
let rectArray = []
let buckArray = []
//堆排序需要用到
let indexArray = []
let arcArray = []
let lineArray = []

// 快速排序需要用到
let rectangeArray = []

let scr = new Array(4)
for (let i = 0; i < scr.length; i++) {
    scr[i] = new Array(10)
    for (let j = 0; j < scr[0].length; j++) {
        scr[i][j] = 0
    }
}

function Arc(x, y, radius, num, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.num = num
    this.color = color
}
Arc.prototype.drawArc = function (ctx) {
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = 'black'
    ctx.font = 'bold ' + 12 * xs + 'px serif'
    ctx.fillText(this.num, this.x, this.y)
}
Arc.prototype.flashArc = function (ctx) {
    this.drawArc(ctx)
}

function Index(x, y, index) {
    this.x = x
    this.y = y
    this.index = index
}
Index.prototype.drawIndex = function (ctx) {
    ctx.beginPath()
    ctx.fillStyle = 'red'
    ctx.font = 'bold ' + 12 * xs + 'px serif'
    ctx.fillText(this.index, this.x, this.y)
}
Index.prototype.flashIndex = function (ctx) {
    this.drawIndex(ctx)
}

function Line(x, y, dx, dy) {
    this.x = x
    this.y = y
    this.dx = dx
    this.dy = dy
}
Line.prototype.drawLine = function (ctx) {
    ctx.beginPath()
    ctx.strokeStyle = 'black'
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.dx, this.dy)
    ctx.stroke()
}
Line.prototype.flashLine = function (ctx) {
    this.drawLine(ctx)
}



// 使用面向对象的方法编写基数排序会更好些
function Bucket(x, y, num) {
    this.x = x
    this.y = y
    this.num = num
    this.dx = x
    this.dy = 350 * xs
    this.items = []
}
Bucket.prototype.drawBucket = function (ctx) {
    ctx.beginPath()
    ctx.fillStyle = 'black'
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x + 30 * xs, this.y)
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.fillText(this.num, this.x + 15 * xs, this.y + 10 * xs)
}
Bucket.prototype.flashBucket = function (ctx) {
    this.drawBucket(ctx)
}

function Rect(x, y, num, flag) {
    this.x = x
    this.y = y
    this.num = num
    this.flag = flag
}

Rect.prototype.drawRect = function (ctx) {
    ctx.beginPath()
    ctx.fillStyle = 'black'
    ctx.rect(this.x, this.y, 30 * xs, 20 * xs)
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = 'bold ' + 12 * xs + 'px serif'
    let num = this.num
    for (let i = 2; i >= 0; i--) {
        let r = num % 10
        if (this.flag == 2 - i + 1) {
            ctx.fillStyle = 'red'
        } else {
            ctx.fillStyle = 'black'
        }
        ctx.fillText(r, this.x + 10 * i * xs + 5 * xs, this.y + 10 * xs)
        num = Math.floor(num / 10)
    }
}

Rect.prototype.flashRect = function (ctx) {
    this.drawRect(ctx)
}


// 快速排序需要用到
function Rectange(x, y, width, num, color) {
    this.x = x
    this.y = y
    this.width = width
    this.height = num * xs
    this.num = num
    this.color = color
}
Rectange.prototype.drawRectange = function (ctx) {
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.font = 'bold ' + 12 * xs + 'px serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.num, this.x + this.width / 2, this.y + (this.num - 5) * xs)
}

Rectange.prototype.flashRectange = function (ctx) {
    this.drawRectange(ctx)
}


Page({
    onHide() {
        isPlay = false
        lock = true
    },

    onUnload() {
        lock = true
        isPlay = false
    },

    onShow() {
        this.setData({
            inputTxt: '113, 8, 145, 42, 106, 56, 64, 98, 88, 124',
            nums: [113, 8, 145, 42, 106, 56, 64, 98, 88, 124],
            backgroundColor: ['green', 'gray', 'gray', 'gray', 'gray', 'gray', 'gray', 'gray'],
            sortType: ['冒泡', '选择', '插入', '希尔', '归并', '快速', '堆排', '基数'],
            canvasHeight: 400 * xs,
            canvasWidth: deviceWidth,
            tip: false,
            speed: 600
        })
        isPlay = true
        isSort = false
        let backgroundColor = this.data.backgroundColor
        backgroundColor[sort] = 'gray'
        backgroundColor[0] = 'green'
        sort = 0
        this.setData({
            backgroundColor
        })
        originalArray = this.data.nums.slice()
        timeout_delay = 500
        let query = wx.createSelectorQuery()
        query
            .select('#sortCanvas')
            .fields({
                node: true,
                size: true
            })
            .exec(res => {
                this.canvas = res[0].node
                this.ctx = this.canvas.getContext('2d')
                const dpr = wx.getSystemInfoSync().pixelRatio
                this.canvas.width = res[0].width * dpr
                this.canvas.height = res[0].height * dpr
                this.ctx.scale(dpr, dpr)
                this.ctx.font = 'bold ' + 12 * xs + 'px serif'
                this.ctx.textBaseline = 'middle'
                this.initCanvas()
            })
    },



    onLoad() {},

    initCanvas() {
        let nums = this.data.nums
        start = (deviceWidth- nums.length * increasement + 5 * xs) / 2
        bucketStart = (deviceWidth - 345 * xs) / 2
        this.draw()
    },

    draw() {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        let nums = this.data.nums
        for (let i = 0; i < nums.length; i++) {
            this.drawRect(this.ctx,
                start + i * increasement,
                this.data.canvasHeight / 2 - nums[i] * xs,
                nums[i],
                "rgb(205, 227, 234)")
        }
    },


    drawRect(ctx, x, y, num, color) {
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.fillRect(x, y, width, num * xs)
        ctx.fillStyle = 'black'
        ctx.textAlign = 'center'
        ctx.font = 'bold '+ 12 * xs + 'px serif'
        ctx.fillText(num, x + width / 2, y + (num - 5) * xs)
    },

    async random() {
        let len = Math.ceil(Math.random() * 10)
        let nums = []
        for (let i = 0; i < len; i++) {
            nums.push(Math.ceil(Math.random() * 150))
        }
        this.setData({
            inputTxt: nums.join(', '),
            nums,
            tip: false
        })

        originalArray = nums.slice()
        this.activate(sort)
    },

    async sort() {
        if (isSort) {
            return
        }
        await this.unLock()
        lock = false
        isSort = true
        isPlay = true
        switch (sort) {
            case 0:
                this.bubbleSort()
                break
            case 1:
                this.selectSort()
                break
            case 2:
                this.insertSort()
                break
            case 3:
                this.shellSort()
                break
            case 4:
                this.mergeSort()
                break
            case 5:
                this.quickSort()
                break
            case 6:
                this.heapSort()
                break
            case 7:
                this.radixSort()
                break
        }
    },
    reStart() {
        this.activate(sort)
    },

    async unLock() {
        let security = 0
        return new Promise(resolve => {
            let timer = setInterval(() => {
                if (lock || security == 50) {
                    clearInterval(timer)
                    resolve()
                    return
                }
                security++
            }, 20)
        })
    },

    async activate(type) {
        isPlay = false
        isSort = false
        await this.sleep(20)
        this.setData({
            nums: originalArray.slice()
        })
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        // 基数排序
        if (type == 7) {
            // 重新设置start
            start = (this.data.canvasWidth - this.data.nums.length * 35 * xs + 5 * xs) / 2
            this.fillBuckArrayAndDraw()
            this.fillRectArrayAndDraw()
        } else if (type == 6) {
            // 堆排序
            this.prepare()
        } else if (type == 5 || type == 4) {
            // 快速排序，归并排序
            start = (this.data.canvasWidth - this.data.nums.length * increasement + 5 * xs) / 2
            this.fillRectangeArrayAndDraw()
        } else {
            // 冒泡，选择，插入，希尔
            start = (this.data.canvasWidth - this.data.nums.length * increasement + 5 * xs) / 2
            this.draw()
        }
    },

    nodeSetColor(ctx, arc) {
        arc.flashArc(ctx)
    },

    setScreen() {
        this.middlePrint(0, 0, 0, this.data.nums)
    },

    middlePrint(startx, y, curIndex, nums) {
        if (curIndex >= nums.length) {
            return startx
        }
        let endx = this.middlePrint(startx, y + 1, curIndex * 2 + 1, nums)
        scr[y][endx] = nums[curIndex]
        return this.middlePrint(endx + 1, y + 1, curIndex * 2 + 2, nums)
    },

    prepare() {
        this.resetScr()
        this.setScr()
        start = this.getStart()
        this.fillLineArrayAndDraw()
        this.fillArcArrayAndDraw()
        this.fillIndexArrayAndDraw()
    },

    setScr() {
        this.middlePrint(0, 0, 0, this.data.nums)
    },

    middlePrint(startx, y, curIndex, nums) {
        if (curIndex >= nums.length) {
            return startx
        }
        let endx = this.middlePrint(startx, y + 1, curIndex * 2 + 1, nums)
        scr[y][endx] = nums[curIndex]
        return this.middlePrint(endx + 1, y + 1, curIndex * 2 + 2, nums)
    },

    resetScr() {
        for (let i = 0; i < scr.length; i++) {
            for (let j = 0; j < scr[0].length; j++) {
                scr[i][j] = 0
            }
        }
    },

    // 为了让堆排序的这棵树能居中
    getStart() {
        let first = 100,
            end = -1
        for (let i = 0; i < scr.length; i++) {
            for (let j = 0; j < scr[0].length; j++) {
                if (scr[i][j] != 0) {
                    first = Math.min(first, j)
                    end = Math.max(end, j)
                }
            }
        }
        let res = (this.data.canvasWidth - (end - first) * 35 * xs) / 2
        return res
    },

    fillArcArrayAndDraw() {
        arcArray.length = 0
        let marginTop = 130 * xs
        for (let i = 0; i < scr.length; i++) {
            for (let j = 0; j < scr[0].length; j++) {
                if (scr[i][j] != 0) {
                    let arc = new Arc(start + j * 35 * xs, marginTop + i * 35 * xs, 15 * xs, scr[i][j], "rgb(205, 227, 234)")
                    arc.flashArc(this.ctx)
                    arcArray.push(arc)
                }
            }
        }
    },

    fillIndexArrayAndDraw() {
        indexArray.length = 0
        for (let i = 0; i < arcArray.length; i++) {
            let arc = arcArray[i]
            let indexObj = new Index(arc.x, arc.y + 23 * xs, i)
            indexObj.flashIndex(this.ctx)
            indexArray.push(indexObj)
        }
    },

    fillLineArrayAndDraw() {
        lineArray.length = 0
        let marginTop = 130 * xs
        for (let i = 0; i < scr.length; i++) {
            let pos = 0
            for (let j = 0; j < scr[0].length; j++) {
                let count = 0
                if (scr[i][j] == 0) continue
                for (let k = pos; k < scr[0].length && i < scr.length - 1; k++) {
                    if (scr[i + 1][k] == 0) continue
                    if (count == 2) break
                    let line = new Line(start + j * 35 * xs, marginTop + i * 35 * xs, start + k * 35 * xs, marginTop + (i + 1) * 35 * xs)
                    line.flashLine(this.ctx)
                    lineArray.push(line)
                    count++
                    pos = k + 1
                }
            }
        }
    },

    // 基数排序：用来填充buckArray和rectArray并绘制
    fillBuckArrayAndDraw() {
        buckArray.length = 0
        for (let i = 0; i < 10; i++) {
            let x = bucketStart + i * 35 * xs
            let bucket = new Bucket(x, 380 * xs, i)
            bucket.flashBucket(this.ctx)
            buckArray.push(bucket)
        }
    },

    fillRectArrayAndDraw() {
        let nums = this.data.nums
        Rect.prototype.dx = start
        Rect.prototype.dy = 10 * xs
        rectArray.length = 0
        for (let i = 0; i < nums.length; i++) {
            let x = start + i * 35 * xs
            let rect = new Rect(x, 10 * xs, nums[i], 0)
            rect.flashRect(this.ctx)
            rectArray.push(rect)
        }
    },



    async bubbleSort() {
        let nums = this.data.nums
        let halfHei = this.data.canvasHeight / 2
        let ctx = this.ctx
        await this.sleep(200)
        for (let i = 0; i < nums.length - 1; i++) {
            if (!isPlay) {
                lock = true
                return
            }
            let done = true
            for (let j = 0; j < nums.length - i - 1; j++) {
                if (!isPlay) {
                    lock = true
                    return
                }
                this.setColor(ctx,
                    start + j * increasement,
                    halfHei - nums[j] * xs,
                    nums[j],
                    'green')

                this.setColor(ctx,
                    start + (j + 1) * increasement,
                    halfHei - nums[j + 1] * xs,
                    nums[j + 1],
                    'green')
                await this.sleep(timeout_delay)
                if (!isPlay) {
                    lock = true
                    return
                }
                if (nums[j] > nums[j + 1]) {
                    await this.swapVal(ctx, j, j + 1, nums[j], nums[j + 1], 'green', halfHei - nums[j + 1] * xs)
                    await this.sleep(200)
                    if (!isPlay) {
                        lock = true
                        return
                    }
                    done = false
                    let tmp = nums[j]
                    nums[j] = nums[j + 1]
                    nums[j + 1] = tmp
                }
                this.setColor(ctx,
                    start + j * increasement,
                    halfHei - nums[j] * xs,
                    nums[j],
                    "rgb(205, 227, 234)")

                this.setColor(ctx,
                    start + (j + 1) * increasement,
                    halfHei - nums[j + 1] * xs,
                    nums[j + 1],
                    "rgb(205, 227, 234)")
                await this.sleep(timeout_delay)
                if (!isPlay) {
                    lock = true
                    return
                }
            }
            if (done) {
                break
            }
            this.setColor(ctx,
                start + increasement * (nums.length - i - 1),
                halfHei - nums[nums.length - i - 1] * xs,
                nums[nums.length - i - 1],
                'orange')
            await this.sleep(timeout_delay)
        }
        if (!isPlay) {
            lock = true
            return
        }
        this.setData({
            nums
        })
        lock = true
        this.draw()
    },

    setColor(ctx, x, y, num, color) {
        ctx.clearRect(x - 2 * xs, 0, width + 4 * xs, this.data.canvasHeight)
        this.drawRect(ctx, x, y, num, color)
    },

    async swapVal(ctx, i, j, numi, numj, color, jy) {
        let halfHei = this.data.canvasHeight / 2
        let nums = this.data.nums
        let x1 = start + i * increasement
        let y1 = halfHei - nums[i] * xs
        let x2 = start + j * increasement
        let y2 = jy
        let speed = 0
        let move = (x2 - x1) / 25
        let that = this
        let s = 0
        return new Promise(resolve => {
            let handleId = that.canvas.requestAnimationFrame(function render() {
                if (s > 25 || !isPlay) {
                    that.canvas.cancelAnimationFrame(handleId)
                    resolve()
                    return
                } else {
                    ctx.clearRect(x1 - 2 * xs, 0, width + 4 * xs + x2 - x1, that.data.canvasHeight)
                    for (let run = i + 1; run < j; run++) {
                        that.drawRect(ctx, start + increasement * run, halfHei - nums[run] * xs, nums[run], "rgb(205, 227, 234)")
                    }
                    that.drawRect(ctx, x1 + speed, y1, numi, color)
                    that.drawRect(ctx, x2 - speed, y2, numj, color)
                    speed = speed + move
                    s ++
                    that.canvas.requestAnimationFrame(render)
                }
            })
        })
    },

    reNums(event) {
        let numStr = event.detail.value
        let res = this.check(numStr)
        if (res == false) {
            this.setData({
                tip: true
            })
            return
        }
        this.setData({
            inputTxt: numStr
        })

        this.activate(sort)
    },

    check(numStr) {
        for (let i = 0; i < numStr.length; i++) {
            if (numStr.charAt(i) == '，') {
                numStr = numStr.replace('，', ',')
            }
        }
        let lastC = numStr.charAt(numStr.length - 1)
        if (lastC == ',') {
            numStr = numStr.substring(0, numStr.length - 1)
        }
        for (let i = 0; i < numStr.length; i++) {
            if (!((numStr.charAt(i) >= '0' && numStr.charAt(i) <= '9') ||
                    numStr.charAt(i) == ',' ||
                    numStr.charAt(i) == ' ')) {
                return false
            }
        }

        let tmpNums = numStr.trim().split(',')
        if (tmpNums.length > 10) {
            return false
        }
        let nums = []
        for (let i = 0; i < tmpNums.length; i++) {
            if (!(parseInt(tmpNums[i]) <= 150 &&
                    parseInt(tmpNums[i]) > 0)) {
                return false
            }
            nums.push(parseInt(tmpNums[i]))
        }

        this.setData({
            nums,
            tip: false
        })
        originalArray = nums.slice()
        return true
    },

    async selectSort() {
        let nums = this.data.nums
        let halfHei = this.data.canvasHeight / 2
        let ctx = this.ctx
        await this.sleep(200)
        for (let i = 0; i < nums.length; i++) {
            if (!isPlay) {
                lock = true
                return
            }
            let index = i
            let minValue = nums[i]
            this.setColor(ctx,
                start + i * increasement,
                halfHei - nums[i] * xs,
                nums[i],
                'red')
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return
            }
            for (let j = i + 1; j < nums.length; j++) {
                this.setColor(ctx,
                    start + j * increasement,
                    halfHei - nums[j] * xs,
                    nums[j],
                    'green')
                await this.sleep(timeout_delay)
                if (!isPlay) {
                    lock = true
                    return
                }
                if (nums[j] < minValue) {
                    this.setColor(ctx,
                        start + index * increasement,
                        halfHei - nums[index] * xs,
                        nums[index],
                        'rgb(205, 227, 234)')
                    this.setColor(ctx,
                        start + j * increasement,
                        halfHei - nums[j] * xs,
                        nums[j],
                        'red')
                    minValue = nums[j]
                    index = j
                }
                if (j != index) {
                    this.setColor(ctx,
                        start + j * increasement,
                        halfHei - nums[j] * xs,
                        nums[j],
                        'rgb(205, 227, 234)')
                }
            }
            this.setColor(ctx,
                start + i * increasement,
                halfHei - nums[i] * xs,
                nums[i],
                'red')
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return
            }

            if (i != index) {
                await this.swapVal(ctx, i, index, nums[i], nums[index], 'red', halfHei - nums[index] * xs)
                await this.sleep(200)
                if (!isPlay) {
                    lock = true
                    return
                }
            }
            let tmp = nums[i]
            nums[i] = minValue
            nums[index] = tmp
            this.setData({
                nums
            })
            this.setColor(ctx,
                start + increasement * index,
                halfHei - nums[index] * xs,
                nums[index],
                'rgb(205, 227, 234)')

            this.setColor(ctx,
                start + increasement * i,
                halfHei - nums[i] * xs,
                nums[i],
                'orange')
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return
            }
        }

        if (!isPlay) {
            lock = true
            return
        }

        this.setData({
            nums
        })
        this.draw()
        lock = true

    },

    async insertSort() {
        let nums = this.data.nums
        let halfHei = this.data.canvasHeight / 2
        let ctx = this.ctx
        await this.sleep(200)
        if (!isPlay) {
            lock = true
            return
        }
        this.setColor(ctx,
            start,
            halfHei - nums[0] * xs,
            nums[0],
            'orange')
        for (let i = 1; i < nums.length; i++) {
            if (!isPlay) {
                lock = true
                return
            }
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return
            }
            await this.goDown(ctx,
                start + i * increasement,
                halfHei - nums[i] * xs,
                nums[i],
                'red')

            await this.sleep(100)
            if (!isPlay) {
                lock = true
                return
            }
            let tmp = nums[i]
            let j = i

            while (j > 0) {
                this.setColor(ctx,
                    start + (j - 1) * increasement,
                    halfHei - nums[j - 1] * xs,
                    nums[j - 1],
                    'green')
                await this.sleep(timeout_delay)
                if (!isPlay) {
                    lock = true
                    return
                }
                if (tmp >= nums[j - 1]) {
                    break;
                }
                await this.swapVal(ctx, j - 1, j, nums[j - 1], tmp, 'red', (380 - tmp) * xs)
                await this.sleep(200)
                if (!isPlay) {
                    lock = true
                    return
                }
                nums[j] = nums[j - 1]
                // 交换完成，变颜色，()
                this.setColor(ctx,
                    start + j * increasement,
                    halfHei - nums[j] * xs,
                    nums[j],
                    'orange')

                j--
            }
            //找到了插入的位置
            // await this.sleep(DELAY)
            nums[j] = tmp
            await this.goUp(ctx,
                start + j * increasement,
                (380 - nums[j]) * xs,
                nums[j],
                'red')
            await this.sleep(100)
            if (!isPlay) {
                lock = true
                return
            }
            this.setColor(ctx,
                start + j * increasement,
                halfHei - nums[j] * xs,
                nums[j],
                'orange')
            if (j != 0) {
                this.setColor(ctx,
                    start + (j - 1) * increasement,
                    halfHei - nums[j - 1] * xs,
                    nums[j - 1],
                    'orange')
            }
        }
        this.setData({
            nums
        })
        lock = true
        this.draw()
    },

    async goDown(ctx, x, y, num, color) {
        await this.move(ctx, x, y, num, color, true)
        return Promise.resolve()
    },

    async goUp(ctx, x, y, num, color) {
        await this.move(ctx, x, y, num, color, false)
        return Promise.resolve()
    },


    // destination 为true：向下，为false，向上
    async move(ctx, x, y, num, color, dest) {
        // 清除num元素所在占领的区域
        // let downSpeed = destination
        let speed = 0
        let step = 5 * xs
        let s = 0
        let that = this
        return new Promise(resolve => {
            let handleId = that.canvas.requestAnimationFrame(function render() {
                if (s > 36 || !isPlay) {
                    that.canvas.cancelAnimationFrame(handleId)
                    resolve()
                    return
                } else {
                    ctx.clearRect(x - 2 * xs, 0, 4 * xs + width, that.data.canvasHeight)
                    that.drawRect(ctx, x, y + speed, num, color)
                    if (dest) {
                        speed += step
                    } else {
                        speed -= step
                    }
                    s ++
                    that.canvas.requestAnimationFrame(render)
                }
            })
        })
    },

    async shellSort() {
        let nums = this.data.nums
        let halfHei = this.data.canvasHeight / 2
        let step = Math.floor(nums.length / 2)
        let ctx = this.ctx
        await this.sleep(200)
        if (!isPlay) {
            lock = true
            return
        }
        while (step != 0) {
            if (!isPlay) {
                lock = true
                return
            }
            for (let i = step; i < nums.length; i++) {
                if (!isPlay) {
                    lock = true
                    return
                }
                await this.goDown(ctx,
                    start + i * increasement,
                    halfHei - nums[i] * xs,
                    nums[i],
                    'red')
                await this.sleep(100)
                if (!isPlay) {
                    lock = true
                    return
                }
                let j = i
                let tmp = nums[j]
                while (j - step >= 0) {
                    this.setColor(ctx,
                        start + (j - step) * increasement,
                        halfHei - nums[j - step] * xs,
                        nums[j - step],
                        'green')
                    await this.sleep(timeout_delay)
                    if (!isPlay) {
                        lock = true
                        return
                    }
                    // 变红色，表示当前值要和当前组前面有序的值进行比较
                    // this.setColor(ctx, start + j * INCREASEMENT, binCanvasHeight - nums[j] * MULTIPLE, nums[j], this.data.red)
                    // 当前值向下移动
                    // await this
                    if (tmp >= nums[j - step]) {
                        break
                    }

                    await this.swapVal(ctx, j - step, j, nums[j - step], tmp, 'red', (380 - tmp) * xs)
                    await this.sleep(200)
                    if (!isPlay) {
                        lock = true
                        return
                    }
                    nums[j] = nums[j - step]
                    this.setColor(ctx,
                        start + j * increasement,
                        halfHei - nums[j] * xs,
                        nums[j],
                        'rgb(205, 227, 234)')
                    j -= step
                }
                nums[j] = tmp
                // 找到了插入的位置
                await this.goUp(ctx, start + j * increasement, (380 - nums[j]) * xs, nums[j], 'red')
                await this.sleep(100)
                if (!isPlay) {
                    lock = true
                    return
                }
                this.setColor(ctx,
                    start + j * increasement,
                    halfHei - nums[j] * xs,
                    nums[j],
                    'rgb(205, 227, 234)')
                if (j - step >= 0) {
                    this.setColor(ctx,
                        start + (j - step) * increasement,
                        halfHei - nums[j - step] * xs,
                        nums[j - step], 'rgb(205, 227, 234)')
                }
                await this.sleep(timeout_delay)
            }
            step = Math.floor(step / 2)
        }
        lock = true

    },

    async mergeSort() {
        this.mergeSort2(rectangeArray, 0, rectangeArray.length - 1)
    },

    async mergeSort2(array, low, high) {
        if (low == high) {
            this.rectangeSetColor(array[low], 'yellow')
            return Promise.resolve()
        }
        if (!isPlay) {
            lock = true
            return Promise.resolve()
        }
        let mid = Math.floor((low + high) / 2)
        this.rectangeSetColor(array[mid], 'yellow')
        await this.sleep(timeout_delay)
        if (!isPlay) {
            lock = true
            return Promise.resolve()
        }
        await this.mergeSort2(array, low, mid)
        if (!isPlay) {
            lock = true
            return Promise.resolve()
        }
        await this.mergeSort2(array, mid + 1, high)
        if (!isPlay) {
            lock = true
            return Promise.resolve()
        }
        let auxiliary = new Array(array.length)
        let L = low,
            R = mid + 1,
            index = 0
        for (let i = L; i <= mid; i++) {
            this.rectangeSetColor(array[i], 'orange')
        }
        for (let i = R; i <= high; i++) {
            this.rectangeSetColor(array[i], 'pink')
        }
        while (L <= mid && R <= high) {
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return Promise.resolve()
            }
            let dx = start + (index + low) * increasement
            let dy = 0
            if (array[L].num < array[R].num) {
                auxiliary[index] = array[L]
                dy = 380 * xs - array[L].height
                await this.rectangeSwapVisual(this.ctx, array[L], dx, dy, null, 2)
                if (!isPlay) {
                    lock = true
                    return Promise.resolve()
                }
                L++
            } else {
                auxiliary[index] = array[R]
                dy = 380 * xs - array[R].height
                await this.rectangeSwapVisual(this.ctx, array[R], dx, dy, null, 2)
                if (!isPlay) {
                    lock = true
                    return Promise.resolve()
                }
                R++
            }
            index++

        }
        while (L <= mid) {
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return Promise.resolve()
            }
            auxiliary[index] = array[L]
            let dx = start + (index + low) * increasement
            let dy = 380 * xs - array[L].height
            await this.rectangeSwapVisual(this.ctx, array[L], dx, dy, null, 2)
            if (!isPlay) {
                lock = true
                return Promise.resolve()
            }
            index++
            L++
        }
        while (R <= high) {
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return Promise.resolve()
            }
            let dx = start + (index + low) * increasement
            let dy = 380 * xs - array[R].height
            await this.rectangeSwapVisual(this.ctx, array[R], dx, dy, null, 2)
            if (!isPlay) {
                lock = true
                return Promise.resolve()
            }
            auxiliary[index] = array[R]
            index++
            R++
        }
        index = 0
        L = low, R = high
        while (low <= high) {
            array[low] = auxiliary[index]
            array[low].color = 'orange'
            index++
            low++
        }
        await this.sleep(timeout_delay)
        if (!isPlay) {
            lock = true
            return Promise.resolve()
        }
        await this.allMoveUp(array[L], array[L].x, 200 * xs - array[L].height, L, R, array)
        await this.sleep(timeout_delay)
        lock = true
        return Promise.resolve()
    },

    async allMoveUp(rect, dx, dy, L, R, array) {
        let speedx = Math.abs(rect.x - dx) / 30
        let speedy = Math.abs(rect.y - dy) / 30
        let rx = rect.x,
            ry = rect.y
        let security = 0
        if (speedx == 0 && speedy == 0) {
            return Promise.resolve()
        }
        let that = this
        return new Promise(resolve => {
            let handleId = that.canvas.requestAnimationFrame(function render() {
                if (security >= 30 ||
                    !isPlay) {
                    that.canvas.cancelAnimationFrame(handleId)
                    resolve()
                    return
                }
                that.ctx.clearRect(0, 0, that.data.canvasWidth, that.data.canvasHeight)

                for (let i = L; i <= R; i++) {
                    let r = array[i]
                    if (rx > dx) {
                        r.x -= speedx
                        if (ry > dy) {
                            r.y -= speedy
                        } else {
                            r.y += speedy
                        }
                    } else {
                        r.x += speedx
                        if (ry > dy) {
                            r.y -= speedy
                        } else {
                            r.y += speedy
                        }
                    }
                }
                for (let i = 0; i < rectangeArray.length; i++) {
                    rectangeArray[i].flashRectange(that.ctx)
                }
                security++

                that.canvas.requestAnimationFrame(render)
            })
        })
    },


    async heapSort() {
        for (let i = Math.floor(arcArray.length / 2) - 1; i >= 0; i--) {
            await this.heapify(arcArray, i, arcArray.length)
            if (!isPlay) {
                lock = true
                return
            }
        }
        for (let i = arcArray.length - 1; i > 0; i--) {
            arcArray[0].color = 'orange'
            arcArray[i].color = 'orange'
            this.nodeSetColor(this.ctx, arcArray[0])
            this.nodeSetColor(this.ctx, arcArray[i])
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return
            }
            await this.heapifyVisual(this.ctx, arcArray[0], arcArray[i])
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return
            }
            let tmp = arcArray[i]
            arcArray[i] = arcArray[0]
            arcArray[0] = tmp
            arcArray[0].color = "rgb(205, 227, 234)"
            arcArray[i].color = 'lightgreen'
            this.nodeSetColor(this.ctx, arcArray[0])
            this.nodeSetColor(this.ctx, arcArray[i])
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return
            }
            await this.heapify(arcArray, 0, i)
            if (!isPlay) {
                lock = true
                return
            }
        }
        lock = true
        this.flash()
    },

    async quickSort() {
        this.quickSort2(rectangeArray, 0, rectangeArray.length - 1)
    },

    fillRectangeArrayAndDraw() {
        rectangeArray.length = 0
        let nums = this.data.nums
        let halfHei = this.data.canvasHeight / 2
        for (let i = 0; i < nums.length; i++) {
            let rect = new Rectange(start + i * increasement, halfHei - nums[i] * xs, width, nums[i], "rgb(205, 227, 234)")
            rect.drawRectange(this.ctx)
            rectangeArray.push(rect)
        }
    },

    rectangeSetColor(rect, color) {
        this.ctx.clearRect(rect.x - 2 * xs, rect.y - 2 * xs, rect.width + 4 * xs, rect.height + 4 * xs)
        rect.color = color
        rect.flashRectange(this.ctx)
    },

    async quickSort2(array, low, high) {
        if (low >= high) {
            if (low == high) {
                this.rectangeSetColor(array[low], 'orange')
                await this.sleep(timeout_delay)
            }
            return new Promise(resolve => {
                resolve()
            })
        }

        let L = low
        let R = high
        let value = array[R].num
        let tmpObj = array[R]
        if (!isPlay) {
            lock = true
            return Promise.resolve()
        }
        this.rectangeSetColor(rectangeArray[L], 'pink')
        this.rectangeSetColor(tmpObj, 'purple')
        await this.sleep(timeout_delay)
        if (!isPlay) {
            lock = true
            return Promise.resolve()
        }
        let newRect = new Rectange(tmpObj.x, tmpObj.y, tmpObj.width, tmpObj.num, 'pink')
        await this.rectangeSwapVisual(this.ctx, newRect, (array[L].x + array[R].x) / 2, 380 * xs - newRect.height, null)
        await this.sleep(timeout_delay)
        if (!isPlay) {
            lock = true
            return Promise.resolve()
        }
        while (L < R) {
            if (!isPlay) {
                lock = true
                return Promise.resolve()
            }
            while (L < R && array[L].num <= value) {
                this.rectangeSetColor(rectangeArray[L], "rgb(205, 227, 234)")
                await this.sleep(timeout_delay)
                if (!isPlay) {
                    lock = true
                    return Promise.resolve()
                }
                L++
                this.rectangeSetColor(rectangeArray[L], 'pink')
                await this.sleep(timeout_delay)
                if (!isPlay) {
                    lock = true
                    return Promise.resolve()
                }
            }
            let copy = new Rectange(array[L].x, array[L].y, array[L].width, array[L].num, array[L].color)
            await this.rectangeSwapVisual(this.ctx, copy, array[R].x, copy.y, newRect)
            if (!isPlay) {
                lock = true
                return Promise.resolve()
            }
            if (L != R) {
                this.rectangeSetColor(array[L], 'purple')
                await this.sleep(timeout_delay)
                if (!isPlay) {
                    lock = true
                    return Promise.resolve()
                }
            }
            array[R] = copy
            while (L < R && array[R].num >= value) {
                this.rectangeSetColor(array[R], "rgb(205, 227, 234)")
                await this.sleep(timeout_delay)
                if (!isPlay) {
                    lock = true
                    return Promise.resolve()
                }
                R--
                this.rectangeSetColor(array[R], 'pink')
                await this.sleep(timeout_delay)
                if (!isPlay) {
                    lock = true
                    return Promise.resolve()
                }
            }
            copy = new Rectange(array[R].x, array[R].y, array[R].width, array[R].num, array[R].color)
            await this.rectangeSwapVisual(this.ctx, copy, array[L].x, 200 * xs - copy.height, newRect)
            if (!isPlay) {
                lock = true
                return Promise.resolve()
            }
            if (L != R) {
                this.rectangeSetColor(array[R], 'purple')
                await this.sleep(timeout_delay)
                if (!isPlay) {
                    lock = true
                    return Promise.resolve()
                }
            }
            array[L] = copy

        }
        await this.rectangeSwapVisual(this.ctx, newRect, array[L].x, 200 * xs - newRect.height, null)
        if (!isPlay) {
            lock = true
            return Promise.resolve()
        }
        this.rectangeSetColor(newRect, 'orange')
        await this.sleep(timeout_delay)
        if (!isPlay) {
            lock = true
            return Promise.resolve()
        }
        array[L] = newRect
        await this.quickSort2(array, low, L - 1)
        await this.quickSort2(array, L + 1, high)
        lock = true
        return new Promise(resolve => {
            resolve()
        })

    },

    async rectangeSwapVisual(ctx, rect, dx, dy, rect2, flag = 1) {
        let speedx = Math.abs(rect.x - dx) / 30
        let speedy = Math.abs(rect.y - dy) / 30
        let rx = rect.x,
            ry = rect.y
        let security = 0
        if (speedx == 0 && speedy == 0) {
            return Promise.resolve()
        }

        let that = this

        return new Promise(resolve => {

            let handleId = that.canvas.requestAnimationFrame(function render() {
                if (security >= 30 ||
                    !isPlay) {
                    that.canvas.cancelAnimationFrame(handleId)
                    if (rect.y < 200 * xs && flag == 1) {
                        ctx.clearRect(rect.x - 2 * xs, 0, rect.width + 4 * xs, 202 * xs)
                        rect.flashRectange(ctx)
                    }
                    resolve()
                    return
                }
                that.ctx.clearRect(0, 0, that.data.canvasWidth, that.data.canvasHeight)
                if (rx > dx) {
                    rect.x -= speedx
                    if (ry > dy) {
                        rect.y -= speedy
                    } else {
                        rect.y += speedy
                    }
                } else {
                    rect.x += speedx
                    if (ry > dy) {
                        rect.y -= speedy
                    } else {
                        rect.y += speedy
                    }
                }
                for (let i = 0; i < rectangeArray.length; i++) {
                    rectangeArray[i].flashRectange(ctx)
                }
                rect.flashRectange(ctx)
                if (rect2 != null) {
                    rect2.flashRectange(ctx)
                }
                security++

                that.canvas.requestAnimationFrame(render)
            })
        })
    },

    async heapSort() {
        for (let i = Math.floor(arcArray.length / 2) - 1; i >= 0; i--) {
            await this.heapify(arcArray, i, arcArray.length)
            if (!isPlay) {
                lock = true
                return
            }
        }
        for (let i = arcArray.length - 1; i > 0; i--) {
            arcArray[0].color = 'orange'
            arcArray[i].color = 'orange'
            this.nodeSetColor(this.ctx, arcArray[0])
            this.nodeSetColor(this.ctx, arcArray[i])
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return
            }
            await this.heapifyVisual(this.ctx, arcArray[0], arcArray[i])
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return
            }
            let tmp = arcArray[i]
            arcArray[i] = arcArray[0]
            arcArray[0] = tmp
            arcArray[0].color = "rgb(205, 227, 234)"
            arcArray[i].color = 'lightgreen'
            this.nodeSetColor(this.ctx, arcArray[0])
            this.nodeSetColor(this.ctx, arcArray[i])
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return
            }
            await this.heapify(arcArray, 0, i)
            if (!isPlay) {
                lock = true
                return
            }
        }
        lock = true
        this.flash()
    },

    flash() {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        for (let i = 0; i < lineArray.length; i++) {
            lineArray[i].flashLine(this.ctx)
        }
        for (let i = 0; i < arcArray.length; i++) {
            arcArray[i].color = "rgb(205, 227, 234)"
            arcArray[i].flashArc(this.ctx)
            indexArray[i].flashIndex(this.ctx)
        }

    },

    async heapify(arcArray, cur, len) {
        let i = cur
        while (i < len) {
            let p = i
            let tmp = i * 2 + 1
            arcArray[i].color = 'orange'
            this.nodeSetColor(this.ctx, arcArray[i])
            if (tmp < len) {
                arcArray[tmp].color = 'orange'
                this.nodeSetColor(this.ctx, arcArray[tmp])
                if (arcArray[i].num < arcArray[tmp].num) {
                    i = tmp
                }
            }
            if (tmp + 1 < len) {
                arcArray[tmp + 1].color = 'orange'
                this.nodeSetColor(this.ctx, arcArray[tmp + 1])
                if (arcArray[i].num < arcArray[tmp + 1].num) {
                    i = tmp + 1
                }
            }
            await this.sleep(timeout_delay)
            if (!isPlay) {
                break
            }
            if (i < len && arcArray[p].num < arcArray[i].num) {
                await this.heapifyVisual(this.ctx, arcArray[p], arcArray[i])
                let t = arcArray[p]
                arcArray[p] = arcArray[i]
                arcArray[i] = t
                await this.sleep(timeout_delay)
                if (!isPlay) {
                    break
                }
            } else {
                i = len
            }
            tmp = p * 2 + 1
            if (tmp < len) {
                arcArray[tmp].color = "rgb(205, 227, 234)"
                this.nodeSetColor(this.ctx, arcArray[tmp])
            }
            if (tmp + 1 < len) {
                arcArray[tmp + 1].color = "rgb(205, 227, 234)"
                this.nodeSetColor(this.ctx, arcArray[tmp + 1])
            }
            arcArray[p].color = "rgb(205, 227, 234)"
            this.nodeSetColor(this.ctx, arcArray[p])
            await this.sleep(timeout_delay)
            if (!isPlay) {
                break
            }
        }

        return Promise.resolve()
    },

    async heapifyVisual(ctx, arc1, arc2) {
        let arc1Destx = arc2.x,
            arc2Destx = arc1.x
        let distx = Math.abs(arc1.x - arc2.x),
            disty = Math.abs(arc1.y - arc2.y)
        let speedx = distx / 35,
            speedy = disty / 35
        let security = 0
        let that = this
        return new Promise(resolve => {
            let handleId = that.canvas.requestAnimationFrame(function render() {
                if (security >= 35 || !isPlay) {
                    that.canvas.cancelAnimationFrame(handleId)
                    resolve()
                    return
                }

                ctx.clearRect(0, 0, that.data.canvasWidth, that.data.canvasHeight)
                if (arc1Destx > arc2Destx) {
                    arc1.x += speedx
                    arc2.x -= speedx
                } else {
                    arc1.x -= speedx
                    arc2.x += speedx
                }
                arc1.y += speedy
                arc2.y -= speedy
                for (let i = 0; i < lineArray.length; i++) {
                    lineArray[i].flashLine(ctx)
                }
                for (let i = 0; i < arcArray.length; i++) {
                    arcArray[i].flashArc(ctx)
                    indexArray[i].flashIndex(ctx)
                }
                security++
                that.canvas.requestAnimationFrame(render)
            })
        })

    },

    // 基数排序
    async radixSort() {
        let nums = this.data.nums
        let bucket = new Array(10)
        let count = new Array(10)
        for (let i = 0; i < 10; i++) {
            bucket[i] = new Array(10)
            count[i] = 0
        }
        let maxValue = this.getMaxValue()
        let maxdigits = this.getMaxDigits(maxValue)
        let multiple = 1
        let ctx = this.ctx
        await this.sleep(200)
        for (let i = 1; i <= maxdigits; i++) {
            if (!isPlay) {
                lock = true
                return
            }
            ctx.clearRect(0, 0, this.data.canvasWidth, 100 * xs)
            for (let k = 0; k < rectArray.length; k++) {
                rectArray[k].flag = i
                rectArray[k].flashRect(ctx)
            }
            await this.sleep(timeout_delay)
            if (!isPlay) {
                lock = true
                return
            }
            for (let j = 0; j < nums.length; j++) {
                let index = Math.floor(nums[j] / multiple) % 10
                // 进桶 
                bucket[index][count[index]] = nums[j]
                count[index]++
                let buck = buckArray[index]
                let rect = rectArray.shift()
                await this.findPos(ctx, rect, buck.dx, buck.dy)
                await this.sleep(timeout_delay)
                if (!isPlay) {
                    lock = true
                    return
                }
                buck.items.push(rect)
                buck.dy = buck.dy - 23 * xs
            }
            let pos = 0
            let tmp = Rect.prototype.dx
            for (let j = 0; j < 10; j++) {
                for (let k = 0; k < count[j]; k++) {
                    nums[pos] = bucket[j][k]
                    pos++
                    let rect = buckArray[j].items.shift()
                    await this.findPos(ctx, rect, Rect.prototype.dx, 10 * xs)
                    await this.sleep(timeout_delay)
                    if (!isPlay) {
                        lock = true
                        return
                    }
                    rectArray.push(rect)
                    Rect.prototype.dx += 35 * xs
                }
                buckArray[j].dy = 350 * xs
                count[j] = 0
            }
            Rect.prototype.dx = tmp
            multiple *= 10
        }
        ctx.clearRect(0, 0, this.data.canvasWidth, 100 * xs)
        for (let k = 0; k < rectArray.length; k++) {
            rectArray[k].flag = 0
            rectArray[k].flashRect(ctx)
        }
        lock = true
    },

    // 基数排序：获取数组中元素的最大值
    getMaxValue() {
        let nums = this.data.nums
        let res = -1
        for (let i = 0; i < nums.length; i++) {
            if (res < nums[i]) {
                res = nums[i]
            }
        }
        return res
    },

    // 基数排序：获取最大值的的位数
    getMaxDigits(value) {
        let res = 0
        while (value != 0) {
            res++
            value = Math.floor(value / 10)
        }
        return res
    },

    // 基数排序矩形移动到合适的位置
    async findPos(ctx, rect, dx, dy) {
        let speedx = Math.abs(rect.x - dx) / 30
        let speedy = Math.abs(rect.y - dy) / 30
        let rx = rect.x,
            ry = rect.y
        let security = 0
        if (speedx == 0 && speedy == 0) {
            return Promise.resolve()
        }
        let that = this
        return new Promise(resolve => {
            let handleId = that.canvas.requestAnimationFrame(function render() {
                if (security >= 30 ||
                    !isPlay) {
                    that.canvas.cancelAnimationFrame(handleId)
                    resolve()
                    return
                }
                that.ctx.clearRect(0, 0, that.data.canvasWidth, that.data.canvasHeight)
                for (let i = 0; i < buckArray.length; i++) {
                    for (let j = 0; j < buckArray[i].items.length; j++) {
                        buckArray[i].items[j].flashRect(ctx)
                    }
                    buckArray[i].flashBucket(ctx)
                }

                if (rx > dx) {
                    rect.x -= speedx
                    if (ry > dy) {
                        rect.y -= speedy
                    } else {
                        // rect.y <= buck.dy
                        rect.y += speedy
                    }
                } else {
                    // rect.x <= buck.dx
                    rect.x += speedx
                    if (ry > dy) {
                        rect.y -= speedy
                    } else {
                        // rect.y <= buck.dy
                        rect.y += speedy
                    }
                }
                for (let i = 0; i < rectArray.length; i++) {
                    rectArray[i].flashRect(ctx)
                }
                rect.flashRect(ctx)
                security++
                that.canvas.requestAnimationFrame(render)
            })
        })
    },


    async sleep(delay = 1000) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, delay)
        })
    },
    // 冒泡排序
    sortType0() {
        this.setNavColor(0)
    },

    // 选择排序
    sortType1() {
        this.setNavColor(1)
    },
    // 插入排序
    sortType2() {
        this.setNavColor(2)
    },
    // 希尔排序
    sortType3() {
        this.setNavColor(3)
    },
    // 归并排序
    sortType4() {
        this.setNavColor(4)
    },
    // 快速排序
    sortType5() {
        this.setNavColor(5)
    },
    // 堆排序
    sortType6() {
        this.setNavColor(6)
    },
    // 基数排序
    sortType7() {
        this.setNavColor(7)
    },

    setNavColor(type) {
        this.activate(type)
        // 对导航了设置相应的颜色
        let backgroundColor = this.data.backgroundColor
        backgroundColor[sort] = 'gray'
        sort = type
        backgroundColor[type] = 'green'
        this.setData({
            backgroundColor
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

    slowDown() {
        if (timeout_delay >= 1000) {
            return
        }
        timeout_delay += 100
        this.setData({
            speed: this.data.speed - 100
        })
    },

    clear() {
        this.setData({
            inputTxt: ''
        })
    }

})