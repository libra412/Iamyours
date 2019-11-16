// pages/postCard/send.js
var LL = require("../../LL/LL.js");
var W = require("../../W/W.js");
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
        writer: "",
        toWriter: "",
        content: "",
        date: W.Tool.dateFormat((new Date().getTime()), "yyyy.mm.dd", true)
      }
    })

    // 获取屏幕大小

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          height: res.windowHeight,
          width: res.windowWidth,
        })
      }
    })
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
  Event: function(e) {
    var that = this;
    switch (e.currentTarget.dataset.id) {
      // 输入框
      case "input":
        if (e.target.dataset.name == "content" && e.detail.value.length == 50) {
          LL.Tool.showTips("内容请保持在50字数内", that);
        } else if (e.target.dataset.name == "toWriter" && e.detail.value.length == 10) {
          LL.Tool.showTips("寄信人姓名请保持在9字数内", that);
        } else if (e.target.dataset.name == "writer" && e.detail.value.length == 10) {
          LL.Tool.showTips("寄信人姓名请保持在9字数内", that);
        } else {
          that.data.pageData[e.target.dataset.name] = e.detail.value;
        }
        break
        // 表单提交
      case "submit":
        if (that.notNull()) {
          LL.Ajax({
            url: "create_postcard",
            data: {
              fromUser: that.data.pageData.writer,
              toUser: that.data.pageData.toWriter,
              message: that.data.pageData.content,
            },
            success: function(res) {
              wx.navigateTo({
                url: 'send?createPostCard=' + res.data[2] + "&rotateCard=" + res.data[1] + "&letter=" + res.data[0],
              })
            }
          })
        }
        break
    }
  },
  notNull: function() {
    var that = this;
    if (!that.data.pageData.writer.length) {
      LL.Tool.showTips("请添加称谓", that);
      return false
    }
    if (!that.data.pageData.toWriter.length) {
      LL.Tool.showTips("请添加落款", that);
      return false
    }
    if (!that.data.pageData.content.length) {
      LL.Tool.showTips("请添加祝福", that);
      return false
    }
    return true
  }
})