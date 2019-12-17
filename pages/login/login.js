// pages/login/login.js



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
  },
  //
  bindGetUserInfo: function (e) {
    var that = this;
    console.log(e.detail.encryptedData, e.detail.iv)

    //发起网络请求
    wx.request({
      url: 'https://api.shareone.online/user/save',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        openid: app.globalData.openid
      },
      success: function (res) {
        console.log("getUserInfo success", res.data.Data)
        wx.navigateBack({
          delta: 1
        })
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