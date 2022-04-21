let app = getApp()
let deviceWidth = app.globalData.width
let xs = deviceWidth / 375
let timeout_delay = 500
let way = 0
let lock = false
const PLAY = true
const PAUSE = false
let state = PLAY

let trees = [
    [12, 16, 5, null, 70, 20, null, 68, null, null, 40],
    [18, 14, 24, 5, 16, 20, 38, null, 7, null, null, 30, null, null, 10, null, 35],
    [10, 50, 32, 5, 16, 9, 40, 88],
    [67, 34, 78, 53, 87, 2, null, null, null, 76, null, null, 56],
    [34, 53, null, 23, 90, 34, 30, 20, 45]
]
let treeNum = 3
let way2 = 4

function Node(value, key) {
    this.key = key
    this.value = value
    this.left = null
    this.right = null
}

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



function Snode(value) {
    this.value = value
    this.next = null
}

function Stack() {
    this.head = new Snode(0)
}

Stack.prototype.push = function (value) {
    let snode = new Snode(value)
    snode.next = this.head.next
    this.head.next = snode
}

Stack.prototype.pop = function () {
    if (this.head.next == null) {
        return
    }
    let popNode = this.head.next
    this.head.next = popNode.next
    popNode.next = null
    return popNode.value
}

Stack.prototype.isEmpty = function () {
    if (this.head.next == null) {
        return true
    }
    return false
}


function buildTree(arr) {
    if (arr.length == 0 || arr[0] == null) {
        return
    }
    let index = 0
    let key = 0
    let root = new Node(arr[index], key++)
    index++
    queue.enqueue(root)
    while (!queue.isEmpty()) {
        let node = queue.dequeue()
        let left = arr[index] == null ? null : new Node(arr[index], key++)
        index++
        let right = arr[index] == null ? null : new Node(arr[index], key++)
        index++
        node.left = left
        node.right = right
        if (left != null) {
            queue.enqueue(left)
        }
        if (right != null) {
            queue.enqueue(right)
        }
    }
    return root
}

let root = null
let scr = null
let queue = null
let stack = null
let stack2 = null
let printList = []
let bucketList = []
let bucketList2 = []

function Arc(x, y, radius, color, num) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.num = num
}

Arc.prototype.drawArc = function (ctx) {
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.strokeStyle = 'gray'
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.num, this.x, this.y)
}
let arcList = []

function Line(x, y, dx, dy) {
    this.x = x
    this.y = y
    this.dx = dx
    this.dy = dy
}

Line.prototype.drawLine = function (ctx) {
    ctx.beginPath()
    ctx.strokeStyle = 'gray'
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.dx, this.dy)
    ctx.stroke()
}

let lineList = []

function TraverseArc(x, y, radius) {
    this.x = x
    this.y = y
    this.radius = radius
}

TraverseArc.prototype.drawArc = function (ctx) {
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'green',
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'gray'
}
let traverseArc = new TraverseArc(10 * xs, 10 * xs, 15 * xs)

