// 
var app = getApp()

let winWidth = 414;
let winHeight = 736;
let ratio = 2;
function deepClone(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  let newObj = obj instanceof Array ? [] : {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key]
    }
  }
  return newObj
}
Page({
  data: {
    x: winWidth,
    y: winHeight,
    animationA: {},
    list: [],
    distance: "",
    startX: '',
    startY: '',
  },
  onLoad: function () {
    var that = this;
    var res = wx.getSystemInfoSync();
    winWidth = res.windowWidth;
    winHeight = res.windowHeight;
    ratio = res.pixelRatio
    this.getList()
    if (that.data.list.length > 0) {
      var user = that.data.list[that.data.list.length - 1]
      wx.request({
        url: 'https://api.shareone.online/user/likeStatus',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          openid: app.globalData.openid,
          likeOpenid: user.Openid
        },
        success: function (res) {
          that.setData({
            right: res.data.Data
          })
        }
      })
    }
  },
  // 
  touchStart(e) {
    console.log(e, 'start')
    let startX = e.touches[0].clientX;
    let startY = e.touches[0].clientY;
    this.setData({ startX, startY })
  },
  // 拖动结束
  touchEnd(e) {
    var that = this;
    let startX = this.data.startX;
    let startY = this.data.startY;
    let endX = e.changedTouches[0].clientX;
    let endY = e.changedTouches[0].clientY;
    var distance = that.data.distance;
    // 与结束点与图片初始位置距离
    let disX = Math.abs(distance - winWidth)
    // 当前操作，初始点与结束点距离
    let disClientX = Math.abs(endX - startX)
    let disClientY = Math.abs(endY - startY)
    // 当滑动大于 滑块宽度的1/3翻页
    let moveDis = 666 / (ratio * 4);
    if (disX > moveDis && disClientX > moveDis) {
      var list = that.data.list;
      let index = e.currentTarget.dataset.index;
      list[index].x = (endX - startX) > 0 ? winWidth * 2 : -winWidth
      if ((endX - startX) > 0) {// 向右滑动
          wx.request({
            url: 'https://api.shareone.online/user/like',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              openid: app.globalData.openid,
              uid: e.currentTarget.dataset.id
            },
            success: function (res) {
                console.log(res.data)
            }
          })
      }
      that.setData({
        list: list,
        animationA: null
      });
      // 移出动画结束后 从list内移除
      setTimeout(() => {
        list.splice((list.length - 1), 1);
        that.setData({ list })
        // 列表长度小于4的时候请求服务端
        if (list.length < 4) {
          that.getList()
        }
        if (that.data.list.length > 0) { // 当前这个人是否是喜欢
          var user = that.data.list[that.data.list.length - 1]
          wx.request({
            url: 'https://api.shareone.online/user/likeStatus',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              openid: app.globalData.openid,
              likeOpenid: user.Openid
            },
            success: function (res) {
              that.setData({
                right: res.data.Data
              })
            }
          })
        }

      }, 300)
    } else if (disClientX < 1 && disClientY < 1) {
      // 点击进入
      console.log('点击进入详情')
      wx.navigateTo({
        url: '../user/index?uid=' + e.currentTarget.dataset.id,
      })
    } else {
      var list = that.data.list;
      let index = e.currentTarget.dataset.index;
      list[index].x = winWidth
      list[index].y = 0
      that.setData({ list })
    }
  },
  onChange: function (e) {
    var that = this;
    that.setData({
      distance: e.detail.x
    })
  },
  // 模拟获取列表数据
  getList() {
    var that = this
    wx.request({
      url: 'https://api.shareone.online/user/list',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        openid: app.globalData.openid
      },
      success: function (res) {
        var data = res.data.Data
        let list = that.data.list || [];
        let arr = data || []
        for (let i of arr) {
          i.x = winWidth
          i.y = 0
          list.unshift(i)
        }
        that.setData({ list })
      }

    })
  }
})