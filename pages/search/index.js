// pages/search/index.js

// 全局 
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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


  // 搜索内容
  searchUserInfo: function(e) {
    var that = this
    // console.log(e)
    let content = e.detail.value 
    console.log(content)
    wx.request({
      url: 'https://api.shareone.online/user/searchUserInfo',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        openid: app.globalData.openid,
        content: content,
      },
      success: function (res) {
        var data = res.data.Data
        console.log(data)
        that.setData({list:data})
      }
    })
  },

  // 点击红心，
  likeYou: function (e) {
    console.log(e)
    let index = e.currentTarget.dataset.index
    var that = this
    var list = that.data.list
    var user = list[index]
      wx.request({
        url: 'https://api.shareone.online/user/like',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          openid: app.globalData.openid,
          uid: user.Id
      },
        success: function (res) {
          list[index].IsLike = 1
          that.setData({list})
          console.log(res.data)
          var isMarried = res.data.Data
          if(isMarried == 1) {
            wx.redirectTo({
              url: '../together/index',
            })
          }
        }
      })
  },
  // 取消红心
  unlikeYou:function(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index
    var that = this
    var list = that.data.list
    var user = list[index]
      wx.request({
        url: 'https://api.shareone.online/user/unlike',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          openid: app.globalData.openid,
          uid: user.Id
        },
        success: function (res) {
          list[index].IsLike = 0
          that.setData({ list})
          console.log(res.data)
        }
      })
  },

  // 查看用户详情
  lookUser: function(e) {
    console.log(e)
    let uid = e.currentTarget.dataset.id
    let openid = e.currentTarget.dataset.openid
    console.log(uid, openid)
    if(app.globalData.openid === openid) {
      wx.navigateTo({
        url: '../self/index'
      })
    }else {
      wx.navigateTo({
        url: '../user/index?uid=' +uid,
      })
    }
    
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