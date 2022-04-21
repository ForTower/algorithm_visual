let app = getApp()
let deviceWidth = app.globalData.width
let xs = deviceWidth / 375

// 选择方式，默认选择方式是"栈：数组实现"
let select = 0
// 演示的每一步延迟的时间
let timeout_delay = 500
let nodeList = [],
  indexList = []

const PLAY = true,
  PAUSE = false
let state = PLAY,
  lock = false

function Node(x, y, width, height) {
  this.x = x
  this.y = y
  this.width = width
  this.height = height
  this.num = ''
  this.color = 'white'
  this.next = null
  this.arrow = null
}

let width = 35 * xs
let marginLeft = (deviceWidth - 10 * width) / 2

let head = new Node(marginLeft + 35 * xs, 80 * xs, 20 * xs, 20 * xs)
let tail = new Node(marginLeft + 60 * xs, 260 * xs, 20 * xs, 20 * xs)
let newNode = null
// 链表节点的数量
let nodeCount = 0
let msg = ''
Node.prototype.drawNode = function (ctx) {
  ctx.beginPath()
  ctx.strokeStyle = 'gray'
  ctx.lineWidth = 2 * xs
  ctx.fillStyle = this.color
  ctx.rect(this.x, this.y, this.width, this.height)
  ctx.stroke()
  ctx.fill()
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.fillText(this.num, this.x + this.width / 2, this.y + this.height / 2)
}

Node.prototype.drawDivider = function (ctx) {
  ctx.beginPath()
  ctx.strokeStyle = 'gray'
  ctx.lineWidth = 2 * xs
  ctx.moveTo(this.x + this.width, this.y)
  ctx.lineTo(this.x + this.width + 6 * xs, this.y)
  ctx.lineTo(this.x + this.width + 6 * xs, this.y + this.height)
  ctx.lineTo(this.x + this.width, this.height + this.y)
  ctx.stroke()
}

function Arrow(x, y, dx, dy) {
  this.x = x
  this.y = y
  this.dx = dx
  this.dy = dy
}

Arrow.prototype.drawArrow = function (ctx) {
  ctx.beginPath()
  ctx.strokeStyle = 'gray'
  ctx.lineWidth = 1 * xs
  ctx.moveTo(this.x, this.y)
  ctx.lineTo(this.dx, this.dy)
  ctx.stroke()
  let flag = this.dx >= this.x ? 1 : 2
  let degree = Math.atan((this.dy - this.y) / (this.dx - this.x))
  ctx.beginPath()
  ctx.moveTo(this.dx, this.dy)
  ctx.lineTo(this.dx + 7 * xs * Math.cos(flag * Math.PI + degree - Math.PI / 180 * 15),
    this.dy + 7 * xs * Math.sin(flag * Math.PI + degree - Math.PI / 180 * 15))
  ctx.moveTo(this.dx, this.dy)
  ctx.lineTo(this.dx + 7 * xs * Math.cos(flag * Math.PI + degree + Math.PI / 180 * 15),
    this.dy + 7 * xs * Math.sin(flag * Math.PI + degree + Math.PI / 180 * 15))
  ctx.lineTo(this.dx + 7 * xs * Math.cos(flag * Math.PI + degree - Math.PI / 180 * 15),
    this.dy + 7 * xs * Math.sin(flag * Math.PI + degree - Math.PI / 180 * 15))
  ctx.fill()
}

function Index(x, y, index) {
  this.x = x
  this.y = y
  this.index = index
}

Index.prototype.drawIndex = function (ctx) {
  ctx.beginPath()
  ctx.fillStyle = 'red'
  ctx.textAlign = 'center'
  ctx.fillText(this.index, this.x, this.y)
}

function Text(x, y, text) {
  this.x = x
  this.y = y
  this.text = text
}

Text.prototype.drawText = function (ctx) {
  ctx.beginPath()
  ctx.textAlign = 'center'
  ctx.fillText(this.text, this.x, this.y)
}

let textList = []

function Arc(x, y, radius, color) {
  this.x = x
  this.y = y
  this.radius = radius
  this.color = color
}

