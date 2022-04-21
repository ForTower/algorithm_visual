// app.js
App({
    globalData: {
        width: 0,
        height: 0
    },
    onLaunch: function () {
        this.globalData.width = wx.getSystemInfoSync().windowWidth
        this.globalData.height = wx.getSystemInfoSync().windowHeight
        // 用户在使用小程序的时候让小程序不息屏
        wx.setKeepScreenOn({
            　　keepScreenOn: true,
        })
    }
})