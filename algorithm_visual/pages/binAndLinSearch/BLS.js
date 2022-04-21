let app = getApp()
// 设备的宽度
let deviceWidth = app.globalData.width
// 当前设备的宽度与iPhone6/7/8设备屏幕的宽度比
// 用来适应不同手机屏幕的宽度
let xs = deviceWidth / 375
// 每个矩形的宽度
let width = 35 * xs
// 每个矩形的高度
let height = 30 * xs
// 每一步延迟的时间
let timeout_delay = 500
// 画矩形开始的位置
let start = (deviceWidth - 10 * width) / 2
// 暂停
const PAUSE = true
// 演示
const PLAY = false
// 状态,默认为演示
let state = PLAY
// 线程异步加锁
let lock = false
// 是否处于演示状态，默认是否
let playing = false

// 每个元素对应的下标对象
function Index(x, y, index, color = 'red') {
  this.x = x
  this.y = y
  this.index = index
  this.color = color
}
// 在画布中绘制下标
Index.prototype.drawIndex = function (ctx) {
  ctx.beginPath()
  ctx.fillStyle = this.color
  ctx.fillText(this.index, this.x, this.y)
}
// 用于管理每个数组下标对象
let indexArray = []


// 正方形对象
function Rect(x, y, width, height, num, strokeColor, linw = 1) {
  this.x = x
  this.y = y
  this.width = width
  this.height = height
  this.num = num
  this.linw = linw
  this.strokeColor = strokeColor
  this.color = 'rgb(193, 210, 240)'
}
// 在画布中绘制矩形
Rect.prototype.drawRect = function (ctx) {
  ctx.beginPath()
  ctx.fillStyle = this.color
  ctx.strokeStyle = this.strokeColor
  ctx.lineWidth = this.linw
  ctx.rect(this.x, this.y, this.width, this.height)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.fillText(this.num, this.x + this.width / 2, this.y + this.height / 2)
}
// 用于管理每个矩形对象
let rectArray = []

// 圆弧对象
function Arc(x, y, radius, color) {
  this.x = x
  this.y = y
  this.radius = radius
  this.color = color
}
// 绘制圆弧
Arc.prototype.drawArc = function (ctx) {
  ctx.beginPath()
  ctx.lineWidth = 2
  ctx.strokeStyle = this.color
  ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
  ctx.stroke()
}
// 用来管理圆弧对象
let arcArray = []


let tipObj = {
  x: start,
  y: 90 * xs,
  drawText: function (ctx, x, y, text) {
    ctx.beginPath()
    ctx.fillStyle = 'black'
    ctx.textAlign = 'start'
    ctx.fillText(text, x, y)
  },
}