Arc.prototype.drawArc = function (ctx) {
  ctx.beginPath()
  ctx.lineWidth = 2 * xs
  ctx.strokeStyle = this.color
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
  ctx.stroke()
}
let arcList = []
Page({
  data: {
    // 按钮的背景颜色
    // 0：“栈：数组实现”按钮的背景颜色
    // 1：“栈：链表实现”按钮的背景颜色
    // 2：“队列：数组实现”按钮的背景颜色
    // 3：“队列：链表实现”按钮的背景颜色
    // 4：“Push” 按钮的背景颜色
    // 5: "Pop" 按钮的背景颜色
    // 6："Clear"按钮的背景颜色
    btnBgc: ['lightgreen', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'lightblue', 'white'],
    speed: 600, //演示的初始速度,
    value: '', //用户文本框输入的值
    canvasWidth: deviceWidth,
    canvasHeight: 400 * xs,
    index: 0,
    index2: 0,
    count: 0, // 数组队列中元素的数量
    isBin: false,
    ope1: 'Push',
    ope2: 'Pop'
  },

  onHide() {
    state = PAUSE
  },

  onUnload() {
    state = PAUSE
  },

  onShow() {
    timeout_delay = 500
    select = 0
    state = PLAY
    nodeCount = 0
    
    let cur = head
    let pre = null
    while (cur != null) {
      pre = cur
      cur.next = null
      cur.arrow = null
      cur = pre.next
    }
    nodeCount = 0
    tail.next = null
    tail.arrow = null


    this.setData({
      index: 0,
      index2: 0,
      speed: 600, //演示的初始速度,
      value: Math.ceil(Math.random() * 998), //用户文本框输入的值,
      isBin: false,
      ope1: 'Push',
      ope2: 'Pop',
      count: 0,
      btnBgc: ['lightgreen', 'lightblue', 'lightblue', 'lightblue', 'white', 'lightblue', 'lightblue', 'lightblue', 'lightblue'],
    })
    const query = wx.createSelectorQuery()
    query.select('#basicsCanvas')
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
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        this.ctx.font = 'bold ' + 12 * xs + 'px serif'
        this.initCanvas()
      })
  },

  random(){
    if(this.data.btnBgc[5] === 'rgb(211, 211, 211)'){
      return
    }
    this.setData({
      value: Math.ceil(Math.random() * 998)
    })
  },

  initCanvas() {
    let width = 35 * xs
    let marginLeft = (deviceWidth - 10 * width) / 2
    let marginTop = 150 * xs
    let node = null,
      index = null
    for (let i = 0; i < 20; i++) {
      if (i <= 9) {
        node = new Node(marginLeft + i * width, marginTop, width, 30 * xs)
      } else {
        node = new Node(marginLeft + (i - 10) * width, marginTop + 85 * xs, width, 30 * xs)
      }
      index = new Index(node.x + node.width / 2, node.y + node.height + 15 * xs, i)
      index.drawIndex(this.ctx)
      node.drawNode(this.ctx)
      nodeList[i] = node
      indexList[i] = index
    }
    nodeList[20] = new Node(marginLeft + 35 * xs, 80 * xs, width, 30 * xs)
    nodeList[20].num = this.data.index
    nodeList[20].drawNode(this.ctx)

    nodeList[21] = new Node(marginLeft + 110 * xs, 80 * xs, width, 30 * xs)
    nodeList[21].num = this.data.index2
    arcList[0] = new Arc(nodeList[20].x + width / 2, nodeList[20].y + 15 * xs, 10 * xs, 'white')
    arcList[0].drawArc(this.ctx)
    this.ctx.beginPath()
    this.ctx.textAlign = 'start'
    this.fillStyle = 'black'
    this.ctx.fillText('Top', marginLeft, 95 * xs)
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

  // 当用户点击Push按钮时触发
  async in() {
    let width = 35 * xs
    let marginLeft = (deviceWidth - 10 * width) / 2
    let btnBgc = this.data.btnBgc
    if (this.data.value == '') {
      wx.showToast({
        title: '输入不能为空',
        icon: 'none',
        duration: 1000
      })
      return
    }
    if (this.data.index >= 20 ||
      this.data.count >= 20) {
      return
    }

    if (nodeCount == 8) {
      wx.showToast({
        title: '最多只能添加8个节点',
        icon: 'none',
        duration: 1000
      })
      return
    }

    for (let i = 6; i <= 8; i++) {
      if (btnBgc[i] == 'rgb(211, 211, 211)') {
        return
      }
    }
    await this.unLock()
    lock = true
    state = PLAY
    for(let i = 4; i <= 8; i ++){
      btnBgc[i] = 'rgb(211, 211, 211)'
    }
    this.setData({
      btnBgc,
      isBin: true
    })
    this.ctx.clearRect(0, 0, this.data.canvasWidth, 60 * xs)
    switch (select) {
      // 栈：数组实现
      case 0:
        this.arrayPushProcess(width, marginLeft)
        break
        // 栈：链表实现
      case 1:
        this.linkPushProcess(marginLeft)
        break
        // 队列：数组实现
      case 2:
        this.arrayEnqueueProcess(width, marginLeft)
        break
        // 队列：链表实现
      case 3:
        this.linkEnqueueProcess(marginLeft)
        break
    }
  },

  nodeMove2() {
    this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    this.drawTipMessage(msg, marginLeft)
    this.originalLinkQueueCanvas()
    let cur = head.next
    while (cur != null && cur.next != null) {
      cur.drawNode(this.ctx)
      cur.drawDivider(this.ctx)
      if (cur.arrow != null) {
        cur.arrow.drawArrow(this.ctx)
      }
      cur = cur.next
    }
    newNode.drawNode(this.ctx)
    newNode.drawDivider(this.ctx)
    if (cur != null) {
      cur.drawNode(this.ctx)
      cur.drawDivider(this.ctx)
      cur.arrow.dx = newNode.x
      cur.arrow.dy = newNode.y + newNode.height / 2
      cur.arrow.drawArrow(this.ctx)
    }

    if (head.next == null) {
      head.arrow.dx = newNode.x
      head.arrow.dy = newNode.y + newNode.height / 2
      head.arrow.drawArrow(this.ctx)
    } else {
      head.arrow.drawArrow(this.ctx)
    }
    tail.arrow.dx = newNode.x
    tail.arrow.dy = newNode.y + newNode.height / 2
    tail.arrow.drawArrow(this.ctx)
  },


  async linkEnqueueProcess(marginLeft) {
    nodeCount++
    msg = 'Enqueuing value:'
    this.drawTipMessage('Enqueuing value:', marginLeft)
    let text = new Text(marginLeft + 130 * xs, 40 * xs, this.data.value)
    text.drawText(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    newNode = new Node(marginLeft + 150 * xs, 60 * xs, 20 * xs, 20)
    newNode.drawNode(this.ctx)
    newNode.drawDivider(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    await this.move(text, newNode.x + newNode.width / 2, newNode.y + newNode.height / 2, 'text')
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    newNode.num = this.data.value
    if (tail.next == null) {
      tail.arrow = new Arrow(tail.x + tail.width / 2, tail.y + tail.height / 2, newNode.x, newNode.y + newNode.height / 2)
      head.arrow = new Arrow(head.x + head.width / 2, head.y + head.height / 2, newNode.x, newNode.y + newNode.height / 2)
      tail.arrow.drawArrow(this.ctx)
      head.arrow.drawArrow(this.ctx)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
    } else {
      tail.next.arrow = new Arrow(tail.next.x + tail.next.width + 2 * xs, tail.next.y + tail.next.height / 2, newNode.x, newNode.y + newNode.height / 2)
      tail.next.arrow.drawArrow(this.ctx)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
      tail.arrow = null
      this.textMove(text)
      tail.next.arrow.drawArrow(this.ctx)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
      tail.arrow = new Arrow(tail.x + tail.width / 2, tail.y + tail.height / 2, newNode.x, newNode.y + newNode.height / 2)
      tail.arrow.drawArrow(this.ctx)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
    }
    await this.move(newNode, marginLeft + (nodeCount - 1) * (newNode.width + 20 * xs), 150 * xs, 'node2')
    if (head.next == null) {
      head.next = newNode
      tail.next = newNode
    } else {
      tail.next.next = newNode
      tail.next = newNode
    }
    this.ctx.clearRect(0, 0, this.data.canvasWidth, 60 * xs)
    let btnBgc = this.data.btnBgc
    btnBgc[5] = btnBgc[6] = btnBgc[7] = btnBgc[8] = 'lightblue'
    btnBgc[4] = 'white'
    this.setData({
      btnBgc,
      isBin: false,
      value: Math.ceil(Math.random() * 998)
    })
    lock = false
  },

  async linkPushProcess(marginLeft) {
    nodeCount++
    msg = 'Pushing value:'
    this.drawTipMessage('Pushing value:', marginLeft)
    let text = new Text(marginLeft + 120 * xs, 40 * xs, this.data.value)
    text.drawText(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    newNode = new Node(marginLeft + 150 * xs, 60 * xs, 20 * xs, 20 * xs)
    newNode.drawNode(this.ctx)
    newNode.drawDivider(this.ctx)
    await this.sleep(timeout_delay)
    await this.move(text, newNode.x + newNode.width / 2, newNode.y + newNode.height / 2, 'text')
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    newNode.next = head.next
    if (head.next != null) {
      newNode.arrow = new Arrow(newNode.x + newNode.width + 2 * xs,
        newNode.y + newNode.height / 2,
        head.next.x,
        head.next.y + head.height / 2)
      newNode.arrow.drawArrow(this.ctx)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
    }
    head.next = newNode
    head.arrow = new Arrow(head.x + head.width / 2, head.y + head.height / 2, newNode.x, newNode.y + newNode.height / 2)
    this.textMove(text, 'push')
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    newNode.num = this.data.value
    await this.move(newNode, marginLeft, 150 * xs, 'node')
    this.ctx.clearRect(0, 0, this.data.canvasWidth, 60 * xs)
    if (state == PAUSE) {
      lock = false
      return
    }
    let btnBgc = this.data.btnBgc
    btnBgc[5] = btnBgc[6] = btnBgc[7] = btnBgc[8] = 'lightblue'
    btnBgc[4] = 'white'
    this.setData({
      btnBgc,
      isBin: false,
      value: Math.ceil(Math.random() * 998)
    })
    lock = false
  },

  nodeMove() {
    this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    this.drawTipMessage('Pushing value:', marginLeft)
    this.originalLinkStackCanvas()
    let cur = head.next
    let step = (cur.width + 20 * xs) / 30
    let tmp = cur.next
    while (tmp != null) {
      tmp.x += step
      tmp.drawNode(this.ctx)
      tmp.drawDivider(this.ctx)
      if (tmp.arrow != null) {
        tmp.arrow.x += step
        tmp.arrow.dx += step
        tmp.arrow.drawArrow(this.ctx)
      }
      tmp = tmp.next
    }
    cur.drawNode(this.ctx)
    cur.drawDivider(this.ctx)
    if (cur.arrow != null) {
      cur.arrow.x = cur.x + cur.width + 2 * xs
      cur.arrow.y = cur.y + cur.height / 2
      cur.arrow.x += step
      cur.arrow.dx += step
      cur.arrow.drawArrow(this.ctx)
    }
    head.arrow.dx = head.next.x
    head.arrow.dy = head.next.y + head.next.height / 2
    head.arrow.drawArrow(this.ctx)
  },

  textMove(target) {
    this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    this.drawTipMessage(msg, marginLeft)
    let cur = head.next
    while (cur != null) {
      cur.drawNode(this.ctx)
      cur.drawDivider(this.ctx)
      if (cur.arrow != null) {
        cur.arrow.drawArrow(this.ctx)
      }
      cur = cur.next
    }
    if (newNode != null) {
      newNode.drawNode(this.ctx)
      newNode.drawDivider(this.ctx)
      if (newNode.arrow != null) {
        newNode.arrow.drawArrow(this.ctx)
      }
    }
    if (msg == 'Enqueuing value:' || msg == 'Dequeued value:') {
      tail.drawNode(this.ctx)
      this.originalLinkQueueCanvas()
      if (tail.arrow != null) {
        tail.arrow.drawArrow(this.ctx)
      }
    } else {
      this.originalLinkStackCanvas()
    }
    if (head.arrow != null) {
      head.arrow.drawArrow(this.ctx)
    }
    target.drawText(this.ctx)
  },

  async arrayEnqueueProcess(width, marginLeft) {
    let index = this.data.index2
    this.drawTipMessage('Enqueuing value:', marginLeft)
    textList[0] = new Text(marginLeft + 130 * xs, 40 * xs, this.data.value)
    textList[0].drawText(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    arcList[0] = new Arc(nodeList[21].x + width / 2, nodeList[21].y + 15 * xs, 10 * xs, 'orange')
    arcList[0].drawArc(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    await this.move(arcList[0], indexList[index].x, indexList[index].y, 'enqueue')
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    await this.move(textList[0], nodeList[index].x + width / 2, nodeList[index].y + nodeList[index].height / 2, 'enqueue')
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    nodeList[index].num = textList[0].text
    arcList[0].color = 'white'
    arcList[0].drawArc(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    nodeList[21].color = '#FF7F50'
    nodeList[21].drawNode(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    index = (index + 1) % indexList.length
    nodeList[21].num = index
    nodeList[21].drawNode(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    nodeList[21].color = 'white'
    nodeList[21].drawNode(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    arcList.length = 0
    textList.length = 0
    this.reDraw('enqueue')
    this.ctx.clearRect(0, 0, this.data.canvasWidth, 60 * xs)
    let btnBgc = this.data.btnBgc
    btnBgc[5] = btnBgc[6] = btnBgc[7] = btnBgc[8] = 'lightblue'
    btnBgc[4] = 'white'
    this.setData({
      index2: index,
      btnBgc,
      isBin: false,
      count: this.data.count + 1,
      value: Math.ceil(Math.random() * 998)
    })
    lock = false
  },

  async arrayPushProcess(width, marginLeft) {
    let index = this.data.index
    this.drawTipMessage('Pushing value:', marginLeft)
    textList[0] = new Text(marginLeft + 120 * xs, 40 * xs, this.data.value)
    textList[0].drawText(this.ctx)
    arcList[0].color = 'orange'
    arcList[0].drawArc(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    await this.move(arcList[0], indexList[index].x, indexList[index].y)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    await this.move(textList[0], nodeList[index].x + nodeList[index].width / 2, nodeList[index].y + nodeList[index].height / 2)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    arcList[0].color = 'white'
    arcList[0].x = nodeList[20].x + width / 2
    arcList[0].y = nodeList[20].y + 15 * xs
    nodeList[index].num = this.data.value
    this.reDraw()
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    nodeList[20].color = 'rgb(255, 222, 173)'
    nodeList[20].drawNode(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    nodeList[20].num = ++index
    nodeList[20].drawNode(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    nodeList[20].color = 'white'
    nodeList[20].drawNode(this.ctx)
    this.ctx.clearRect(0, 0, this.data.canvasWidth, 60 * xs)
    let btnBgc = this.data.btnBgc
    btnBgc[5] = btnBgc[6] = btnBgc[7] = btnBgc[8] = 'lightblue'
    btnBgc[4] = 'white'
    this.setData({
      index,
      btnBgc,
      isBin: false,
      value: Math.ceil(Math.random() * 998)
    })
    lock = false
  },

  // 当用户点击Pop按钮是触发
  async out() {
    let width = 35 * xs
    let marginLeft = (deviceWidth - 10 * width) / 2
    if (select == 0 && this.data.index == 0) {
      return
    }
    if ((select == 1 || select == 3) && nodeCount == 0) {
      return
    }

    if (select == 2 && this.data.count == 0) {
      return
    }
    let btnBgc = this.data.btnBgc
    for (let i = 6; i <= 8; i++) {
      if (btnBgc[i] == 'rgb(211, 211, 211)') {
        return
      }
    }
    await this.unLock()
    lock = true
    state = PLAY
    for(let i = 4; i <= 8; i ++){
      btnBgc[i] = 'rgb(211, 211, 211)'
    }
    this.setData({
      btnBgc,
      isBin: true
    })
    this.ctx.clearRect(0, 0, this.data.canvasWidth, 60 * xs)
    switch (select) {
      // 栈：数组实现
      case 0:
        this.arrayPopProcess(width, marginLeft)
        break
        // 栈：链表实现
      case 1:
        this.linkPopProcess(marginLeft)
        break
        // 队列：数组实现
      case 2:
        this.arrayDequeueProcess(marginLeft)
        break
        // 队列：链表实现
      case 3:
        this.linkDequeueProcess(marginLeft)
        break
    }
  },

  async linkDequeueProcess(marginLeft) {
    newNode = null
    msg = 'Dequeued value:'
    this.drawTipMessage(msg, marginLeft)
    let text = new Text(head.next.x + head.next.width / 2,
      head.next.y + head.next.height / 2,
      head.next.num)
    await this.move(text, marginLeft + 130 * xs, 40 * xs, 'text')
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    if (nodeCount == 1) {
      head.arrow = null
      tail.arrow = null
      this.textMove(text)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
      head.next = null
      tail.next = null
      this.textMove(text)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
    } else {
      head.arrow.dx = head.next.next.x
      head.arrow.dy = head.next.next.y + head.next.next.height / 2
      this.textMove(text)
      let dequeueNode = head.next
      head.next = dequeueNode.next
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
      await this.move(dequeueNode, 0, dequeueNode.y, 'node3')
    }
    let btnBgc = this.data.btnBgc
    btnBgc[5] = btnBgc[6] = btnBgc[7] = btnBgc[8] = 'lightblue'
    btnBgc[4] = 'white'
    this.setData({
      btnBgc,
      isBin: false
    })
    lock = false
    nodeCount--
  },

  nodeMove3(text) {
    this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    this.drawTipMessage(msg, marginLeft)
    this.ctx.textAlign = 'center'
    this.ctx.fillText(text, marginLeft + 130 * xs, 40 * xs)
    let cur = head.next
    let step = (cur.width + 20 * xs) / 30
    while (cur != null) {
      cur.x -= step
      cur.drawNode(this.ctx)
      cur.drawDivider(this.ctx)
      if (cur.arrow != null) {
        cur.arrow.x -= step
        cur.arrow.dx -= step
        cur.arrow.drawArrow(this.ctx)
      }
      cur = cur.next
    }
    this.originalLinkQueueCanvas()
    head.arrow.dx = head.next.x
    head.arrow.drawArrow(this.ctx)
    tail.arrow.dx = tail.next.x
    tail.arrow.drawArrow(this.ctx)
  },


  async linkPopProcess(marginLeft) {
    newNode = null
    msg = 'Popped value:'
    nodeCount--
    this.drawTipMessage('Popped value:', marginLeft)
    let nextNode = head.next
    let text = new Text(nextNode.x + nextNode.width / 2, nextNode.y + nextNode.height / 2, nextNode.num)
    await this.move(text, marginLeft + 110 * xs, 40 * xs, 'text')
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    if (nextNode.next != null) {
      head.arrow.dx = nextNode.next.x
      head.arrow.dy = nextNode.next.y + nextNode.next.height / 2
      this.textMove(text)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
      head.next = nextNode.next
      await this.move(nextNode, 0, nextNode.y, 'nodeLeft')
    } else {
      head.arrow = null
      this.textMove(text)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
      head.next = null
      this.textMove(text)
    }
    let btnBgc = this.data.btnBgc
    btnBgc[5] = btnBgc[6] = btnBgc[7] = btnBgc[8] = 'lightblue'
    btnBgc[4] = 'white'
    this.setData({
      btnBgc,
      isBin: false
    })
    lock = false
  },

  nodeMoveToLeft(text) {
    this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    this.drawTipMessage('Popped value:', marginLeft)
    this.ctx.textAlign = 'center'
    this.ctx.fillText(text, marginLeft + 110 * xs, 40 * xs)
    this.originalLinkStackCanvas()
    let cur = head.next
    let step = (cur.width + 20 * xs) / 30
    while (cur != null) {
      cur.x -= step
      cur.drawNode(this.ctx)
      cur.drawDivider(this.ctx)
      if (cur.arrow != null) {
        cur.arrow.x -= step
        cur.arrow.dx -= step
        cur.arrow.drawArrow(this.ctx)
      }
      cur = cur.next
    }
    head.arrow.dx = head.next.x
    head.arrow.dy = head.next.y + head.next.height / 2
    head.arrow.drawArrow(this.ctx)
  },

  async arrayDequeueProcess(marginLeft) {
    this.drawTipMessage('Dequeued value:', marginLeft)
    arcList[0] = new Arc(nodeList[20].x + nodeList[20].width / 2,
      nodeList[20].y + nodeList[21].height / 2,
      10 * xs,
      'orange')
    arcList[0].drawArc(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    let index = this.data.index
    await this.move(arcList[0], indexList[index].x, indexList[index].y, 'dequeue')
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    textList[0] = new Text(nodeList[index].x + nodeList[index].width / 2,
      nodeList[index].y + nodeList[index].height / 2,
      nodeList[index].num)
    nodeList[index].num = ''
    arcList.length = 0
    await this.move(textList[0], marginLeft + 130 * xs, 40 * xs, 'dequeue')
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    nodeList[20].color = '#00CED1'
    nodeList[20].drawNode(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    index = (index + 1) % indexList.length
    nodeList[20].num = index
    nodeList[20].drawNode(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    nodeList[20].color = 'white'
    nodeList[20].drawNode(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    textList[0].text = ''
    let btnBgc = this.data.btnBgc
    btnBgc[4] = 'white'
    btnBgc[5] = btnBgc[6] = btnBgc[7] = btnBgc[8] = 'lightblue'
    this.setData({
      btnBgc,
      index,
      isBin: false,
      count: this.data.count - 1
    })
    lock = false
  },


  originalLinkStackCanvas() {
    this.ctx.beginPath()
    this.ctx.textAlign = 'start'
    this.fillStyle = 'black'
    this.ctx.fillText('Head', marginLeft, 90 * xs)
    head.drawNode(this.ctx)
  },



  async arrayPopProcess(width, marginLeft) {
    this.drawTipMessage('Popped value:', marginLeft)
    let index = this.data.index
    nodeList[20].color = 'pink'
    nodeList[20].drawNode(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    nodeList[20].num = --index
    nodeList[20].drawNode(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    nodeList[20].color = 'white'
    nodeList[20].drawNode(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    arcList[0].color = 'orange'
    arcList[0].drawArc(this.ctx)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    await this.move(arcList[0], indexList[index].x, indexList[index].y, 'pop')
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    textList[0] = new Text(nodeList[index].x + nodeList[index].width / 2, nodeList[index].y + nodeList[index].height / 2, nodeList[index].num)
    nodeList[index].num = ''
    await this.move(textList[0], marginLeft + 110 * xs, 40 * xs, 'pop')
    arcList[0].color = 'white'
    arcList[0].x = nodeList[20].x + width / 2
    arcList[0].y = nodeList[20].y + 15 * xs
    this.reDraw('pop')
    textList[0].text = ''
    let btnBgc = this.data.btnBgc
    btnBgc[5] = btnBgc[6] = btnBgc[7] = btnBgc[8] = 'lightblue'
    btnBgc[4] = 'white'
    this.setData({
      index,
      btnBgc,
      isBin: false,
    })
    lock = false
  },

  drawTipMessage(text, marginLeft) {
    this.ctx.beginPath()
    this.ctx.fillStyle = 'black'
    this.ctx.textAlign = 'start'
    this.ctx.fillText(text, marginLeft, 40 * xs)
  },

  // 当用户点击clear按钮时触发
  clear() {
    if (this.data.btnBgc[8] == 'rgb(211, 211, 211)') {
      return
    }
    let cur = head
    let pre = null
    while (cur != null) {
      pre = cur
      cur.next = null
      cur.arrow = null
      cur = pre.next
    }
    nodeCount = 0
    tail.next = null
    tail.arrow = null

    switch (select) {
      case 0:
        for (let i = 0; i < nodeList.length - 2; i++) {
          nodeList[i].num = ''
        }
        this.setData({
          index: 0
        })
        nodeList[20].num = this.data.index
        textList.length = 0
        this.reDraw('push')
        this.ctx.clearRect(0, 0, this.data.canvasWidth, 60)
        break
      case 1:
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        this.originalLinkStackCanvas()
        break
      case 2:
        for (let i = 0; i < nodeList.length; i++) {
          nodeList[i].num = ''
        }
        nodeList[20].num = nodeList[21].num = 0
        this.setData({
          index: 0,
          index2: 0,
          count: 0
        })
        textList.length = 0
        this.reDraw('enqueue')
        this.ctx.clearRect(0, 0, this.data.canvasWidth, 60)
        break
      case 3:
        this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
        this.originalLinkQueueCanvas()
        break
    }
  },

  async sleep(delay = 1000) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, delay)
    })

  },

  // 获取用户输入的值
  setNum(event) {
    if(this.data.btnBgc[4] === 'rgb(211, 211, 211)'){
      return
    }
    let value = event.detail.value.trim()
    this.setData({
      value
    })
  },

  async move(target, dx, dy, type = 'push') {
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
      let handleId = that.canvas.requestAnimationFrame(function render() {
        if (security >= 30 || state == PAUSE) {
          that.canvas.cancelAnimationFrame(handleId)
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
        // 重新绘制
        if (type == 'text') {
          that.textMove(target)
        } else if (type == 'node') {
          that.nodeMove()
        } else if (type == 'nodeLeft') {
          that.nodeMoveToLeft(target.num)
        } else if (type == 'node2') {
          that.nodeMove2()
        } else if (type == 'node3') {
          that.nodeMove3(target.num)
        } else {
          that.reDraw(type)
        }
        security++
        that.canvas.requestAnimationFrame(render)
      })
    })
  },

  reDraw(type = 'push') {
    let width = 35 * xs
    let marginLeft = (deviceWidth - 10 * width) / 2
    this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    this.ctx.beginPath()
    this.ctx.fillStyle = 'black'
    this.ctx.textAlign = 'start'
    let len = 0
    if (type == 'push' || type == 'pop') {
      if (type == 'push') {
        this.ctx.fillText('Pushing value:', marginLeft, 40 * xs)
      } else {
        this.ctx.fillText('Popped value:', marginLeft, 40 * xs)
      }
      this.ctx.fillText('Top', marginLeft, 95 * xs)
      len = nodeList.length - 1
    } else if (type == 'enqueue' || type == 'dequeue') {
      if (type == 'enqueue') {
        this.ctx.fillText('Enqueuing value:', marginLeft, 40 * xs)
      } else {
        this.ctx.fillText('Dequeued value:', marginLeft, 40 * xs)
      }
      this.ctx.fillText('Head', marginLeft, 95 * xs)
      this.ctx.fillText('Tail', marginLeft + 80 * xs, 95 * xs)
      len = nodeList.length
    }

    for (let i = 0; i < len; i++) {
      nodeList[i].drawNode(this.ctx)
      if (i < 20) {
        indexList[i].drawIndex(this.ctx)
      }
    }
    for (let i = 0; i < arcList.length; i++) {
      arcList[i].drawArc(this.ctx)
    }
    for (let i = 0; i < textList.length; i++) {
      textList[i].drawText(this.ctx)
    }
  },


  // 当用户点击“栈：数组实现”按钮时触发
  arrayStack() {
    this.select(0)
  },
  // 当用户点击“栈：数组实现”按钮时触发
  linkStack() {
    this.select(1)
  },

  // 当用户点击“队列：数组实现”按钮时触发
  arrayQueue() {
    this.select(2)
  },
  // 当用户点击“队列：链表实现”按钮时触发
  linkQueue() {
    this.select(3)
  },
  // 用户选择的是哪一种演示方式
  async select(index) {
    state = PAUSE
    await this.sleep(5)
    let btnBgc = this.data.btnBgc
    // 把之前选择的按钮的颜色恢复最初的颜色
    btnBgc[select] = 'lightblue'
    // 把当前按钮的背景颜色变成已选中的颜色
    btnBgc[index] = 'lightgreen'
    let ope1 = '',
      ope2 = ''
    if (index == 0 || index == 1) {
      ope1 = 'Push'
      ope2 = 'Pop'
    } else {
      ope1 = 'Enqueue'
      ope2 = 'Dequeue'
    }
    btnBgc[4] = 'white'
    btnBgc[5] = btnBgc[6] = btnBgc[7] = btnBgc[8] = 'lightblue'
    this.setData({
      btnBgc,
      ope1,
      ope2,
      index: 0,
      index2: 0,
      isBin: false,
      count: 0
    })
    nodeCount = 0
    let cur = head
    let pre = null
    while (cur != null) {
      pre = cur
      cur.next = null
      cur.arrow = null
      cur = pre.next
    }
    tail.next = null
    tail.arrow = null
    // 清除当前的状态
    this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    // 恢复最初的状态
    switch (index) {
      case 0:
        this.initCanvas()
        break
      case 1:
        this.originalLinkStackCanvas()
        break
      case 2:
        textList.length = 0
        arcList.length = 0
        for (let i = 0; i < nodeList.length; i++) {
          nodeList[i].num = ''
          nodeList[i].color = 'white'
        }
        nodeList[20].num = this.data.index
        nodeList[21].num = this.data.index2
        this.reDraw('enqueue')
        this.ctx.clearRect(0, 0, this.data.canvasWidth, 60 * xs)
        break
      case 3:
        this.originalLinkQueueCanvas()
        break
    }
    select = index
  },

  originalLinkQueueCanvas() {
    this.originalLinkStackCanvas()
    this.ctx.fillText('Tail', marginLeft + 40 * xs, 270 * xs)
    tail.drawNode(this.ctx)
  },

  // 当点击“减速”按钮时触发
  slowDown() {
    if (timeout_delay >= 1000) {
      return
    }
    // 增加延时时间以达到演示减速的效果
    timeout_delay += 100
    this.setData({
      speed: this.data.speed - 100
    })

  },

  // 当点击“加速”按钮时触发
  speedUp() {
    if (timeout_delay <= 100) {
      return
    }
    // 减小延时时间以达到演示加速的效果
    timeout_delay -= 100
    this.setData({
      speed: this.data.speed + 100
    })
  },

})