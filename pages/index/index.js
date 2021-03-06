// pages/index/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    setTimeout(function () {
      var that = this
      //
      wx.request({
        url: 'https://api.shareone.online/user/info',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          openid: app.globalData.openid
        },
        success: function (res) {
          console.log(res)
          var nextPath = '../home/index'
          if(res.data.Issuccess) {
            var user = res.data.Data
            if (user.Status == 1) {
              nextPath = '../together/index'
            }
          }
          setTimeout(function(){
            wx.redirectTo({
              url: nextPath
            })
          },1000)
        },
        fail:function() {
          wx.showToast({
            title: "网络不佳,请更换网络再试！",
            icon: 'none',
            duration: 3000,
          })
        }
      })
    }, 2000);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})