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
    backList: [],
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
    var p = wx.getStorageSync("page")
    if (p == "") {//初始化页码
      p = { index: 0 }
      wx.setStorageSync("page", p)
   }
    that.getList(p.index, 1)
  },
  // 拖动开始
  touchStart(e) {
    console.log(e, 'start')
    let startX = e.touches[0].clientX;
    let startY = e.touches[0].clientY;
    this.setData({ startX, startY })
  },
  // 拖动结束
  touchEnd(e) {
    console.log(e, 'end')
    var that = this;
    if (!that.data.isRegister) { //未注册，归回原位
      wx.navigateTo({
        url: '../login/login',
      })
      var list = that.data.list;
      let index = list.length - 1;
      list[index].x = winWidth
      list[index].y = 0
      that.setData({ list })
    }else {
      // 开始移动位置
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
      if (disX > moveDis && disClientX > moveDis) { //判断是否移走
        let isRight = (endX - startX) > 0
        let direction = 1;
        if (isRight) {
          direction = 0;
        }
        var list = that.data.list;
        // let index = e.currentTarget.dataset.index;
        var index = list.length-1;
        console.log(index, list[index])
        list[index].x = isRight ? winWidth * 2 : -winWidth
        that.setData({list});
       
        // 移出动画结束后 从list内移除
        setTimeout(() => {
          list.splice((list.length - 1), 1);
          var right = 0
          if (list.length > 0) {
            right = list[list.length - 1].IsLike
          }
          // that.data.list
          that.setData({ list,right })
          // 列表长度小于4的时候请求服务端
          if (list.length < 3) {
            var p = wx.getStorageSync("page")
            console.log(p)
            that.getList(p.index, 1, direction)
          }
        }, 100)
      } else if (disClientX < 1 && disClientY < 1) {
        // 点击进入
        console.log('点击进入详情')
        wx.navigateTo({
          url: '../user/index?uid=' + e.currentTarget.dataset.id,
        })
      } else {
        console.log('恢复原位')
        var list = that.data.list;
        let index = list.length-1;
        list[index].x = winWidth
        list[index].y = 0
        that.setData({ list })
      }
    }
  },
  onChange: function (e) {
    var that = this;
    that.setData({
      distance: e.detail.x
    })
  },
  onShow: function () {
    var that = this
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
        that.data.isRegister = res.data.Issuccess
      }
    })
  },
  // 点击红心，
  likeYou: function () {
    var that = this
    if(that.data.list.length > 0) {
      var user = that.data.list[that.data.list.length-1]
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
          that.setData({right:1})
          console.log(res.data)
          var isMarried = res.data.Data
          if(isMarried == 1) {
            wx.redirectTo({
              url: '../together/index',
            })
          }
        }
      })
    }else {
      //TODO 无用户处理 
    }
  },
  // 取消红心
  unlikeYou:function() {
    var that = this
    if (that.data.list.length > 0) {
      var user = that.data.list[that.data.list.length - 1]
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
          that.setData({ right: 0 })
          console.log(res.data)
        }
      })
    } else {
      //TODO 无用户处理 
    }
  },
  // 查看消息
  lookMessage: function(e) {
      wx.showToast({
        title: '配对成功后通过添加微信社交哦',
        icon: 'none',
      })
  },
  // 查看自己详情
  lookInfo: function () {
    var that = this
    if (that.data.isRegister) {
      wx.request({
        url: 'https://api.shareone.online/user/info',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: { openid: app.globalData.openid },
        success: function (res) {
          console.log(res.data)
          if (!res.data.Issuccess) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          } else {
            var user = res.data.Data
            wx.navigateTo({
              url: '../user/index?isSelf=true&uid='+user.Id,
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '../login/login',
      })
    }
  },
  // 搜索跳转
  search: function () {
    var that = this
    if (that.data.isRegister) {
      wx.navigateTo({
        url: '../search/index',
      })
    } else {
      wx.navigateTo({
        url: '../login/login',
      })
    }
  },
  
  // 模拟获取列表数据
  getList(index, pageSize, direction) {
    var that = this
    wx.request({
      url: 'https://api.shareone.online/user/list',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        openid: app.globalData.openid,
        direction:direction,
        index:index,
        pageSize:pageSize,
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
        var right = 0
        if(list.length>0) {
          //  红心标识
          right = list[list.length-1].IsLike
          // 下标更新
          var p = wx.getStorageSync("page")
          p.index = list[0].Id
          that.data.p = p
          wx.setStorageSync("page", that.data.p)
        }
        that.setData({ list,right })
      }
    })
  }
})