Page({
  data: {
    canvasWidth: deviceWidth, //画布的宽度
    canvasHeight: 350 * xs, //画布的高度
    speed: 600, // 演示播放的速度，值越大，演示播放速度越快
    tip: false, //为true表示用户输入不合法,提示用户，为false表示输入合法
    value: 90, //用户输入框的值默认为90
    nums: [2, 4, 7, 8, 10, 13, 15, 23, 26, 30, 32, 36, 39, 50, 65, 70, 80, 86, 90, 99], //默认数组
    lineColor: 'green', //默认显示是线性搜索
    binColor: 'gray',
    // 0表示线性搜索，1表示二分搜索
    state: 0
  },

  onHide() {
    // 要是间隔定时器还正在运行，则关闭间隔定时器
    state = PAUSE

  },

  onUnload() {
    // 用户销毁程序时，关闭间隔定时器
    state = PAUSE
  },

  onShow() {
    this.setData({
      speed: 600,
      tip: false,
      value: 90,
      nums: [2, 4, 7, 8, 10, 13, 15, 23, 26, 30, 32, 36, 39, 50, 65, 70, 80, 86, 90, 99],
      state: 0
    })

    // 当用户有隐藏状态再到展示状态时，重设全局变量
    timeout_delay = 500
    state = PLAY
    playing = false
    lock = false
    const query = wx.createSelectorQuery()
    query.select('#searchCanvas')
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

  // 初始化画布
  initCanvas() {
    this.setInReArrayAndDraw()
    this.drawTip()
    this.setArcArray()
  },
  // 绘制比对
  drawTip() {
    tipObj.drawText(this.ctx, tipObj.x, tipObj.y + height / 2, '搜索')
    tipObj.drawText(this.ctx, tipObj.x + 47 * xs + width, tipObj.y + height / 2, '结果')
  },

  // 设置矩形边框的颜色和边框的宽度
  setStrokeColor(rect, strokeColor, linw) {
    rect.strokeColor = strokeColor
    rect.linw = linw
    rect.drawRect(this.ctx)
  },

  // 设置arcArray数组的值
  setArcArray() {
    for (let i = 1; i <= 3; i++) {
      let arc = new Arc(rectArray[21].x + width + 40 * xs * i, rectArray[21].y + height / 2, 10 * xs, 'white')
      arc.drawArc(this.ctx)
      arcArray[i - 1] = arc
    }
  },

  // 画布中元素移动函数
  /**
   * 
   * @param {画布上下文对象} ctx 
   * @param {目标对象} target 
   * @param {目标对象的目的地的x轴方向的距离} dx 
   * @param {目标对象目的地的y轴方向的距离} dy 
   */
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
        that.reDraw()
        security++
        that.canvas.requestAnimationFrame(render)
      })
    })

  },

  //设置rectArray数组的值，并把他们绘制在画布上
  setInReArrayAndDraw() {
    let nums = this.data.nums
    let marginTop = 150 * xs
    let s = start
    let rect = null,
      index = null
    for (let i = 0; i < nums.length; i++) {
      if (i < 10) {
        rect = new Rect(s + i * width, marginTop, width, height, nums[i], 'gray')
      } else {
        rect = new Rect(start + (i - 10) * width, marginTop + 85 * xs, width, height, nums[i], 'gray')
      }
      index = new Index(rect.x + rect.width / 2, rect.y + rect.height + 15 * xs, i)
      rect.drawRect(this.ctx)
      index.drawIndex(this.ctx)
      rectArray[i] = rect
      indexArray[i] = index
    }
    rect = new Rect(tipObj.x + 27 * xs, tipObj.y, width, height, this.data.value, 'gray')
    rect.drawRect(this.ctx)
    rectArray[20] = rect
    rect = new Rect(tipObj.x + 74 * xs + width, tipObj.y, width, height, '', 'gray')
    rect.drawRect(this.ctx)
    rectArray[21] = rect
  },

  // 输入框焦点离开时触发
  setNum(event) {
    let value = event.detail.value
    let obj = this.check(value)
    if (!obj.res) {
      this.setData({
        tip: true
      })
      return
    }
    this.setData({
      value: obj.num,
      tip: false
    })
    this.process()
  },
  // 检查查用户输入是否合法
  check(value) {
    value = value.trim()
    if (value.length == 0 || value.length >= 4) {
      return {
        num: 0,
        res: false
      }
    }
    for (let i = 0; i < value.length; i++) {
      if (!(value.charAt(i) >= '0' && value.charAt(i) <= '9')) {
        return {
          num: 0,
          res: false
        }
      }
    }
    return {
      num: parseInt(value),
      res: true
    }
  },

  // 点击”线性“按钮时触发
  line() {
    this.setData({
      lineColor: 'green',
      binColor: 'gray',
      state: 0
    })
    this.process()
  },
  // 点击“二分”按钮时触发
  binary() {
    this.setData({
      lineColor: 'gray',
      binColor: 'green',
      state: 1
    })
    this.process()
  },
  // 点击“随机”按钮时触发,产生随机有序数组
  generateArr() {
    let nums = this.data.nums
    let step = 0
    nums[0] = Math.ceil((Math.random() + 1) * 100)
    for (let i = 1; i < nums.length; i++) {
      step = Math.ceil((Math.random() + 1) * 20)
      nums[i] = nums[i - 1] + step
    }
    this.setData({
      nums,
      tip: false,
    })
    this.process()
  },

  async process() {
    // 暂停其他的异步过程
    state = PAUSE
    // 此时处于停止演示的状态
    playing = false
    // 等待20ms以确保其他异步过程已经完全暂停
    await this.sleep(20)
    this.resetValue(this.data.value)
  },

  // 重新设置rectArray和arcArray的值
  resetValue(searchValue = '') {
    let nums = this.data.nums
    // 重新设置rectArray的num属性的值
    for (let i = 0; i < 20; i++) {
      rectArray[i].num = nums[i]
      rectArray[i].strokeColor = 'gray'
      rectArray[i].color = "rgb(193, 210, 240)"
      rectArray[i].linw = 1
    }
    rectArray[20].num = searchValue
    rectArray[21].num = ''
    rectArray[20].strokeColor = rectArray[21].strokeColor = 'gray'
    rectArray[20].color = rectArray[21].color = "rgb(193, 210, 240)"
    rectArray[20].linw = rectArray[21].linw = 1
    // 重新设置arcArray的各个属性的值，使其回到初始位置
    for (let i = 0; i <= 2; i++) {
      let arc = arcArray[i]
      arc.x = rectArray[21].x + width + 40 * xs * (i + 1)
      arc.y = rectArray[21].y + height / 2
      arc.color = 'white'
    }
    // 重新绘制
    this.reDraw()
  },


  // 重新绘制
  reDraw() {
    // 先清空
    this.ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
    // 再重新绘制
    let record = null
    for (let i = 0; i < rectArray.length; i++) {
      rectArray[i].drawRect(this.ctx)
      if (record == null && rectArray[i].linw == 3) {
        record = i
      }
    }
    if (record != null) {
      rectArray[record].drawRect(this.ctx)
    }
    for (let i = 0; i < indexArray.length; i++) {
      indexArray[i].drawIndex(this.ctx)
    }
    // 顺序不能颠倒，否则会改变原来的含义
    arcArray[0].drawArc(this.ctx)
    arcArray[2].drawArc(this.ctx)
    arcArray[1].drawArc(this.ctx)
    this.drawTip()
  },

  // 当用户点击“重新开始”按钮是触发
  restart() {
    this.setData({
      tip: false,
    })
    // 重新绘制
    this.process()

  },

  // 动画演示减速,当用户点击“减速”按钮时触发
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
  // 动画演示加速，当用户点击“加速按钮时触发
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
  // 开锁
  async unLock() {
    // 安全机制，如果时间过了1000ms,还没有开锁，则强制开锁
    let security = 0
    return new Promise(resolve => {
      let timer = setInterval(() => {
        if (lock == false || security > 50) {
          clearInterval(timer)
          resolve()
          return
        }
        security++
      }, 20)
    })
  },

  // 当点击搜索按钮时触发
  async search() {
    // 检查当前是否处于正在演示状态，
    // 如果playing=true表示正处于演示状态，点击“搜索”按钮将无效
    if (playing) {
      return
    }
    // 当前正处于演示状态
    playing = true
    // 轮循检测其他的异步过程是否结束了，如果结束了，就启动新的演示过程
    // 否则，等待其他异步过程的完成
    await this.unLock()
    // 加锁
    lock = true
    state = PLAY
    // 检查输入框输入是否合法
    let obj = this.check(this.data.value + '')
    if (!obj.res) {
      this.setData({
        tip: true
      })
      return
    }
    // 线性可视化搜索
    if (this.data.state == 0) {
      this.lineSearchVisual()
    } else {
      // 二分可视化搜索
      this.binarySearchVisual()
    }
  },
  // 线性可视化搜索
  async lineSearchVisual() {
    let nums = this.data.nums
    let value = this.data.value
    arcArray[0].color = 'blue'
    await this.sleep(200)
    for (let i = 0; i < nums.length; i++) {
      await this.move(arcArray[0], indexArray[i].x, indexArray[i].y)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        // 解锁
        lock = false
        return
      }
      this.setStrokeColor(rectArray[i], 'red', 3)
      this.setStrokeColor(rectArray[20], 'red', 3)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
      if (value == nums[i]) {
        this.setStrokeColor(rectArray[i], 'green', 3)
        this.setStrokeColor(rectArray[20], 'green', 3)
        this.setStrokeColor(rectArray[21], 'green', 3)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
          lock = false
          return
        }
        let resultIndex = new Index(indexArray[i].x, indexArray[i].y, i, 'black')
        indexArray[20] = resultIndex
        await this.move(resultIndex, rectArray[21].x + rectArray[21].width / 2, rectArray[21].y + rectArray[21].height / 2)
        indexArray.pop()
        break
      } else if (value < nums[i] || i == nums.length - 1) {
        rectArray[21].num = -1
        this.setStrokeColor(rectArray[21], 'red', 3)
        // 提示数组中不存在该值
        this.ctx.beginPath()
        this.ctx.fillStyle = 'red'
        this.ctx.textAlign = 'start'
        this.ctx.fillText('Element Not found', rectArray[21].x + rectArray[21].width + 10 * xs, rectArray[21].y + rectArray[21].height / 2)
        break
      }
      this.setStrokeColor(rectArray[i], 'gray', 1)
      this.setStrokeColor(rectArray[20], 'gray', 1)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
    }
    lock = false
  },

  // 二分可视化搜索
  async binarySearchVisual() {
    let nums = this.data.nums
    let value = this.data.value
    let L = 0,
      R = nums.length - 1
    arcArray[0].color = 'blue'
    arcArray[1].color = 'orange'
    arcArray[2].color = '#cc00ff'
    await this.move(arcArray[0], indexArray[L].x, indexArray[L].y)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    await this.move(arcArray[2], indexArray[R].x, indexArray[R].y)
    await this.sleep(timeout_delay)
    if (state == PAUSE) {
      lock = false
      return
    }
    while (L <= R) {
      let mid = Math.floor((L + R) / 2)
      await this.move(arcArray[1], indexArray[mid].x, indexArray[mid].y)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
      this.setStrokeColor(rectArray[mid], 'red', 3)
      this.setStrokeColor(rectArray[20], 'red', 3)
      await this.sleep(timeout_delay)
      if (state == PAUSE) {
        lock = false
        return
      }
      if (nums[mid] == value) {
        this.setStrokeColor(rectArray[mid], 'green', 3)
        this.setStrokeColor(rectArray[20], 'green', 3)
        this.setStrokeColor(rectArray[21], 'green', 3)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
          lock = false
          return
        }
        let resultIndex = new Index(indexArray[mid].x, indexArray[mid].y, mid, 'black')
        indexArray[20] = resultIndex
        await this.move(resultIndex,  rectArray[21].x + rectArray[21].width / 2, rectArray[21].y + rectArray[21].height / 2)
        indexArray.pop()
        return
      } else if (nums[mid] > value) {
        let tmp = R
        R = mid - 1
        if (L > R) {
          break
        }
        this.setStrokeColor(rectArray[mid], 'gray', 1)
        this.setStrokeColor(rectArray[20], 'gray', 1)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
          lock = false
          return
        }
        for (let i = mid; i <= tmp; i++) {
          rectArray[i].color = '#F0FFFF'
        }
        await this.move(arcArray[2], indexArray[R].x, indexArray[R].y)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
          lock = false
          return
        }
      } else {
        let tmp = L
        L = mid + 1
        if (L > R) {
          break
        }
        this.setStrokeColor(rectArray[mid], 'gray', 1)
        this.setStrokeColor(rectArray[20], 'gray', 1)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
          lock = false
          return
        }
        for (let i = tmp; i <= mid; i++) {
          rectArray[i].color = '#F0FFFF'
        }
        await this.move(arcArray[0], indexArray[L].x, indexArray[L].y)
        await this.sleep(timeout_delay)
        if (state == PAUSE) {
          lock = false
          return
        }
      }


    }
    rectArray[21].num = -1
    this.setStrokeColor(rectArray[21], 'red', 3)
    // 提示数组中不存在该值
    this.ctx.beginPath()
    this.ctx.fillStyle = 'red'
    this.ctx.textAlign = 'start'
    this.ctx.fillText('Element Not found', rectArray[21].x + rectArray[21].width + 10 * xs, rectArray[21].y + rectArray[21].height / 2)
    lock = false
  },



  async sleep(delay = 1000) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, delay)
    })
  }

})