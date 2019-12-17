//app.js
App({


  
  onLaunch: function() {
    var that = this
    wx.login({
      success(res) {
        if (res.code) {
          wx.request({
            url: 'https://api.shareone.online/user/login',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              code: res.code
            },
            success: function (res) {
              console.log("login success", res.data.Data)
              that.globalData.openid = res.data.Data
            }
          })
        }
      }
    })


  },
  globalData: {
    openid:''
  }
})