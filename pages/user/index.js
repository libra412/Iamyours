// pages/user/index.js
// 全局
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    let uid = options.uid
    let isEdit = options.isSelf?true:false
    let openid = app.globalData.openid
    wx.request({
      url: 'https://api.shareone.online/user/look',
      method:'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        uid, openid
      },
      success:function(res) {
        var imgList = res.data.Data.ImageUrl.split(",")
          that.setData({
            user: res.data.Data,
            imageList: imgList,
            isEdit: isEdit
          })
      }
    })
  },


  // 点击红心，
  likeYou: function () {
    var that = this
    
      var user = that.data.user
      console.log(user)
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
          wx.showToast({
            title: '已喜欢TA',
            icon: 'none',
          })
          user.IsLike = 1
          that.setData({ user })
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
  unlikeYou:function() {
    var that = this
    var user = that.data.user
      console.log(user)
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
          wx.showToast({
            title: '已取消喜欢',
            icon: 'none',
          })
          user.IsLike = 0
          that.setData({ user })
          console.log(res.data)
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
  // 关于我们
  aboutus: function () {
    wx.navigateTo({
      url: '../aboutus/aboutus',
    })
  },
  // 编辑
  edit: function () {
    wx.navigateTo({
      url: '../self/index',
    })
  },
  // 跳转小商店
  gotoShop: function(e) {
    console.log(e)
    let appId = e.currentTarget.dataset.appid
    wx.navigateToMiniProgram({
      appId: appId,
      success(res) {
        // 打开成功
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this;
    let uid = that.data.user.Id;
    return {
      title: 'TA喜不喜欢我，“结果”一下就知道',
      path: '/pages/user/index?uid='+uid,
    }
  },
  /**
   *  用户分享朋友圈
   */
  onShareTimeline: function() {
    let that = this;
    let uid = that.data.user.Id;
    return {
      title: 'TA喜不喜欢我，“结果”一下就知道',
      path: '/pages/user/index?uid='+uid,
    }
  }
})