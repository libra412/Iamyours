// pages/postCard/choose.js
var LL = require("../../LL/LL.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

    that.setData({
      pageData: {
        CurrentIndex: 0,
        pageIndex: 1,
        changeStatus: false
      }
    })

    that.GetImg();

    if (options.finish) {
      wx.navigateBack({
        delta: 1
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    LL.getUserInfo({}, that);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  // 图片请求接口
  GetImg: function() {
    var that = this;
    // 获取轮播图
    LL.Ajax({
      url: "get_background_pic",
      data: {
        shopId: 1,
        pageIndex: that.data.pageData.pageIndex,
        pageSize: 6
      },
      success: function(res) {
        that.setData({
          "pageData.changeStatus": false,
          "pageData.current": 0
        })

        setTimeout(function() {
          var changeNumber = Math.ceil(res.total / 6);
          for (var i = 0; i < res.data.length; i++) {
            if (!that.data.pageData.CurrentIndex) {
              if (i == 0) {
                var toBig = wx.createAnimation({
                  duration: 10,
                  timingFunction: 'ease',
                })
                toBig.scale(1.25).step()
                res.data[i].animation = toBig.export();
              } else {
                res.data[i].animation = {};
              }
            }
          }
          if (changeNumber == that.data.pageData.pageIndex) {
            that.data.pageData.pageIndex = 1;
          } else {
            that.data.pageData.pageIndex++;
          }
          that.setData({
            "swiperList": res.data,
            "pageData.total": changeNumber,
          })
        }, 200)
      }
    })
  },
  // 获取新一组图片
  getNew: function() {
    var that = this;
    that.setData({
      "pageData.changeStatus": true
    })
    that.GetImg();
  },
  // 改变图片
  change: function(e) {
    var that = this;
    if (!that.data.pageData.changeStatus) {
      // 轮播缩小和放大
      var toBig = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
      })
      toBig.scale(1.25).step()
      var toSmall = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
      })
      toSmall.scale(1).step();

      that.data.swiperList[that.data.pageData.CurrentIndex].animation = toSmall.export();
      that.data.swiperList[e.detail.current].animation = toBig.export();

      that.setData({
        "swiperList": that.data.swiperList,
        "pageData.CurrentIndex": e.detail.current
      })
    }
  },
  // 选择图片
  choose: function() {
    var that = this;
    var app = getApp();
    app.imgUrl = that.data.swiperList[that.data.pageData.CurrentIndex].imageUrl;
    app.shopId = that.data.swiperList[that.data.pageData.CurrentIndex].shopId;
    wx.navigateTo({
      url: "write",
    })
  }
})