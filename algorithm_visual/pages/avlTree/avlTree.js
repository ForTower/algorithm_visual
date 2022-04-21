const app = getApp()
const deviceWidth = app.globalData.width
const xs = deviceWidth / 375
const PAUSE = false,
    PLAY = true
const dis = [100 * xs, 40 * xs, 25 * xs, 8 * xs, 5 * xs]
const lightgray = 'rgb(211, 211, 211)'


function TreeNode(value) {
    this.value = value
    this.height = 1
    this.left = null
    this.right = null
    this.parent = null
    this.x = 0
    this.y = 0
    this.leftLine = null
    this.rightLine = null
    this.layer = -1
    this.ax = 0
    this.ay = 0
    this.disx = 0
    this.disy = 0
    this.speedx = 0
    this.speedy = 0
    this.textColor = 'blue'
    this.color = '#54bd68'
}


TreeNode.prototype.balanceFactor = function () {
    let leftHeight = this.left === null ? 0 : this.left.height
    let rightHeight = this.right === null ? 0 : this.right.height
    return leftHeight - rightHeight
}

TreeNode.prototype.isBalanced = function () {
    return Math.abs(this.balanceFactor()) <= 1
}


TreeNode.prototype.updateHeight = function () {
    let leftHeight = this.left === null ? 0 : this.left.height
    let rightHeight = this.right === null ? 0 : this.right.height
    this.height = 1 + Math.max(leftHeight, rightHeight)
}

TreeNode.prototype.tallerChild = function () {
    let leftHeight = this.left === null ? 0 : this.left.height
    let rightHeight = this.right === null ? 0 : this.right.height
    if (leftHeight > rightHeight) {
        return this.left
    }
    if (leftHeight < rightHeight) {
        return this.right
    }
    return this.isLeftChild() ? this.left : this.right
}

TreeNode.prototype.isLeftChild = function () {
    return this.parent !== null && this === this.parent.left
}

TreeNode.prototype.isRightChild = function () {
    return this.parent !== null && this === this.parent.right
}


TreeNode.prototype.setProperties = function (x, y, color, height) {
    this.x = x
    this.y = y
    this.color = color
    this.height = height
}

TreeNode.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.arc(this.x, this.y, 8 * xs, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.font = 'bold ' + 8 * xs + 'px serif'
    ctx.fillText(this.value, this.x, this.y)
    ctx.fillStyle = this.textColor
    ctx.font = 'bold ' + 12 * xs + 'px serif'
    ctx.fillText(this.height, this.x - 10 * xs, this.y - 10 * xs)
}

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

function Arc(x, y) {
    this.x = x
    this.y = y
}

Arc.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.textAlign = 'center'
    ctx.strokeStyle = 'green'
    ctx.lineWidth = 2
    ctx.arc(this.x, this.y, 10 * xs, 0, Math.PI * 2)
    ctx.stroke()
}

function Text(x, y, text) {
    this.x = x
    this.y = y
    this.text = text
}

Text.prototype.draw = function (ctx) {
    ctx.beginPath()
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.font = 'bold ' + 8 * xs + 'px serif'
    ctx.fillText(this.text, this.x, this.y)
}

let timeout_delay = 500
let moveSpeed = 50
// 遍历的动画的速度
let moveSpeed2 = 35
let root = null,
    node = null

// 可视化过程中的提示信息
let msg = ''
let state = PLAY
let printList = []
// 遍历移动的圆环
let arc = null