Page({
    data: {
        canvasHeight: 400 * xs,
        canvasWidth: deviceWidth,
        btnBgc: ['lightgreen', 'lightblue', 'lightblue', 'lightblue', '#FFDEAD', 'lightblue'],
        speed: 600,
        tree: [67, 34, 78, 53, 87, 2, null, null, null, 76, null, null, 56],
        inputValue: '67,34,78,53,87,2,null,null,null,76,null,null,56',
    },

    onHide() {
        state = PAUSE
    },

    onUnload() {
        state = PAUSE
    },

    onShow() {
        timeout_delay = 500
        way = 0
        way2 = 4
        treeNum = 3
        lock = false
        this.initVar()
        this.setData({
            btnBgc: ['lightgreen', 'lightblue', 'lightblue', 'lightblue', '#FFDEAD', 'lightblue'],
            speed: 600,
            tree: [67, 34, 78, 53, 87, 2, null, null, null, 76, null, null, 56],
            inputValue: '67,34,78,53,87,2,null,null,null,76,null,null,56',
        })
        const query = wx.createSelectorQuery()
        query.select('#SBTcanvas')
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
                this.reStart()
            })
    },

    initScr() {
        scr = new Array(11)
        for (let i = 0; i < scr.length; i++) {
            scr[i] = new Array(11)
            for (let j = 0; j < scr[i].length; j++) {
                scr[i][j] = null
            }
        }
    },

    getStartMarginLeft() {
        let mostLeft = scr[0].length,
            mostRight = 0
        for (let i = 0; i < scr.length; i++) {
            for (let j = 0; j < scr[i].length; j++) {
                if (scr[i][j] != null) {
                    mostLeft = Math.min(mostLeft, j)
                    mostRight = Math.max(mostRight, j)
                }
            }
        }
        return (deviceWidth - (mostRight - mostLeft) * 30 * xs) / 2
    },

    fillArcList() {
        arcList.length = []
        let start = this.getStartMarginLeft()
        let top = 30 * xs
        for (let i = 0; i < scr.length; i++) {
            for (let j = 0; j < scr[i].length; j++) {
                if (scr[i][j] != null) {
                    let key = scr[i][j].key
                    arcList[key] = new Arc(start + j * 30 * xs, top + i * 30 * xs, 10 * xs, '#F0FFFF', scr[i][j].value)
                }
            }
        }
    },

    buildTree() {
        this.initScr()
        root = buildTree(this.data.tree)
        this.midTraverse(0, 0, root)
        this.fillArcList()
        this.fillLineList()
        this.drawNodeAndLine()
    },

    drawNodeAndLine() {
        for (let i = 0; i < lineList.length; i++) {
            lineList[i].drawLine(this.ctx)
        }
        for (let i = 0; i < arcList.length; i++) {
            arcList[i].drawArc(this.ctx)
        }
    },

    midTraverse(x, y, cur) {
        if (cur == null) {
            return x
        }
        let leftRes = this.midTraverse(x, y + 1, cur.left)
        scr[y][leftRes] = cur
        return this.midTraverse(leftRes + 1, y + 1, cur.right)
    },

    fillLineList() {
        lineList.length = 0
        for (let i = 0; i < scr.length; i++) {
            let pos = 0
            for (let j = 0; j < scr[0].length; j++) {
                let count = 0
                if (scr[i][j] != null) {
                    if (scr[i][j].left == null && scr[i][j].right == null) {
                        continue
                    } else if (scr[i][j].left != null && scr[i][j].right != null) {
                        count = 2
                    } else {
                        count = 1
                    }
                    let key1 = scr[i][j].key
                    for (let k = pos; k < scr[0].length && i + 1 < scr.length; k++) {
                        if (scr[i + 1][k] == null) {
                            continue
                        }
                        let key2 = scr[i + 1][k].key
                        let line = new Line(arcList[key1].x, arcList[key1].y, arcList[key2].x, arcList[key2].y)
                        lineList.push(line)
                        pos = k + 1
                        if (--count == 0) {
                            break
                        }
                    }
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

    randomGenTree() {
        treeNum = (treeNum + 1) % trees.length
        let treeString = []
        for (let i = 0; i < trees[treeNum].length; i++) {
            treeString.push(trees[treeNum][i] + '')
        }
        this.setData({
            tree: trees[treeNum],
            inputValue: treeString.join(',')
        })
        this.reStart()
    },

    inputTree(event) {
        let value = event.detail.value
        let res = this.check(value)
        if (res == false) {
            return
        }
        this.reStart()
    },

    async reStart() {
        state = PAUSE
        await this.sleep(5)
        this.initVar()
        this.reDraw()
    },

    initVar() {
        root = null
        scr = null
        queue = new Queue()
        stack = new Stack()
        stack2 = new Stack()
        printList.length = 0
        bucketList.length = 0
        bucketList2.length = 0
    },

    reDraw() {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        this.buildTree()
    },

    check(value) {
        value = value.trim()
        if (value == '') {
            wx.showToast({
                title: '输入不能为空',
                icon: 'none',
                duration: 1000
            })
            return false
        }
        for (let i = 0; i < value.length; i++) {
            if (value.charAt(i) == '-' || value.charAt(i) == '.') {
                wx.showToast({
                    title: '树节点的value的取值范围为(0,100)的整数',
                    icon: 'none',
                    duration: 1500
                })
                return false
            }
            if (!((value.charAt(i) >= '0' &&
                        value.charAt(i) <= '9') ||
                    value.charAt(i) == 'n' ||
                    value.charAt(i) == 'u' ||
                    value.charAt(i) == 'l' ||
                    value.charAt(i) == ' ' ||
                    value.charAt(i) == ',' ||
                    value.charAt(i) == '，')) {
                wx.showToast({
                    title: '输入不合法',
                    icon: 'none',
                    duration: 1000
                })
                return false
            }
        }
        for (let i = 0; i < value.length; i++) {
            if (value.charAt(i) == '，') {
                value = value.replace('，', ',')
            }
        }
        let lastC = value.charAt(value.length - 1)
        if (lastC == ',') {
            value = value.substring(0, value.length - 1)
        }

        let values = value.split(',')
        let tree = []
        let numCount = 0
        for (let i = 0; i < values.length; i++) {
            if (values[i].trim() == 'null') {
                tree.push(null)
            } else if (parseInt(values[i]) > 0 && parseInt(values[i]) < 100) {
                numCount++
                tree.push(parseInt(values[i]))
            } else if (parseInt(values[i]) >= 100) {
                wx.showToast({
                    title: '树节点的value值的取值范围是(0,100)的整数',
                    icon: 'none',
                    duration: 1500
                })
                return false
            } else {
                wx.showToast({
                    title: "请见检查null是否正确输入或','添加是否正确",
                    icon: 'none',
                    duration: 1500
                })
                return false
            }
        }

        if (numCount > 11) {
            wx.showToast({
                title: '树的节点的个数不能超过11个',
                icon: 'none',
                duration: 1000
            })
            return false
        }

        this.setData({
            tree,
            inputValue: values.join(',')
        })

        return true
    },

    pre() {
        this.select(0)
    },

    order() {
        this.select(1)
    },

    after() {
        this.select(2)
    },

    layer() {
        if (this.data.btnBgc[3] == 'rgb(211, 211, 211)') {
            return
        }
        this.select(3)
    },

    select(index) {
        if (way == index) {
            return
        }
        let btnBgc = this.data.btnBgc
        btnBgc[way] = 'lightblue'
        btnBgc[index] = 'lightgreen'
        this.setData({
            btnBgc
        })
        way = index

        this.reStart()
    },

    async demo() {
        if (state == PLAY) {
            return
        }
        await this.unLock()
        state = PLAY
        lock = true
        this.drawPrint(this.ctx, 10 * xs, 375 * xs, 'Print:')
        if (way2 == 4) {
            switch (way) {
                case 0:
                    this.preDemo()
                    break
                case 1:
                    this.orderDemo()
                    break
                case 2:
                    this.afterDemo()
                    break
                case 3:
                    this.layerDemo()
                    break
            }
        } else {
            traverseArc.x = arcList[root.key].x
            traverseArc.y = arcList[root.key].y
            traverseArc.drawArc(this.ctx)
            switch (way) {
                case 0:
                    await this.preRecDemo(root)
                    break
                    case 1:
                    await this.sleep(timeout_delay)
                    await this.orderRecDemo(root)
                    break
                case 2:
                    await this.sleep(timeout_delay)
                    await this.afterRecDemo(root)
                    break
            }
            lock = false
        }
    },

    async preRecDemo(cur) {
        if (cur == null) {
            return Promise.resolve()
        }
        let arc = arcList[cur.key]
        await this.move(traverseArc, arc.x, arc.y, 0)
        if (state == PAUSE) {
            return Promise.resolve()
        }
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            return Promise.resolve()
        }
        let newArc = new Arc(arc.x, arc.y, arc.radius, arc.color, arc.num)
        printList.push(newArc)
        await this.move(printList[printList.length - 1], 70 * xs + (printList.length - 1) * 25 * xs, 375 * xs, 0)
        if (state == PAUSE) {
            return Promise.resolve()
        }
        if (cur.left != null) {
            await this.preRecDemo(cur.left)
            if (state == PAUSE) {
                return Promise.resolve()
            }
            await this.move(traverseArc, arc.x, arc.y, 0)
            if (state == PAUSE) {
                return Promise.resolve()
            }
        }
        if (cur.right != null) {
            await this.preRecDemo(cur.right)
            if (state == PAUSE) {
                return Promise.resolve()
            }
            await this.move(traverseArc, arc.x, arc.y, 0)
        }
        return Promise.resolve()
    },

    async orderRecDemo(cur) {
        if (cur == null) {
            return Promise.resolve()
        }
        let arc = arcList[cur.key]
        if (state == PAUSE) {
            return Promise.resolve()
        }
        await this.move(traverseArc, arc.x, arc.y, 0)
        if (state == PAUSE) {
            return Promise.resolve()
        }
        if (cur.left != null) {
            await this.orderRecDemo(cur.left)
            if (state == PAUSE) {
                return Promise.resolve()
            }
            await this.move(traverseArc, arc.x, arc.y)
            if (state == PAUSE) {
                return Promise.resolve()
            }
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                return Promise.resolve()
            }
        }
        let newArc = new Arc(arc.x, arc.y, arc.radius, arc.color, arc.num)
        printList.push(newArc)
        await this.move(printList[printList.length - 1], 70 * xs + (printList.length - 1) * 25 * xs, 375 * xs, 0)
        if (state == PAUSE) {
            return Promise.resolve()
        }
        if (cur.right != null) {
            await this.orderRecDemo(cur.right)
            await this.move(traverseArc, arc.x, arc.y, 0)
        }
        return Promise.resolve()
    },

    async afterRecDemo(cur) {
        if (cur == null) {
            return Promise.resolve()
        }

        let arc = arcList[cur.key]
        if (state == PAUSE) {
            return Promise.resolve()
        }
        await this.move(traverseArc, arc.x, arc.y, 0)
        if (state == PAUSE) {
            return Promise.resolve()
        }
        if (cur.left != null) {
            await this.afterRecDemo(cur.left)
            if (state == PAUSE) {
                return Promise.resolve()
            }
            await this.move(traverseArc, arc.x, arc.y, 0)
            if (state == PAUSE) {
                return Promise.resolve()
            }
        }

        if (cur.right != null) {
            await this.afterRecDemo(cur.right)
            if (state == PAUSE) {
                return Promise.resolve()
            }
            await this.move(traverseArc, arc.x, arc.y, 0)
            if (state == PAUSE) {
                return Promise.resolve()
            }
        }
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            return Promise.resolve()
        }
        let newArc = new Arc(arc.x, arc.y, arc.radius, arc.color, arc.num)
        printList.push(newArc)
        await this.move(printList[printList.length - 1], 70 * xs + (printList.length - 1) * 25 * xs, 375 * xs, 0)
        return Promise.resolve()
    },

    async orderDemo() {
        if (root == null) {
            return
        }
        this.drawBucket(this.ctx, 10 * xs, 190 * xs, 'S', bucketList)
        let cur = root,
            newArc = null,
            arc = null
        while (cur != null || !stack.isEmpty()) {
            while (cur != null) {
                arc = arcList[cur.key]
                arc.color = '#FF00FF'
                arc.drawArc(this.ctx)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return
                }
                newArc = new Arc(arc.x, arc.y, arc.radius, arc.color, arc.num)
                bucketList.push(newArc)
                await this.move(newArc, 22.5 * xs, 335 * xs - newArc.radius -  (2 * newArc.radius + 5 * xs) * (bucketList.length - 1), 0)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return
                }
                stack.push(cur)
                cur = cur.left
            }
            cur = stack.pop()
            arc = arcList[cur.key]
            arc.color = 'orange'
            arc.drawArc(this.ctx)
            bucketList[bucketList.length - 1].color = 'orange'
            bucketList[bucketList.length - 1].drawArc(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return
            }
            printList.push(bucketList.pop())
            await this.move(printList[printList.length - 1], 70 * xs + (printList.length - 1) * 25 * xs, 375 * xs, 0)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return
            }
            cur = cur.right
        }
        lock = false
    },

    async preDemo() {
        if (root == null) {
            return
        }
        this.drawBucket(this.ctx, 10 * xs, 190 * xs, 'S', bucketList)
        let newArc = null
        stack.push(root)
        let rootArc = arcList[root.key]
        rootArc.color = '#FF00FF'
        rootArc.drawArc(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return
        }
        newArc = new Arc(rootArc.x, rootArc.y, rootArc.radius, rootArc.color, rootArc.num)
        bucketList.push(newArc)
        await this.move(newArc, 22.5 * xs, 335 * xs - newArc.radius, 0)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return
        }
        while (!stack.isEmpty()) {
            let popNode = stack.pop()
            arcList[popNode.key].color = 'orange'
            arcList[popNode.key].drawArc(this.ctx)
            bucketList[bucketList.length - 1].color = 'orange'
            bucketList[bucketList.length - 1].drawArc(this.ctx)
            let newArc2 = null,
                newArc3 = null,
                arc = null
            if (popNode.right != null) {
                arc = arcList[popNode.right.key]
                arc.color = 'rgb(255,99,71)'
                arc.drawArc(this.ctx)
                newArc2 = new Arc(arc.x, arc.y, arc.radius, arc.color, arc.num)
            }
            if (popNode.left != null) {
                arc = arcList[popNode.left.key]
                arc.color = 'rgb(255,99,71)'
                arc.drawArc(this.ctx)
                newArc3 = new Arc(arc.x, arc.y, arc.radius, arc.color, arc.num)
            }
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return
            }
            printList.push(bucketList.pop())
            await this.move(printList[printList.length - 1], 70 * xs + (printList.length - 1) * 25 * xs, 375 * xs, 0)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return
            }
            if (newArc2 != null) {
                arc = arcList[popNode.right.key]
                arc.color = '#FF00FF'
                arc.drawArc(this.ctx)
                newArc2.color = '#FF00FF'
                bucketList.push(newArc2)
                await this.move(newArc2, 22.5 * xs, 335 * xs - newArc2.radius -  (2 * newArc2.radius + 5 * xs) * (bucketList.length - 1), 0)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return
                }
                stack.push(popNode.right)
            }
            if(newArc3 != null){
                arc = arcList[popNode.left.key]
                arc.color = '#FF00FF'
                arc.drawArc(this.ctx)
                newArc3.color = '#FF00FF'
                bucketList.push(newArc3)
                await this.move(newArc3, 22.5 * xs, 335 * xs - newArc3.radius - (2 * newArc3.radius + 5 * xs) * (bucketList.length - 1), 0)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return
                }
                stack.push(popNode.left)
            }
        }

        lock = false

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
                that.reDrawAll(type)
                security++
                that.canvas.requestAnimationFrame(render)
            })
        })
    },

    reDrawAll(type) {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        this.drawNodeAndLine()
        this.drawPrint(this.ctx, 10 * xs, 375 * xs, 'Print:')
        if (way2 == 5) {
            traverseArc.drawArc(this.ctx)
        } else {
            if (type == 0) {
                this.drawBucket(this.ctx, 10 * xs, 190 * xs, 'S', bucketList)

            } else if (type == 1) {
                this.drawBucket(this.ctx, 10 * xs, 190 * xs, 'S1', bucketList)
                this.drawBucket(this.ctx, 55 * xs, 190 * xs, 'S2', bucketList2)
            } else {
                if (type == 3) {
                    let step =  (2 * 10 * xs + 5 * xs) / 30
                    for (let i = 0; i < bucketList.length; i++) {
                        bucketList[i].y -= step
                    }
                }
                this.drawBucket(this.ctx, 10 * xs, 190 * xs, 'Q', bucketList)
            }
        }
    },

    drawBucket(ctx, x, y, text, list) {
        ctx.beginPath()
        ctx.strokeStyle = 'gray'
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + 150 * xs)
        ctx.lineTo(x + 25 * xs, y + 150 * xs)
        ctx.lineTo(x + 25 * xs, y)
        ctx.stroke()
        ctx.textAlign = 'center'
        ctx.fillText(text, x + 12.5 * xs, y + 160 * xs)
        for (let i = 0; i < list.length; i++) {
            list[i].drawArc(this.ctx)
        }
    },

    drawPrint(ctx, x, y, text) {
        ctx.beginPath()
        ctx.textAlign = 'start'
        ctx.fillText(text, x, y)
        for (let i = 0; i < printList.length; i++) {
            printList[i].drawArc(this.ctx)
        }
    },

    async afterDemo() {
        if (root == null) {
            return
        }
        this.drawBucket(this.ctx, 10 * xs, 190 * xs, 'S1', bucketList)
        this.drawBucket(this.ctx, 55 * xs, 190 * xs, 'S2', bucketList2)
        let cur = root,
            arc = null,
            newArc = null
        arc = arcList[cur.key]
        arc.color = '#FF00FF'
        arc.drawArc(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return
        }
        newArc = new Arc(arc.x, arc.y, arc.radius, arc.color, arc.num)
        bucketList.push(newArc)
        await this.move(newArc, 22.5 * xs, 335 * xs - newArc.radius -  (2 * newArc.radius + 5 * xs) * (bucketList.length - 1), 1)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return
        }
        stack.push(cur)
        while (!stack.isEmpty()) {
            cur = stack.pop()
            arc = arcList[cur.key]
            arc.color = 'green'
            arc.drawArc(this.ctx)
            bucketList[bucketList.length - 1].color = 'green'
            bucketList[bucketList.length - 1].drawArc(this.ctx)
            bucketList2.push(bucketList.pop())
            let newArc2 = null,
                newArc3 = null
            if (cur.left != null) {
                arc = arcList[cur.left.key]
                arc.color = 'rgb(255,99,71)'
                arc.drawArc(this.ctx)
                newArc2 = new Arc(arc.x, arc.y, arc.radius, arc.color, arc.num)
            }
            if (cur.right != null) {
                arc = arcList[cur.right.key]
                arc.color = 'rgb(255,99,71)'
                arc.drawArc(this.ctx)
                newArc3 = new Arc(arc.x, arc.y, arc.radius, arc.color, arc.num)
            }
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return
            }
            await this.move(bucketList2[bucketList2.length - 1], 67.5 * xs, 335 * xs - newArc.radius - (2 * newArc.radius + 5 * xs) * (bucketList2.length - 1), 1)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return
            }
            stack2.push(cur)

            if (newArc2 != null) {
                arc = arcList[cur.left.key]
                arc.color = '#FF00FF'
                arc.drawArc(this.ctx)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return
                }
                newArc2.color = '#FF00FF'
                bucketList.push(newArc2)
                await this.move(newArc2, 22.5 * xs, 335 * xs - newArc2.radius - (2 * newArc2.radius + 5 * xs) * (bucketList.length - 1), 1)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return
                }
                stack.push(cur.left)
            }

            if (newArc3 != null) {
                arc = arcList[cur.right.key]
                arc.color = '#FF00FF'
                arc.drawArc(this.ctx)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return
                }
                newArc3.color = '#FF00FF'
                bucketList.push(newArc3)
                await this.move(newArc3, 22.5 * xs, 335 * xs - newArc3.radius -  (2 * newArc3.radius + 5 * xs) * (bucketList.length - 1), 1)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return
                }
                stack.push(cur.right)
            }


        }

        while (!stack2.isEmpty()) {
            cur = stack2.pop()
            arc = arcList[cur.key]
            arc.color = 'orange'
            arc.drawArc(this.ctx)
            bucketList2[bucketList2.length - 1].color = 'orange'
            bucketList2[bucketList2.length - 1].drawArc(this.ctx)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return
            }
            printList.push(bucketList2.pop())
            await this.move(printList[printList.length - 1], 70 * xs + (printList.length - 1) * 25 * xs, 375 * xs, 1)
            await this.sleep(timeout_delay)
            if (state == PAUSE) {
                lock = false
                return
            }
        }

        lock = false
    },

    async layerDemo() {
        if (root == null) {
            return
        }
        this.drawBucket(this.ctx, 10 * xs, 190 * xs, 'Q', bucketList)
        let cur = root,
            arc = null,
            newArc = null
        arc = arcList[cur.key]
        arc.color = '#FF00FF'
        arc.drawArc(this.ctx)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return
        }
        newArc = new Arc(arc.x, arc.y, arc.radius, arc.color, arc.num)
        bucketList.push(newArc)
        await this.move(newArc, 22.5 * xs, 190 * xs + newArc.radius +  (2 * newArc.radius + 5 * xs) * (bucketList.length - 1), 2)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
            lock = false
            return
        }
        queue.enqueue(cur)
        while (!queue.isEmpty()) {
            let size = queue.getSize()
            for (let i = 0; i < size; i++) {
                cur = queue.dequeue()
                arc = arcList[cur.key]
                arc.color = 'orange'
                arc.drawArc(this.ctx)
                bucketList[0].color = 'orange'
                bucketList[0].drawArc(this.ctx)
                let newArc2 = null,
                    newArc3 = null
                if (cur.left != null) {
                    arc = arcList[cur.left.key]
                    arc.color = 'rgb(255,99,71)'
                    arc.drawArc(this.ctx)
                    newArc2 = new Arc(arc.x, arc.y, arc.radius, arc.color, arc.num)
                    queue.enqueue(cur.left)
                }
                if (cur.right != null) {
                    arc = arcList[cur.right.key]
                    arc.color = 'rgb(255,99,71)'
                    arc.drawArc(this.ctx)
                    newArc3 = new Arc(arc.x, arc.y, arc.radius, arc.color, arc.num)
                    queue.enqueue(cur.right)
                }
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return
                }
                printList.push(bucketList.shift())
                await this.move(printList[printList.length - 1], 70 * xs + (printList.length - 1) * 25 * xs, 375 * xs, 3)
                await this.sleep(timeout_delay)
                if (state == PAUSE) {
                    lock = false
                    return
                }
                if (newArc2 != null) {
                    arcList[cur.left.key].color = '#FF00FF'
                    newArc2.color = '#FF00FF'
                    bucketList.push(newArc2)
                    await this.move(newArc2, 22.5 * xs, 190 * xs + newArc2.radius + (2 * newArc2.radius + 5 * xs) * (bucketList.length - 1), 2)
                    await this.sleep(timeout_delay)
                    if (state == PAUSE) {
                        lock = false
                        return
                    }
                }
                if (newArc3 != null) {
                    arcList[cur.right.key].color = '#FF00FF'
                    newArc3.color = '#FF00FF'
                    bucketList.push(newArc3)
                    await this.move(newArc3, 22.5 * xs, 190 * xs + newArc3.radius + (2 * newArc3.radius + 5 * xs) * (bucketList.length - 1), 2)
                    await this.sleep(timeout_delay)
                    if (state == PAUSE) {
                        lock = false
                        return
                    }
                }
            }

        }
        lock = false
    },


    async unLock() {
        let security = 0
        return new Promise(resolve => {
            let timer = setInterval(() => {
                if (lock == false || security >= 50) {
                    resolve()
                    clearInterval(timer)
                    return
                }
                security++
            }, 20)
        })
    },

    async sleep(delay = 1000) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, delay)
        })
    },

    notRec() {
        this.select2(4)
    },

    rec() {
        this.select2(5)
    },

    select2(index) {
        if (way2 == index) {
            return
        }
        let btnBgc = this.data.btnBgc
        if (index == 5) {
            btnBgc[3] = 'rgb(211, 211, 211)'
            if (way == 3) {
                btnBgc[0] = 'lightgreen'
                way = 0
            }
        } else {
            btnBgc[3] = 'lightblue'
        }
        btnBgc[way2] = 'lightblue'
        btnBgc[index] = '#FFDEAD'
        this.setData({
            btnBgc,
        })
        way2 = index
        this.reStart()
    },

    clear() {
        this.setData({
            inputValue: ''
        })
    }

})