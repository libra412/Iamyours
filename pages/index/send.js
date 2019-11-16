// pages/postCard/send.js
var LL = require("../../LL/LL.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    frameClass1: 'frame z1', //默认正面在上面
    frameClass2: 'frame z2'
  },

  // 新的旋转方法
  rotateFn: function(e) {
    var that = this;
    if (that.data.frameClass1 == 'frame z1' && that.data.frameClass2 == 'frame z2') {
      that.setData({
        frameClass1: "frame front",
        frameClass2: "frame back",
      })
      setTimeout(function() {
        that.setData({
          frameClass1: "frame z2",
          frameClass2: "frame z1",
        })
      }, 1000);
    } else {
      that.setData({
        frameClass1: "frame back",
        frameClass2: "frame front",
      })
      setTimeout(function() {
        that.setData({
          frameClass1: "frame z1",
          frameClass2: "frame z2",
        })
      }, 1000);
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var app = getApp();

    // options.shareOpenID = 1;

    // 初始化设置
    that.setData({
      pageData: {
        createPostCard: options.createPostCard,
        rotateCard: options.rotateCard,
        letter: options.letter,
        shareOpenID: options.shareOpenID,
        shopId: options.shopId,
        isBack: false,
        isShare: false,
        hasSend: false,
        showMask: false,
        changeTime: 0,
      }
    })

    // 判定是否已经收藏此明信片

    if (wx.getStorageSync("collect")) {
      if (wx.getStorageSync("collect").indexOf(options.rotateCard) == -1) {
        that.setData({
          "pageData.hasCollectText": "收藏明信片",
          "pageData.collectStatus": false
        })
      } else {
        that.setData({
          "pageData.hasCollectText": "已收藏",
          "pageData.collectStatus": true
        })
      }
    } else {
      that.setData({
        "pageData.hasCollectText": "收藏明信片",
        "pageData.collectStatus": false
      })
    }

    // 获取基本信息

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          width: res.windowWidth,
          height: res.windowHeight
        })
      },
    })

    LL.getUserInfo({
      success: function() {
        // 点击保存图片
        LL.Ajax({
          url: "creat_qrcode",
          data: {
            imageUrl: app.imgUrl.replace("https://mxp.mammothcode.com/", "C:/mingxinpian/"),
            fromUser: that.data.userData.nickName
          },
          success: function(res) {
            that.setData({
              "pageData.toStore": res.data
            })
          }
        })
      }
    }, that);

    // 获取领取福利弹出框图片

    LL.Ajax({
      url: "show_shop",
      data: {
        shopId: app.shopId
        // shopId: 1
      },
      success: function(res) {
        var couponUrl =encodeURIComponent(res.data.couponUrl);
        that.setData({
          "pageData.getImg": res.data.logoImg,
          "pageData.intro": res.data.intro,
          "pageData.shopName": res.data.shopName,
          "pageData.couponUrl": couponUrl
        })
      }
    })

    // 分享的时候出现的请求
    if (options.shareOpenID) {
      that.setData({
        "pageData.isShare": true,
        "pageData.imgUrl": options.imgUrl
      })

      LL.getUserInfo({
        success: function() {
          // 保存对应的绑定用户的openID
          LL.Ajax({
            url: "save_send_record",
            data: {
              fromOpenid: options.shareOpenID,
              toOpenid: wx.getStorageSync("openID"),
              imgUrl: that.data.pageData.createPostCard,
              shopId: that.data.pageData.shopId,
            },
            success: function() {
              console.log("绑定成功");
            }
          })
        }
      }, that)

      // 分享翻转动画初始化

      // that.time = setInterval(function() {
      //   that.rotate();
      // }, 5000)
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

  // 旋转
  rotate: function() {
    var that = this;
    var animation = wx.createAnimation({
      duration: 1500,
      timingFunction: 'ease',
    })
    if (that.data.pageData.changeTime % 2) {
      animation.rotateY(0).step();
    } else {
      animation.rotateY(180).step();
    }
    that.data.pageData.changeTime++;

    that.setData({
      animationData: animation.export(),
      "pageData.changeTime": that.data.pageData.changeTime
    })
    setTimeout(function() {
      that.setData({
        "pageData.isBack": !that.data.pageData.isBack,
      })
    }, 500)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var that = this;
    var app = getApp();

    return {
      title: that.data.userData.nickName + "，寄来一张明信片，打开看看TA说了啥",
      path: '/pages/index/send?shareOpenID=' + wx.getStorageSync("openID") + "&shopoId=" + that.data.pageData.shopId + "&imgUrl=" + app.imgUrl + "&createPostCard=" + that.data.pageData.createPostCard + "&rotateCard=" + that.data.pageData.rotateCard + "&letter=" + that.data.pageData.letter,
      imageUrl: app.imgUrl,
      success: function() {
        that.setData({
          "pageData.hasSend": true,
          "pageData.showMask": true
        })
      },
      fail: function() {
        LL.Tool.showTips("分享失败", that);
      }
    }
  },
  Event: function(e) {
    var that = this;
    switch (e.currentTarget.dataset.id) {
      //  旋转
      case "rotate":
        // clearInterval(that.time);
        that.rotate();
        // setTimeout(function() {
        //   that.time = setInterval(function() {
        //     that.rotate();
        //   }, 5000)
        // }, 1000)
        break
        // 保存图片
      case "saveImg":
        // 已收藏
        if (e.currentTarget.dataset.status) {
          return
        }
        var src = "";
        //收藏类型
        if (e.currentTarget.dataset.type == "imgUrl") {
          src = that.data.pageData.rotateCard;
        } else {
          src = that.data.pageData.toStore;
        }
        wx.getImageInfo({
          src: src,
          success: function(res) {
            wx.saveImageToPhotosAlbum({
              filePath: res.path,
              success: function(res) {
                LL.Tool.showTips("图片保存成功", that);
                if (that.data.pageData.shareOpenID) {
                  that.setData({
                    "pageData.hasCollectText": "已收藏",
                    "pageData.collectStatus": true,
                  })
                  var collect = wx.getStorageSync("collect") ? wx.getStorageSync("collect") : [];
                  collect.push(that.data.pageData.rotateCard);
                  wx.setStorageSync("collect", collect);
                } else {
                  that.setData({
                    "pageData.hasSend": true,
                    "pageData.showMask": true,
                  })
                }
              },
              fail: function(res) {
                LL.Tool.showTips("图片保存失败", that);
              },
            })
          }
        })
        break
        // 跳转到h5页面
      case "web-view":
        wx.navigateTo({
          url: "web-view?couponUrl=" + that.data.pageData.couponUrl
        })
        break
        // 选择明信片
      case "toChoose":
        // clearInterval(that.time);
        wx.navigateTo({
          url: 'choose',
        })
        break
        // 关闭小程序
      case "finish":
        wx.reLaunch({
          url: 'choose',
        })
        break
    }
    switch (e.target.dataset.id) {
      // 关闭弹出层
      case "close":
        that.setData({
          "pageData.showMask": false,
        })
    }
  }
})