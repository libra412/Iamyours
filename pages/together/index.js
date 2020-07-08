// pages/together/index.js
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
        var user = res.data.Data 
       var anotherInfo = JSON.parse(user.AnotherInfo);
        that.setData({
          user,
          anotherInfo
        })
      }
    })
  },

  unlock:function() {
    var taht = this
    wx.request({
      url: 'https://api.shareone.online/user/goodbye',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        openid: app.globalData.openid
      },
      success: function (res) {
        wx.showToast({
          title: '解除成功',
          icon:'none',
          duration: 3000,
        })
        setTimeout(function(){
          wx.redirectTo({
            url: '../home/index',
          })
        },3000)
      }
    })
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