Page({
    onShow() {
        this.setData({
            canvasWidth: deviceWidth,
            canvasHeight: 400 * xs,
            inputValue: Math.ceil(Math.random() * 998),
            btnBgc: ['white', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue'],
            speed: 600,
            isBin: false
        })

        const query = wx.createSelectorQuery()
        query.select('#avlTreeCanvas')
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
            })
        this.initVal()
    },

    initVal() {
        timeout_delay = 500
        moveSpeed = 50
        moveSpeed2 = 35
        msg = ''
        root = null
        state = PLAY
        node = null
        printList.length = 0
        arc = null
    },


    drawTipMsg(msg) {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, 50 * xs)
        this.ctx.beginPath()
        this.ctx.textAlign = 'start'
        this.ctx.fillStyle = 'black'
        this.ctx.font = 'bold ' + 10 * xs + 'px serif'
        this.ctx.fillText(msg, 20 * xs, 10 * xs)
    },

    reDraw() {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        this.drawTipMsg(msg)
        this.drawLines(root)
        this.drawArcs(root)
        if (node !== null) {
            node.draw(this.ctx)
        }

    },

    drawLines(cur) {
        if (cur === null) {
            return
        }
        if (cur.leftLine !== null) {
            cur.leftLine.draw(this.ctx)
        }
        if (cur.rightLine !== null) {
            cur.rightLine.draw(this.ctx)
        }
        this.drawLines(cur.left)
        this.drawLines(cur.right)
    },

    drawArcs(cur) {
        if (cur === null) {
            return
        }
        cur.draw(this.ctx)
        this.drawArcs(cur.left)
        this.drawArcs(cur.right)
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

        // 把底部的打印的内容先清空
        this.ctx.clearRect(0, this.data.canvasHeight - 110 * xs, this.data.canvasWidth, 110 * xs)

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

    async printVisual() {
        if (root === null) {
            msg = 'AVL树为空，打印失败'
            this.drawTipMsg(msg)
            return Promise.resolve()
        }
        printList.length = 0
        msg = 'Printing the AVL Trees'
        this.drawTipMsg(msg)
        arc = new Arc(root.x, root.y)
        this.drawPrintMsg()
        await this.inOrder(root)
        await this.sleep(100)
        arc = null
        this.drawPrint()
        return Promise.resolve()
    },

    drawPrintMsg() {
        this.ctx.beginPath()
        this.ctx.textAlign = 'start'
        this.ctx.fillStyle = 'black'
        this.ctx.font = 'bold ' + 10 * xs + 'px serif'
        this.ctx.fillText('Print:', 8 * xs, this.data.canvasHeight - 100 * xs)
    },

    drawPrint() {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        this.drawTipMsg(msg)
        this.reDraw()
        if (arc !== null) {
            arc.draw(this.ctx)
        }
        this.drawPrintMsg()
        for (let i = 0; i < printList.length; i++) {
            printList[i].draw(this.ctx)
        }
    },

    async inOrder(cur) {
        if (cur == null) {
            return Promise.resolve()
        }
        await this.printing(arc, cur.x, cur.y)
        if (cur.left != null) {
            await this.inOrder(cur.left)
            await this.printing(arc, cur.x, cur.y)
        }
        let node = new TreeNode(cur.value)
        node.setProperties(cur.x, cur.y, cur.color, '')
        let marginLeft = 30 * xs + printList.length % 16 * 19 * xs
        let top = this.data.canvasHeight - 80 * xs + Math.floor(printList.length / 16) * 21 * xs
        await this.printing(node, marginLeft, top)
        printList.push(node)
        if (cur.right != null) {
            await this.inOrder(cur.right)
            await this.printing(arc, cur.x, cur.y)
        }
        return Promise.resolve()
    },

    async printing(target, dx, dy) {
        let speedx = Math.abs(target.x - dx) / moveSpeed2
        let speedy = Math.abs(target.y - dy) / moveSpeed2
        let ax = target.x,
            ay = target.y
        if (speedx == 0 && speedy == 0) {
            return Promise.resolve()
        }
        let security = 0
        let that = this
        return new Promise(resolve => {
            let handlerId = that.canvas.requestAnimationFrame(function render() {
                if (security >= moveSpeed2 || state === PAUSE) {
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
                that.drawPrint()
                target.draw(that.ctx)
                that.canvas.requestAnimationFrame(render)
            })
        })
    },



    clearVisual() {
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        // 讲以下变量恢复至最初的状态
        // 根节点
        root = null
        state = PLAY
        // 新增节点
        node = null
        // 打印结果数组
        printList.length = 0
        // 遍历移动的圆环
        arc = null
    },

    async findVisual(value) {
        if (root === null) {
            msg = 'AVL树为空，查找失败'
            this.drawTipMsg(msg)
            return Promise.resolve()
        }
        msg = 'Searching for: ' + value
        this.drawTipMsg(msg)
        let res = await this.findNode(value)
        if (res === null) {
            msg = 'Searching for: ' + value + ' (Element not found)'
        } else {
            msg = 'Found: ' + value
        }
        await this.sleep(100)
        this.restore(root, value)
        this.reDraw()
        return Promise.resolve()
    },

    async deleteVisual(value) {
        if (root === null) {
            msg = 'AVL树为空，删除失败'
            this.drawTipMsg(msg)
            return Promise.resolve()
        }
        msg = 'Deleting: ' + value
        this.drawTipMsg(msg)
        let res = await this.findNode(value)
        if (res === null) {
            this.restore(root, value)
            this.reDraw()
            msg = 'Element ' + value + ' not found, delete failed'
            this.drawTipMsg(msg)
            return Promise.resolve()
        }

        await this.deleteNode(res)
        msg = 'Deleted: ' + value
        this.drawTipMsg(msg)
        return Promise.resolve()
    },

    async deleteNode(x) {
        if (x.left !== null && x.right !== null) {
            let successor = await this.successor(x)
            x.value = ''
            x.draw(this.ctx)
            let text = new Text(successor.x, successor.y, successor.value)
            await this.textMove(text, x.x, x.y)
            await this.sleep(timeout_delay)
            if (state === PAUSE) {
                return Promise.resolve()
            }
            x.value = successor.value
            x = successor
        }
        this.restore(root, x.value)
        let replacement = x.left === null ? x.right : x.left

        if (replacement === null) {
            if (x === root) {
                root = null
                this.reDraw()
            } else {
                //  删除
                if (this.leftOf(this.parentOf(x)) === x) {
                    x.parent.leftLine = null
                    x.parent.left = null
                } else {
                    x.parent.rightLine = null
                    x.parent.right = null
                }
                this.reDraw()
                await this.sleep(timeout_delay)
                if(state === PAUSE){
                    return Promise.resolve()
                }
                // 删除后调整
                await this.fixAfterDelete(x.parent)
                x.parent = null
            }
        } else {
            // 重新绘制，恢复最初的状态
            if (state === PAUSE) {
                return Promise.resolve()
            }
            replacement.parent = x.parent
            if (root === x) {
                root = replacement
                this.reDraw()
                await this.sleep(timeout_delay)
                if (state === PAUSE) {
                    return Promise.resolve()
                }
                if (this.leftOf(x) === replacement) {
                    await this.moveUpVisual(x, replacement, 1, 0)
                } else {
                    await this.moveUpVisual(x, replacement, -1, 0)
                }
                x.leftLine = x.rightLine = null

            } else if (this.leftOf(this.parentOf(x)) === x) {
                x.parent.leftLine = x.rightLine = x.leftLine = null
                this.reDraw()
                await this.sleep(timeout_delay)
                if (state === PAUSE) {
                    return Promise.resolve()
                }
                x.parent.leftLine = new Line(x.parent.x, x.parent.y, replacement.x, replacement.y, 1, 'black')
                this.reDraw()
                await this.sleep(timeout_delay)
                if (state === PAUSE) {
                    return Promise.resolve()
                }
                x.parent.left = replacement
                await this.moveUpVisual(x.parent, replacement, -1, 1)
                await this.fixAfterDelete(x.parent)
            } else {
                x.parent.rightLine = x.rightLine = x.leftLine = null
                this.reDraw()
                await this.sleep(timeout_delay)
                if (state === PAUSE) {
                    return Promise.resolve()
                }
                x.parent.rightLine = new Line(x.parent.x, x.parent.y, replacement.x, replacement.y, 1, 'black')
                this.reDraw()
                await this.sleep(timeout_delay)
                if (state === PAUSE) {
                    return Promise.resolve()
                }
                x.parent.right = replacement
                await this.moveUpVisual(x.parent, replacement, 1, 1)
                await this.fixAfterDelete(x.parent)
            }
            x.parent = x.left = x.right = null
        }


        return Promise.resolve()
    },

    async fixAfterDelete(node) {
        let replaceVal = node.value
        msg = '删除节点后更新高度,并检查该节点的左右子树高度差是否<=1'
        this.drawTipMsg(msg)
        let tipArc = new Arc(0, 0)
        while (node !== null) {
            node.color = 'orange'
            if (node.isLeftChild()) {
                node.parent.leftLine.color = 'orange'
                node.parent.leftLine.lineWidth = 2
            } 
            if(node.isRightChild()) {
                node.parent.rightLine.color = 'orange'
                node.parent.rightLine.lineWidth = 2
            }
            this.reDraw()
            tipArc.x = node.x
            tipArc.y = node.y
            tipArc.draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state === PAUSE){
                return Promise.resolve()
            }
            // 平衡
            if (node.isBalanced()) {
                let height = node.height
                let leftHeight = node.left === null ? 0 : node.left.height
                let rightHeight = node.right === null ? 0 : node.right.height
                if(height !== Math.max(leftHeight, rightHeight) + 1){
                    node.textColor = 'red'
                    this.reDraw()
                    tipArc.draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if(state === PAUSE){
                        return Promise.resolve()
                    }
                    node.updateHeight()
                    this.reDraw()
                    tipArc.draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if(state === PAUSE){
                        return Promise.resolve()
                    }
                    node.textColor = 'blue'
                    this.reDraw()
                    await this.sleep(timeout_delay)
                    if(state === PAUSE){
                        return Promise.resolve()
                    }
                }
                // 不平衡
            } else {
                this.restore(root, replaceVal)
                await this.reBalance(node)
                await this.sleep(timeout_delay)
                if(state === PAUSE){
                    return Promise.resolve()
                }
            }

            node = node.parent
        }
        this.restore(root, replaceVal)
        this.reDraw()
        return Promise.resolve()
    },


    leftOf(node) {
        return node !== null ? node.left : null
    },

    rightOf(node) {
        return node !== null ? node.right : null
    },

    parentOf(node) {
        return node !== null ? node.parent : null
    },


    async textMove(target, dx, dy) {

        let speedx = Math.abs(target.x - dx) / moveSpeed
        let speedy = Math.abs(target.y - dy) / moveSpeed
        let security = 0
        let that = this
        return new Promise(resolve => {
            let handlerId = that.canvas.requestAnimationFrame(function render() {
                if (security >= moveSpeed || state === PAUSE) {
                    that.canvas.cancelAnimationFrame(handlerId)
                    resolve()
                    return
                }
                if (target.x > dx) {
                    target.x -= speedx
                    if (target.y > dy) {
                        target.y -= speedy
                    } else {
                        target.y += speedy
                    }

                } else {
                    target.x += speedx
                    if (target.y > dy) {
                        target.y -= speedy
                    } else {
                        target.y += speedy
                    }
                }
                security++
                that.reDraw()
                target.draw(that.ctx)
                that.canvas.requestAnimationFrame(render)
            })
        })

    },


    moveUpVisual(parent, replacement, flag, flag2) {
        if (flag2 === 0) {
            replacement.ax = parent.x
            replacement.ay = parent.y
        } else {
            replacement.ax = parent.x + dis[parent.layer + 1] * flag
            replacement.ay = parent.y + 40 * xs
        }

        this.order(replacement, null, -1)
        let security = 0
        let that = this
        return new Promise(resolve => {
            let handlerId = that.canvas.requestAnimationFrame(function render() {
                if (security >= moveSpeed || state == PAUSE) {
                    that.canvas.cancelAnimationFrame(handlerId)
                    resolve()
                    return
                }
                that.preOrder(replacement)
                if (that.leftOf(parent) === replacement) {
                    parent.leftLine.dx = replacement.x
                    parent.leftLine.dy = replacement.y
                } else {
                    parent.rightLine.dx = replacement.x
                    parent.rightLine.dy = replacement.y
                }
                that.reDraw()
                security++
                that.canvas.requestAnimationFrame(render)
            })
        })

    },

    async findNode(value) {
        let cur = root
        let moveArc = new Arc(root.x, root.y)
        while (cur !== null) {
            moveArc.x = cur.x
            moveArc.y = cur.y
            moveArc.draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state === PAUSE) {
                return Promise.resolve(null)
            }
            if (cur.value > value) {
                if (cur.leftLine !== null) {
                    cur.leftLine.lineWidth = 2
                    cur.leftLine.color = 'orange'
                    this.reDraw()
                    await this.sleep(timeout_delay)
                    if (state === PAUSE) {
                        return Promise.resolve(null)
                    }
                }
                cur = cur.left
            } else if (cur.value === value) {
                return Promise.resolve(cur)
            } else {
                if (cur.rightLine !== null) {
                    cur.rightLine.lineWidth = 2
                    cur.rightLine.color = 'orange'
                    this.reDraw()
                    await this.sleep(timeout_delay)
                    if (state === PAUSE) {
                        return Promise.resolve(null)
                    }
                }
                cur = cur.right
            }
        }
        return Promise.resolve(null)
    },

    async successor(node) {
        if (node === null) {
            return Promise.resolve(null)
        }

        let findArc = new Arc(node.x, node.y)

        let mostLeftN = node.right
        let moveArc = null
        if (mostLeftN !== null) {
            node.rightLine.lineWidth = 2
            node.rightLine.color = 'green'
            this.reDraw()
            findArc.draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state === PAUSE) {
                return Promise.resolve(null)
            }
            moveArc = new Arc(mostLeftN.x, mostLeftN.y)
        }
        let pre = mostLeftN
        while (mostLeftN !== null) {
            moveArc.x = mostLeftN.x
            moveArc.y = mostLeftN.y
            moveArc.draw(this.ctx)
            pre = mostLeftN
            await this.sleep(timeout_delay)
            if (state === PAUSE) {
                return Promise.resolve(null)
            }
            if (mostLeftN.leftLine !== null) {
                mostLeftN.leftLine.lineWidth = 2
                mostLeftN.leftLine.color = 'green'
                this.reDraw()
                findArc.draw(this.ctx)
                await this.sleep(timeout_delay)
                if (state === PAUSE) {
                    return Promise.resolve(null)
                }
            }
            mostLeftN = mostLeftN.left
        }
        return Promise.resolve(pre)
    },









    async insertVisual(value) {
        // 在手机屏幕的左上角显示 Inserting: value,提示用户此时需要插入的值
        msg = 'Inserting: ' + value
        this.drawTipMsg(msg)
        node = new TreeNode(value)
        if (root === null) {
            root = node
            root.x = deviceWidth / 2
            root.y = 70 * xs
            root.draw(this.ctx)
            msg = 'Inserted: ' + value
            this.drawTipMsg(msg)
            node = null
            return Promise.resolve()
        }

        node.x = 28 * xs
        node.y = 35 * xs
        node.draw(this.ctx)
        await this.sleep(timeout_delay)
        if (state === PAUSE) {
            return Promise.resolve()
        }

        let moveArc = new Arc(root.x, root.y)
        let layerC = -1
        let cur = root
        let pre = root
        while (cur != null) {
            moveArc.x = cur.x
            moveArc.y = cur.y
            moveArc.draw(this.ctx)
            await this.sleep(timeout_delay)
            if (state === PAUSE) {
                return Promise.resolve()
            }
            pre = cur
            layerC++
            if (cur.value > value) {
                if (cur.leftLine != null) {
                    cur.leftLine.lineWidth = 2
                    cur.leftLine.color = 'orange'
                    this.reDraw()
                    await this.sleep(timeout_delay)
                    if (state === PAUSE) {
                        return Promise.resolve()
                    }
                }
                cur = cur.left
            } else if (cur.value == value) {
                wx.showToast({
                    title: '该值已存在，插入失败',
                    icon: 'none',
                    duration: 1000
                })
                this.restore(root, value)
                msg = '该值已存在，插入失败'
                this.reDraw()
                node = null
                return Promise.resolve()
            } else {
                if (cur.rightLine != null) {
                    cur.rightLine.lineWidth = 2
                    cur.rightLine.color = 'orange'
                    this.reDraw()
                    await this.sleep(timeout_delay)
                    if (state === PAUSE) {
                        return Promise.resolve()
                    }
                }
                cur = cur.right
            }
        }

        this.restore(root, value)
        if (layerC >= 5) {
            wx.showToast({
                title: 'AVL树的高度不能大于6',
                icon: 'none',
                duration: 1000
            })
            msg = 'AVL树的高度不能大于6，插入失败'
            this.reDraw()
            node = null
            return Promise.resolve()
        }


        if (pre.value > value) {
            pre.left = node
            pre.leftLine = new Line(pre.x, pre.y, node.x, node.y, 1, 'black')
            await this.arcMove(pre, node, pre.x - dis[layerC], pre.y + 40 * xs)

        } else {
            pre.right = node
            pre.rightLine = new Line(pre.x, pre.y, node.x, node.y, 1, 'black')
            await this.arcMove(pre, node, pre.x + dis[layerC], pre.y + 40 * xs)
        }


        node.layer = layerC
        node.parent = pre
        let ins = node
        node = null
        await this.sleep(timeout_delay)
        if (state === PAUSE) {
            return Promise.resolve()
        }
        await this.fixAfterInsert(ins)
        msg = 'Inserted: ' + value
        this.drawTipMsg(msg)
        return Promise.resolve()
    },

    // 插入的节点移动到指定的位置
    async arcMove(parent, target, dx, dy) {
        let speedx = Math.abs(target.x - dx) / moveSpeed
        let speedy = Math.abs(target.y - dy) / moveSpeed
        let ax = target.x,
            ay = target.y
        if (speedx == 0 && speedy == 0) {
            return Promise.resolve()
        }
        let security = 0
        let that = this
        let line = parent.left === target ? parent.leftLine : parent.rightLine
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
                line.dx = target.x
                line.dy = target.y
                security++
                that.reDraw()
                that.canvas.requestAnimationFrame(render)
            })
        })
    },



    restore(cur, value) {
        while (cur !== null) {
            cur.color = '#54bd68'
            if (cur.value > value) {
                if (cur.leftLine !== null) {
                    cur.leftLine.lineWidth = 1
                    cur.leftLine.color = 'black'
                }
                cur = cur.left
            } else {
                if (cur.rightLine !== null) {
                    cur.rightLine.lineWidth = 1
                    cur.rightLine.color = 'black'
                }
                cur = cur.right
            }
        }
    },

    // 插入后调整
    async fixAfterInsert(node) {
        msg = '插入节点后更新高度,并检查该节点的左右子树高度差是否<=1'
        this.drawTipMsg(msg)
        let tipArc = new Arc(0, 0)
        while (node.parent !== null) {
            node.color = 'orange'
            if (node.isLeftChild()) {
                node.parent.leftLine.color = 'orange'
                node.parent.leftLine.lineWidth = 2
            } else {
                node.parent.rightLine.color = 'orange'
                node.parent.rightLine.lineWidth = 2
            }
            this.reDraw()
            tipArc.x = node.parent.x
            tipArc.y = node.parent.y
            tipArc.draw(this.ctx)
            await this.sleep(timeout_delay)
            if(state === PAUSE){
                return Promise.resolve()
            }
            node = node.parent

            // 平衡
            if (node.isBalanced()) {
                let height = node.height
                let leftHeight = node.left === null ? 0 : node.left.height
                let rightHeight = node.right === null ? 0 : node.right.height
                if(height !== Math.max(leftHeight, rightHeight) + 1){
                    node.textColor = 'red'
                    this.reDraw()
                    tipArc.draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if(state === PAUSE){
                        return Promise.resolve()
                    }
                    node.updateHeight()
                    this.reDraw()
                    tipArc.draw(this.ctx)
                    await this.sleep(timeout_delay)
                    if(state === PAUSE){
                        return Promise.resolve()
                    }
                    node.textColor = 'blue'
                    this.reDraw()
                    await this.sleep(timeout_delay)
                    if(state === PAUSE){
                        return Promise.resolve()
                    }
                }
                // 不平衡
            } else {
                this.restore(node, this.data.inputValue)
                await this.reBalance(node)
                break
            }
        }
        this.restore(root, this.data.inputValue)
        this.reDraw()
        return Promise.resolve()
    },

    async reBalance(grand) {
        let tipArc = new Arc(0, 0)
        let parent = grand.tallerChild()
        let node = parent.tallerChild()
        if (parent.isLeftChild()) {
            if (node.isLeftChild()) { // LL
                msg = 'LL型，单旋转（右旋转）'
                this.drawTipMsg(msg)
                tipArc.x = grand.x
                tipArc.y = grand.y
                tipArc.draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state === PAUSE){
                    return Promise.resolve()
                }
                await this.rightRotate(grand)
            } else { // LR
                msg = 'LR型，双旋转（先左旋转）'
                this.drawTipMsg(msg)
                tipArc.x = parent.x
                tipArc.y = parent.y
                tipArc.draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state === PAUSE){
                    return Promise.resolve()
                }
                await this.leftRotate(parent)
                msg = 'LR型，双旋转（后右旋转）'
                this.drawTipMsg(msg)
                tipArc.x = grand.x
                tipArc.y = grand.y
                tipArc.draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state === PAUSE){
                    return Promise.resolve()
                }
                await this.rightRotate(grand)
            }
        } else {
            if (node.isRightChild()) { // RR
                msg = 'RR型，单旋转（左旋转）'
                this.drawTipMsg(msg)
                tipArc.x = grand.x
                tipArc.y = grand.y
                tipArc.draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state === PAUSE){
                    return Promise.resolve()
                }
                await this.leftRotate(grand)
            } else { // RL
                msg = 'RL型，双旋转（先右旋转）'
                this.drawTipMsg(msg)
                tipArc.x = parent.x
                tipArc.y = parent.y
                tipArc.draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state === PAUSE){
                    return Promise.resolve()
                }
                await this.rightRotate(parent)
                msg = 'RL型，双旋转（后左旋转）'
                this.drawTipMsg(msg)
                tipArc.x = grand.x
                tipArc.y = grand.y
                tipArc.draw(this.ctx)
                await this.sleep(timeout_delay)
                if(state === PAUSE){
                    return Promise.resolve()
                }
                await this.leftRotate(grand)
            }
        }
        return Promise.resolve()
    },

    // 左旋
    async leftRotate(node) {
        if (node === null) {
            return
        }
        //-1代表左旋
        // node, node.left, node.left.right, 1
        await this.rotateVisual(node, node.right, node.right.left, -1)
        if (state === PAUSE) {
            return Promise.resolve()
        }
        let right = node.right

        node.right = right.left
        node.rightLine = null
        if (right.left !== null) {
            node.rightLine = new Line(node.x, node.y, right.left.x, right.left.y, 1, 'black')
            right.left.parent = node
        }
        if (node.parent === null) {
            root = right
        } else if (node.parent.left === node) {
            node.parent.left = right
        } else {
            node.parent.right = right
        }
        right.parent = node.parent
        node.parent = right
        right.left = node
        right.leftLine = new Line(right.x, right.y, node.x, node.y, 1, 'black')
        msg = '左旋转后更新高度'
        this.drawTipMsg(msg)
        node.textColor = right.textColor = 'red'
        this.reDraw()
        await this.sleep(timeout_delay)
        if(state === PAUSE){
            return Promise.resolve()
        }
        // 更新高度
        node.updateHeight()
        right.updateHeight()
        this.reDraw()
        await this.sleep(timeout_delay)
        if(state === PAUSE){
            return Promise.resolve()
        }
        node.textColor = right.textColor = 'blue'
        this.reDraw()
        return Promise.resolve()
    },

    // 右旋
    async rightRotate(node) {
        if (node === null) {
            return
        }
        // 1 代表右旋
        await this.rotateVisual(node, node.left, node.left.right, 1)
        let left = node.left
        node.left = left.right
        node.leftLine = null
        if (left.right !== null) {
            node.leftLine = new Line(node.x, node.y, left.right.x, left.right.y, 1, 'black')
            left.right.parent = node
        }

        if (node.parent === null) {
            root = left
        } else if (node.parent.left === node) {
            node.parent.left = left
        } else {
            node.parent.right = left
        }
        left.parent = node.parent
        left.right = node
        left.rightLine = new Line(left.x, left.y, node.x, node.y, 1, 'black')
        node.parent = left
        msg = '右旋转后更新高度'
        this.drawTipMsg(msg)
        await this.sleep(timeout_delay)
        if(state === PAUSE){
            return Promise.resolve()
        }        
        node.textColor = left.textColor = 'red'
        this.reDraw()
        await this.sleep(timeout_delay)
        if(state === PAUSE){
            return Promise.resolve()
        }
        node.updateHeight()
        left.updateHeight()
        this.reDraw()
        await this.sleep(timeout_delay)
        if(state === PAUSE){
            return Promise.resolve()
        }
        node.textColor = left.textColor = 'blue'
        this.reDraw()
        return Promise.resolve()
    },

    // 旋转可视化
    async rotateVisual(node1, node2, node3, flag) {

        let d = Math.abs(node2.x - (node1.x + dis[node1.layer + 1] * flag))

        node1.ax = node1.x + dis[node1.layer + 1] * flag
        node1.ay = node1.y + 40 * xs
        this.order(node1, node2, 1)
        if (node3 !== null) {
            node3.ax = node1.ax - dis[node1.layer + 1] * flag
            node3.ay = node1.ay + 40 * xs
            this.order(node3, null, 0)
        }
        node2.ax = node2.x + dis[node1.layer] * flag
        node2.ay = node2.y - 40 * xs
        this.order(node2, node3, -1)


        let security = 0
        let that = this
        return new Promise(resolve => {
            let handlerId = that.canvas.requestAnimationFrame(function render() {
                if (security >= moveSpeed || state === PAUSE) {
                    that.canvas.cancelAnimationFrame(handlerId)
                    resolve()
                    return
                }
                that.preOrder(node1)
                that.preOrder2(node1, node3, d)
                that.reDraw()
                security++
                that.canvas.requestAnimationFrame(render)
            })
        })
    },

    // 计算每个节点要去的地方
    order(node1, node2, flag) {
        if (node1 === null || node1 === node2) {
            return
        }
        node1.layer += flag
        if (node1.left !== null) {
            node1.left.ax = node1.ax - dis[node1.layer + 1]
            node1.left.ay = node1.ay + 40 * xs
            this.order(node1.left, node2, flag)
        }
        node1.disx = Math.abs(node1.ax - node1.x)
        node1.speedx = node1.disx / moveSpeed
        node1.disy = Math.abs(node1.ay - node1.y)
        node1.speedy = node1.disy / moveSpeed
        if (node1.right !== null) {
            node1.right.ax = node1.ax + dis[node1.layer + 1]
            node1.right.ay = node1.ay + 40 * xs
            this.order(node1.right, node2, flag)
        }
    },


    // 改变每个节点的坐标
    preOrder(cur) {
        if (cur === null) {
            return
        }

        if (cur.x > cur.ax) {
            cur.x -= cur.speedx
            if (cur.y > cur.ay) {
                cur.y -= cur.speedy
            } else {
                cur.y += cur.speedy
            }

        } else {
            cur.x += cur.speedx
            if (cur.y > cur.ay) {
                cur.y -= cur.speedy
            } else {
                cur.y += cur.speedy
            }
        }
        this.preOrder(cur.left)
        this.preOrder(cur.right)
    },


    // 计算每一条线的坐标
    preOrder2(cur, node3, d) {
        if (cur === null) {
            return
        }
        if (cur.left !== null) {
            if (cur.left === node3) {
                cur.leftLine.x -= d / moveSpeed
            } else {
                cur.leftLine.x = cur.x
                cur.leftLine.y = cur.y
            }
            cur.leftLine.dx = cur.left.x
            cur.leftLine.dy = cur.left.y
            this.preOrder2(cur.left, node3, d)
        }
        if (cur.right !== null) {

            if (cur.right === node3) {
                cur.rightLine.x += d / moveSpeed
            } else {
                cur.rightLine.x = cur.x
                cur.rightLine.y = cur.y
            }

            cur.rightLine.dx = cur.right.x
            cur.rightLine.dy = cur.right.y
            this.preOrder2(cur.right, node3, d)
        }
    },

    onHide() {
        state = PAUSE
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    },

    onUnload() {
        state = PAUSE
    },


    async sleep(delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, delay)
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

    random() {
        if (this.data.btnBgc[1] === lightgray) {
            return
        }
        this.setData({
            inputValue: Math.ceil(Math.random() * 998)
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
        moveSpeed2++
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
        moveSpeed2--
        timeout_delay -= 100
        if (moveSpeed > 30) {
            moveSpeed -= 10
        }
        this.setData({
            speed: this.data.speed + 100
        })
    }


})