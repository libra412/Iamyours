var W = {
  // 如果分享页面到别的页面则需要将onUnload方法删除
  // 请求: Ajax / ajaxObject     
  // 图片: imgUrlAdd / imgFirst 
  // 时间: dateFormat / dateStyle / timeChange / minuteFormat / beforeTimeFormat / Timer
  // 提示: showWarning / showSuccess / showFail / showTips 
  // 其它: priceFormat / twoNum / GetStringUrl / getQueryString / randomChars

  Config: require("Config.js"),

  // 合并对象  
  extend: function() {
    var mainObj = arguments[0]
    for (var j = 1; j <= arguments.length; j++) {
      if (arguments[j] === undefined) {
        continue //跳过未定义
      }
      for (var item in arguments[j]) {
        mainObj[item] = arguments[j][item]
      }
    }
    return mainObj
  },

  //====★Ajax请求★====//

  // 普通请求
  Ajax: function(options, page) {
    // 配置默认参数
    var setting = W.extend({
      id: W.Tool.randomChars(10), //ajax请求id防止重复请求
      hasLoading: true, // 是否有loading
      header: true, //请求数据的格式 (默认json)
      url: "", //请求接口
      data: {}, //请求参数
      dataType: "json", //数据格式
      method: "POST", //请求方式
      beforeSend: function() {}, //请求前方法
      success: function() {}, //请求成功回调 
      fail: function() {}, //请求失败回调
      complete: function() {}, //请求完成后回调
    }, options)

    // 锁定ajax状态，防止重复请求  
    var app = getApp()
    if (app.globalData[setting.id]) {
      return
    }
    app.globalData[setting.id] = true

    // 设置loading
    if (setting.hasLoading) {
      wx.showLoading({
        title: "加载中",
        mask: true
      })
    }
    // 传输数据格式
    setting.header = setting.header ? {
      'content-type': 'application/json'
    } : {
      'content-type': 'application/x-www-form-urlencoded'
    }
    // 补全接口路由
    setting.url = W.Config.AjaxSetting.UrlHead + setting.url
    // 请求发送前方法 
    setting.beforeSend()

    // 微信请求方法  
    wx.request({
      url: setting.url,
      data: setting.data,
      header: setting.header,
      method: setting.method,
      dataType: setting.dataType,
      complete: function(res) {
        // 隐藏Loading
        if (setting.hasLoading) {
          wx.hideLoading();
        }
        // 获取数据成功和失败
        if (res.data.issuccess) {
          setting.success(res.data)
        } else {
          setting.fail(res.data)
        }
        setting.complete(res.data)
        app.globalData[setting.id] = false
      }
    })
  },

  //====★通用Ajax方法★====//    
  //通用请求方法
  ajaxObject: function(options, pageData) {
    debugger
    //Ajax配置项
    var setting = W.extend({
      id: W.Tool.randomChars(10), //ajax请求id防止重复请求
      hasLoading: true, // 是否有loading
      confirmTitle: false, // 是否有确认框
      header: true, //请求数据的格式 (默认json)
      url: "", //请求接口
      urlAuto: true, //是否自动处理地址，可单独处理特殊请求地址
      data: {}, //请求数据
      dataType: "json", //数据格式
      mode: "POST", //请求方式
      isList: false, //是否为列表请求
      isFeedback: true, //是否开启数据反馈，用来反馈请求是否成功，列表状态,为列表请求时，建议开启
      success: function() {}, //请求成功回调 
      fail: function() {}, //请求失败回调
      beforeSend: function() {}, //请求前方法
      complete: function() {}, //请求完成后回调
      ajaxState: 1, //请求状态码，0失败,1成功
      listState: 0, //列表请求状态码，0正常，1暂无数据，2已无更多
      pageIndex: 1, //列表请求页面序号初始值
      pageSize: 10, //列表请求页面数组大小
    }, options)
    // //锁定ajax状态，防止重复请求
    var app = getApp()
    if (app.globalData[setting.id]) {
      return
    }
    app.globalData[setting.id] = true

    // 传输数据格式
    setting.header = setting.header ? {
      'content-type': 'application/json'
    } : {
      'content-type': 'application/x-www-form-urlencoded'
    }

    //是否自动处理地址
    if (setting.urlAuto) {
      //针对api项目添加api头部
      if (LL.Config.AjaxSetting.isApi && !(/^\/api/i.test(setting.url))) {
        setting.url = "/api" + setting.url
      }
      //添加url前缀
      setting.url = W.Config.AjaxSetting.URLHead + setting.url
    }
    var request = function() {
      //显示Loading
      if (setting.hasLoading) {
        wx.showLoading({
          title: W.Config.AjaxSetting.loadingTitle,
          mask: true
        })
      }
      //先处理发送前方法
      setting.beforeSend()
      //处理是否反馈请求状态逻辑
      if (setting.isFeedback && pageData) {
        //初始化请求状态码
        if (pageData.data.AjaxState) {
          setting.ajaxState = pageData.data.AjaxState.ajaxState || 1
          setting.listState = pageData.data.AjaxState.listState || 0
          setting.pageSize = pageData.data.AjaxState.pageSize || 10
          setting.pageIndex = pageData.data.AjaxState.pageIndex || 1
        } else {
          pageData.setData({
            AjaxState: {
              ajaxState: setting.ajaxState,
              listState: setting.listState,
              pageSize: setting.pageSize,
              pageIndex: setting.pageIndex,
            }
          })
        }
      }
      //配置请求数据
      if (setting.isList) {
        var requestData = W.extend(setting.data, {
          pageSize: setting.pageSize,
          pageIndex: setting.pageIndex
        })
      } else {
        var requestData = setting.data
      }
      //调用微信方法发送请求  
      wx.request({
        url: setting.url,
        data: setting.data,
        method: setting.mode,
        header: setting.header,
        dataType: setting.dataType,
        complete: function(res) {
          //隐藏Loading
          if (setting.hasLoading) {
            wx.hideLoading();
          }
          //判断请求是否成功，执行相关逻辑，注意判断成功逻辑不同项目有可能不一样
          //先处理data数据
          try {
            res.data = JSON.parse(res.data)
          } catch (e) {}
          if (res.data.issuccess) {
            //请求成功逻辑
            //处理列表状态逻辑,注意各个项目列表逻辑不一定一样
            if (setting.isList && res.data.length > 0) {
              setting.pageIndex++
                setting.listState = 0
            } else if (setting.isList && res.data.length === 0) {
              if (setting.pageIndex === 1) {
                setting.listState = 1
              } else {
                setting.listState = 2
              }
            }
            setting.ajaxState = 1
            setting.success(res.data)
          } else {
            setting.ajaxState = 0
            setting.fail(res.data)
          }
          //根据是否有数据反馈，将列表状态反馈到页面上
          if (setting.isFeedback && pageData) {
            pageData.setData({
              AjaxState: {
                ajaxState: setting.ajaxState,
                listState: setting.listState,
                pageSize: setting.pageSize,
                pageIndex: setting.pageIndex,
              }
            })
          }
          setting.complete(res.data)
          app.globalData[setting.id] = false
        }
      })
    }
    //确认弹出框
    if (setting.confirmTitle !== false) {
      wx.showModal({
        title: "确认",
        content: setting.confirmTitle,
        success: function(res) {
          if (res.confirm) {
            request()
          }
        }
      })
    } else {
      request()
    }
  },

  // 列表请求
  ajaxObject: function(options, page) {
    // 列表Ajax配置默认参数
    var setting = W.extend({
      name: "listData", //ajax数据名字
      hasLoading: true, // 是否有loading
      header: true, //请求数据的格式 (默认json)
      url: "", //请求接口
      data: {}, //请求数据
      dataType: "json", //数据格式
      method: "POST", //请求方式
      result: function(res) {
        return res
      }, //添加返回数据处理方法，同步方法
      success: function() {}, //请求成功回调 
      fail: function() {}, //请求失败回调
      complete: function() {}, //请求完成后回调
      ajaxState: 1, //请求状态码，0失败,1成功
      listState: 0, //列表请求状态码，0正常，1暂无数据，2已无更多
      pageIndex: 1, //列表请求页面序号初始值
      pageSize: 10, //列表请求页面数组大小
    }, options)

    // 数据获取
    var send = function() {
      // 已无数据可以获取
      if (setting.listState !== 0) {
        return
      }

      // 参数添加pageIndex和pageSize
      var data = W.extend(setting.data, {
        pageIndex: setting.pageIndex,
        pageSize: setting.pageSize
      })

      // 普通请求方法
      W.Ajax({
        hasLoading: setting.hasLoading, //是否有loading
        url: setting.url, //请求接口
        data: data, //请求参数
        header: setting.header, //请求数据的格式 (默认json)
        method: setting.method, //请求方式
        dataType: setting.dataType, //数据格式
        success: function(res) {
          // result方法处理数据
          res.data = setting.result(res.data)
          // 添加数据存储对象
          if (!page.data.ajaxData) {
            page.data.ajaxData = {}
          }
          // 第一次添加或合并数据
          if (setting.pageIndex === 1 || !page.data.ajaxData[setting.name]) {
            page.data.ajaxData[setting.name] = res.data
          } else {
            page.data.ajaxData[setting.name] = page.data.ajaxData[setting.name].concat(res.data)
          }
          // 显示数据
          page.setData({
            ajaxData: page.data.ajaxData
          })
          // 显示数据读取状态
          if (res.data.length > 0) {
            setting.listState = 0;
            setting.pageIndex++
          } else if (res.data.length === 0 && setting.pageIndex === 1) {
            setting.listState = 1
          } else if (res.data.length === 0 && setting.pageIndex > 1) {
            setting.listState = 2
          }
          page.setData({
            "listAjax.ajaxState": setting.ajaxState,
            "listAjax.listState": setting.listState,
            "listAjax.pageIndex": setting.pageIndex,
            "listAjax.pageSize": setting.pageSize,
          })
          setting.success(res.data)
        },
        fail: function(res) {
          setting.ajaxState = 0
          setting.fail(res)
        },
        complete: function(res) {
          setting.complete(res)
        },
      }, page)
    }
    //发送方法
    this.send = function() {
      send()
    }
    //更改请求地址
    this.changeURL = function(url) {
      setting.url = url
    }
    //增加参数
    this.addData = function(obj) {
      setting.data = W.extend(setting.data, obj)
    }
    //删除某个参数
    this.delData = function(arr) {
      for (var key in setting.data) {
        for (var i = 0; i < arr.length; i++) {
          if (key == arr[i]) {
            delete setting.data[name];
          }
        }
      }
    }
    //改变参数
    this.changeData = function(obj) {
      setting.data = W.extend(setting.data, obj)
    }
    //刷新页面
    this.refreshPage = function() {
      setting.ajaxState = 1
      setting.listState = 0
      setting.pageIndex = 1
      send()
    }
  },

  // 列表请求

  // that.listAjax = new W.ajaxObject({
  //   result: function (res) {
  //     return res
  //   }
  // }, that)
  // that.listAjax.send()
  // that.listAjax.changeURL() / changeData() / addData / delData()
  // that.listAjax.refreshPage()

  // wx:for="{{ajaxData.listData}}" wx:for-item="item" wx:key="item"
  // <template wx:if="{{listAjax.ajaxState==1}}" is="{{listAjax.listState==2?'noMoreData':listAjax.listState==1'emptyData':''}}" />


  // 下拉刷新、上拉刷新

  // onPuWDownRefresh: function() {
  //   var that = this
  //   that.listAjax.refreshPage()
  //   setTimeout(function() {
  //     wx.stopPuWDownRefresh()
  //   }, 1000)
  // }
  // {
  //   "enablePuWDownRefresh": true;
  //   "onReachBottomDistance": 50;
  // }

  // onReachBottom: function () {
  //    var that = this
  //    that.listAjax.send()
  // }

  //====★工具箱★====//  
  Tool: {
    //** 图片 **//

    // 图片地址补全
    imgUrlAdd: function(str) {
      return W.Config.AjaxSetting.imgUrlHead + str
    },
    // 图片字符串取第一张图片
    imgFirst: function(url, divide, hasImgUrl) {
      var imgList = []
      if (url) {
        imgList = url.split(divide)
      }
      if (hasImgUrl === false) {
        return imgList[0]
      } else {
        return W.Tool.imgUrlAdd(imgList[0])
      }
    },

    //** 时间 **//

    // 时间戳(1535078410000/2018-03-24T23:41:52)转化为指定格式 (yyyy-mm-dd hh:nn:ss ww)
    dateFormat: function(time, format, toCompletion) { // toCompletion: 是否添加0
      if (time) {
        var date = new Date(time);
        var week = W.Config.wordSetting.week
        // 日期是否添加完整
        var completion = function(obj) {
          if (toCompletion) {
            return W.Tool.twoNum(obj);
          } else {
            return obj;
          }
        }
        format = format.replace(/[y]{4}/i, date.getFullYear())
        format = format.replace(/[m]{2}/i, completion(date.getMonth() + 1))
        format = format.replace(/[d]{2}/i, completion(date.getDate()))
        format = format.replace(/[h]{2}/i, completion(date.getHours()))
        format = format.replace(/[n]{2}/i, completion(date.getMinutes()))
        format = format.replace(/[s]{2}/i, date.getSeconds())
        format = format.replace(/[w]{2}/i, week[date.getDay()])
        return format
      } else {
        return "null"
      }
    },
    // 日期格式(20180712)转化为指定格式 (yyyy-mm-dd)
    dateStyle: function(date, format) {
      var date = date + ""
      var dateArry = date.split("")
      format = format.replace(/[y]{4}/i, dateArry[0] + dateArry[1] + dateArry[2] + dateArry[3])
      format = format.replace(/[m]{2}/i, dateArry[4] + dateArry[5])
      format = format.replace(/[d]{2}/i, dateArry[6] + dateArry[7])
      return format
    },
    // 时间差转化为指定天时分秒 (dd hh:mm:ss)  
    timeChange: function(time, format) {
      if (time == undefined) {
        return "null"
      }
      var time = parseInt(time)
      format = format.replace(/[d]{2}/i, Math.floor(time / 86400))
      format = format.replace(/[hh]{2}/i, W.Tool.twoNum(Math.floor(time % 86400 / 3600)))
      format = format.replace(/[mm]{2}/i, W.Tool.twoNum(Math.floor(time % 3600 / 60)))
      format = format.replace(/[s]{2}/i, W.Tool.twoNum(Math.floor(time % 60)))
      return format
    },
    // 将秒数显示成 mm:ss
    minuteFormat: function(time) {
      var minute = parseInt(time / 60) > 9 ? parseInt(time / 60) : "0" + parseInt(time / 60);
      var seconds = parseInt(time % 60) > 9 ? parseInt(time % 60) : "0" + parseInt(time % 60);
      return minute + ":" + seconds
    },
    // 距当前的时间差
    beforeTimeFormat: function(time) {
      // 当前时间
      var date1 = new Date();
      var dateArray1 = [];
      dateArray1[0] = date1.getFuWYear();
      dateArray1[1] = date1.getMonth() + 1;
      dateArray1[2] = date1.getDate();
      dateArray1[3] = date1.getHours();
      dateArray1[4] = date1.getMinutes();
      dateArray1[5] = date1.getMiWiseconds();

      // 创建时间
      var date2 = new Date(time);
      var dateArray2 = [];
      dateArray2[0] = date2.getFuWYear();
      dateArray2[1] = date2.getMonth() + 1;
      dateArray2[2] = date2.getDate();
      dateArray2[3] = date2.getHours();
      dateArray2[4] = date2.getMinutes();
      dateArray2[5] = date2.getMiWiseconds();

      // 时间差
      var dateArray3 = [];
      for (var k = 0; k < 6; k++) {
        dateArray3[k] = dateArray1[k] - dateArray2[k];
      }

      for (var j = 0; j < dateArray3.length; j++) {
        if (dateArray3[j] != 0) {
          if (j == 0) {
            return W.Tool.dateFormat(time, "yyyy年mm月dd日");
          } else if (j == 1) {
            return W.Tool.dateFormat(time, "mm月dd日");
          } else if (j == 2) {
            return dateArray3[j] + "天前"
          } else if (j == 3) {
            return dateArray3[j] + "小时前"
          } else if (j == 4) {
            return dateArray3[j] + "分钟前"
          } else if (j == 5) {
            return "1分钟内"
          }
        }
      }
    },
    // 验证码定时器
    Timer: function(options, page) {
      //配置项
      var setting = W.extend({
        time: 60, //倒计时时间
        text: "获取验证码", //显示文字内容
      }, options)
      var stopTime = setInterval(function() {
        setting.text = setting.time + "秒"
        page.setData({
          "page.Timer": setting.text
        })
        setting.time--
          if (setting.time < 0) {
            setting.time = 60
            setting.text = "获取验证码"
            page.setData({
              "page.Timer": setting.text
            })
            clearInterval(stopTime)
          }
      }, 1000)
    },


    //** 提示框 **//

    // 警告  
    showWarning: function(str) {
      wx.showToast({
        title: str,
        image: '../../img/ic-warning.png',
        mask: true
      })
    },
    // 成功
    showSuccess: function(str) {
      wx.showToast({
        title: str,
        mask: true
      })
    },
    // 失败
    showFail: function(str) {
      wx.showToast({
        title: str,
        image: '../../img/common/error.png',
        mask: true
      })
    },
    // 普通提示
    showTips: function(str, page) {
      page.setData({
        "pageData.tips": {
          state: true,
          text: str
        }
      })
      setTimeout(function() {
        page.setData({
          "pageData.tips": {
            state: false,
            text: ""
          }
        })
      }, 1500)
    },

    //** 常用处理 **//

    // 价格
    priceFormat: function(num, style) { //价格数据处理，可以取整，取两位小数，或者只取小数
      //如果不是数字，则原样返回
      if (isNaN(num)) {
        return num
      }
      if (style == "int") {
        return Math.floor(num)
      } else if (style == "float") {
        return num.toFixed(2).split(".")[1]
      } else {
        return num.toFixed(2) // 没有参数style时，保留两位小数
      }
    },
    // 返回两位数
    twoNum: function(num) {
      var num = parseInt(num)
      return num > 9 ? num : "0" + num
    },
    // 生成完整路径
    GetStringUrl: function(url, param) {
      var strngUrl = "";
      for (var key in param) {
        strngUrl += "&" + key + "=" + param[key];
      }
      return url + "?" + strngUrl.slice(1);
    },
    // 获取url的指定参数的值
    getQueryString: function(url, name) {
      var reg = new RegExp("(^|&?)" + name + "=([^&]*)(&|$)", "i");
      var r = url.match(reg);
      if (r != null) {
        return unescape(r[2])
      }
      return null;
    },
    // 返回随机字符串
    randomChars: function(num) {
      var str = ""
      var length = W.Config.wordSetting.charAndNum().length
      for (var i = 0; i < num; i++) {
        str += W.Config.wordSetting.charAndNum()[Math.floor(Math.random() * length)]
      }
      return str
    },

    // 验证
    // 手机号验证
    checkMobile: function(value) {
      if (!/^[1][3,4,5,7,8][0-9]{9}$/.test(parseInt(value))) {
        return false
      } else {
        return true
      }
    }
  }
}

module.exports = W