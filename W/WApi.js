var WApi = {

  // 合并: extend     
  // 请求: Ajax / ajaxObject     
  // 图片: imgUrlAdd / imgFirst 
  // 时间: dateFormat / dateStyle / minuteFormat / publishTime / addTimer
  // 路由: getStringUrl / getUrlParam
  // 提示: showSuccess / showFail / showWarning / showTips
  // 其它: priceFormat / twoNum / randomChars 

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
  Ajax: function(options) {
    // 配置默认参数
    var setting = WApi.extend({
      id: WApi.Tool.randomChars(10), //ajax请求id防止重复请求
      hasLoading: true, //是否有loading
      hasLoadingText: "加载中", // 加载中文字
      url: "", //请求接口
      data: {}, //请求参数
      method: "POST", //请求方式
      header: true, //请求数据的格式 (默认json)
      dataType: "json", //返回的数据格式
      responseType: text, //响应的数据类型
      beforeSend: function() {},
      success: function() {},
      fail: function() {},
      complete: function() {},
      abort: function() {}
    }, options)

    // 设置loading
    if (setting.hasLoading) {
      wx.showLoading({
        title: setting.hasLoadingText,
        mask: true
      })
    }
    // 补全接口路由
    setting.url = WApi.Config.AjaxSetting.urlHead + setting.url
    // 传输数据格式
    setting.header = setting.header ? {
      'content-type': 'application/json'
    } : {
      'content-type': 'application/x-www-form-urlencoded'
    }
    // 请求发送前方法 
    setting.beforeSend()

    // 微信请求方法  
    const requestTask = wx.request({
      url: setting.url,
      data: setting.data,
      header: setting.header,
      method: setting.method,
      dataType: setting.dataType,
      responseType: setting.responseType,
      complete: function(res) {
        // 隐藏Loading
        if (setting.hasLoading) {
          wx.hideLoading();
        }
        // 获取数据成功和失败
        if (res.data.issuccess && res.statusCode == 200) {
          setting.success(res.data)
        } else {
          setting.fail(res.data)
        }
        setting.complete(res.data)
      }
    })
  },

  // 列表请求
  ajaxObject: function(options, page) {
    // 列表Ajax配置默认参数
    var setting = WApi.extend({
      name: "listData", //ajax数据名字
      hasLoading: true, // 是否有loading
      hasLoadingText: "加载中", //加载中文字
      url: "", //请求接口
      data: {}, //请求数据
      method: "POST", //请求方式
      header: true, //请求数据的格式 (默认json)
      dataType: "json", //数据格式
      responseType: text, //响应的数据类型
      success: function(res) {
        return res
      },
      fail: function() {},
      complete: function() {},
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
      var data = WApi.extend(setting.data, {
        pageIndex: setting.pageIndex,
        pageSize: setting.pageSize
      })

      // 普通请求方法
      WApi.Ajax({
        hasLoading: setting.hasLoading, //是否有loading
        hasLoadingText: setting.hasLoadingText, //加载中文字
        url: setting.url, //请求接口
        data: data, //请求参数
        header: setting.header, //请求数据的格式 (默认json)
        method: setting.method, //请求方式
        dataType: setting.dataType, //数据格式
        responseType: setting.responseType, //响应的数据类型
        success: function(res) {
          // 获取成功
          setting.ajaxState = 1;
          // 显示数据读取状态
          if (res.data.length) {
            setting.listState = 0;
            setting.pageIndex++;
            // result方法处理数据
            res.data = setting.success(res.data)
            // 添加数据存储对象
            if (!page.data.ajaxData) {
              page.data.ajaxData = {}
            }
            // 第一次添加或合并数据
            if (setting.pageIndex === 1 && !page.data.ajaxData[setting.name]) {
              page.data.ajaxData[setting.name] = res.data
            } else {
              page.data.ajaxData[setting.name] = page.data.ajaxData[setting.name].concat(res.data)
            }
          } else {
            if (setting.pageIndex == 1) {
              setting.listState = 1
            } else {
              setting.listState = 2
            }
          }
          // 添加数据
          page.setData({
            ajaxData: page.data.ajaxData,
            "listAjax.ajaxState": setting.ajaxState,
            "listAjax.listState": setting.listState,
            "listAjax.pageIndex": setting.pageIndex,
            "listAjax.pageSize": setting.pageSize,
          })
          debugger
        },
        fail: function(res) {
          setting.ajaxState = 0;
          page.setData({
            "listAjax.ajaxState": setting.ajaxState,
            "listAjax.listState": setting.listState,
            "listAjax.pageIndex": setting.pageIndex,
            "listAjax.pageSize": setting.pageSize,
          })
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
    this.changeUrl = function(url) {
      setting.url = url
    }
    //增加参数
    this.addData = function(obj) {
      setting.data = WApi.extend(setting.data, obj)
    }
    //删除某个参数
    this.delData = function(arr) {
      for (var key in setting.data) {
        for (var i = 0; i < arr.length; i++) {
          if (key == arr[i]) {
            delete setting.data[arr[i]];
          }
        }
      }
    }
    //改变参数
    this.changeData = function(obj) {
      setting.data = WApi.extend(setting.data, obj)
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

  // that.listAjax = new W.ajaxObject({ }, that)
  // that.listAjax.send()
  // that.listAjax.changeUrl() / changeData() / addData / delData() / changeData()
  // that.listAjax.refreshPage()

  // wx:for="{{ajaxData.listData}}" wx:for-item="item" wx:key="item"
  // <template wx:if="{{listAjax.ajaxState==1}}" is="{{listAjax.listState==2?'noMoreData':listAjax.listState==1'emptyData':''}}" />


  // 下拉刷新、上拉刷新

  // onPullDownRefresh: function() {
  //   var that = this
  //   that.listAjax.refreshPage()
  //   setTimeout(function() {       // 注释: 延时用于兼容ios下拉无法恢复原样
  //      wx.stopPullDownRefresh()            安卓下拉时fixed布局无效
  //   }, 1000) 
  // }
  // {
  //   "enablePullDownRefresh": true,
  //   "onReachBottomDistance": 50
  // }

  // onReachBottom: function () {
  //    var that = this
  //    that.listAjax.send()   下拉刷新页面
  // }

  //====★工具箱★====//  
  Tool: {
    // 1.图片 

    // 图片地址补全
    imgUrlAdd: function(str) {
      return WApi.Config.AjaxSetting.imgUrlHead + str
    },
    // 图片字符串取第一张图片
    imgFirst: function(url, divide, hasImgUrl) {
      if (url) {
        var imgList = url.split(divide)
        if (hasImgUrl) {
          return WApi.Tool.imgUrlAdd(imgList[0])
        } else {
          return imgList[0]
        }
      } else {
        return []
      }
    },

    // 2.时间 

    // 时间戳(1535078410000/2018-03-24T23:41:52)转化为指定格式 (yyyy-mm-dd hh:nn:ss ww)
    dateFormat: function(time, format, toCompletion) { // toCompletion: 是否添加0
      if (time) {
        var date = new Date(time);
        var week = WApi.Config.wordSetting.week
        // 日期是否添加完整
        var completion = function(obj) {
          if (toCompletion) {
            return WApi.Tool.twoNum(obj);
          } else {
            return obj;
          }
        }
        format = format.replace(/[y]{4}/i, date.getFullYear())
        format = format.replace(/[m]{2}/i, completion(date.getMonth() + 1))
        format = format.replace(/[d]{2}/i, completion(date.getDate()))
        format = format.replace(/[h]{2}/i, completion(date.getHours()))
        format = format.replace(/[n]{2}/i, completion(date.getMinutes()))
        format = format.replace(/[s]{2}/i, completion(date.getSeconds()))
        format = format.replace(/[w]{2}/i, "星期" + week[date.getDay()])
        return format
      } else {
        return null
      }
    },
    // 日期格式(20180712)转化为指定格式 (yyyy-mm-dd)
    dateStyle: function(time, format) {
      if (time) {
        var time = time + ""
        var dateArray = time.split("")
        format = format.replace(/[y]{4}/i, dateArray[0] + dateArray[1] + dateArray[2] + dateArray[3])
        format = format.replace(/[m]{2}/i, dateArray[4] + dateArray[5])
        format = format.replace(/[d]{2}/i, dateArray[6] + dateArray[7])
        return format
      } else {
        return null
      }
    },
    // 将秒数显示成分秒 mm:ss
    minuteFormat: function(time) {
      if (time) {
        var minute = WApi.Tool.twoNum(parseInt(time / 60));
        var seconds = WApi.Tool.twoNum(parseInt(time % 60));
        return minute + ":" + seconds
      } else {
        return null
      }
    },
    // 发布时间 (mode:year/day)
    publishTime: function(time, mode) {
      if (time) {
        if (mode == "year") {
          // 当前时间
          var date1 = new Date();
          var dateArray1 = [];
          dateArray1[0] = date1.getFullYear();
          dateArray1[1] = date1.getMonth() + 1;
          dateArray1[2] = date1.getDate();
          dateArray1[3] = date1.getHours();
          dateArray1[4] = date1.getMinutes();
          dateArray1[5] = date1.getMilliseconds();

          // 发布时间
          var date2 = new Date(Number(time));
          var dateArray2 = [];
          dateArray2[0] = date2.getFullYear();
          dateArray2[1] = date2.getMonth() + 1;
          dateArray2[2] = date2.getDate();
          dateArray2[3] = date2.getHours();
          dateArray2[4] = date2.getMinutes();
          dateArray2[5] = date2.getMilliseconds();

          // 时间差
          var dateArray3 = [];
          for (var k = 0; k < 6; k++) {
            dateArray3[k] = dateArray1[k] - dateArray2[k];
          }

          for (var j = 0; j < dateArray3.length; j++) {
            if (dateArray3[j] != 0) {
              if (j == 0) {
                return WApi.Tool.dateFormat(Number(time), "yyyy年mm月dd日");
              } else if (j == 1) {
                return WApi.Tool.dateFormat(Number(time), "mm月dd日");
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
        } else {
          var timeDifference = Date.parse(new Date()) - Number(time);
          if (Math.floor(timeDifference / (24 * 3600 * 1000))) {
            return Math.floor(timeDifference / (24 * 3600 * 1000)) + "天前"
          } else {
            if (Math.floor(timeDifference / (3600 * 1000))) {
              return Math.floor(timeDifference / (3600 * 1000)) + "小时前"
            } else {
              if (Math.floor(timeDifference / (60 * 1000))) {
                return Math.floor(timeDifference / (60 * 1000)) + "分钟前"
              } else {
                return "1分钟内"
              }
            }
          }
        }
      } else {
        return null
      }
    },
    // 验证码定时器
    addTimer: function(page) {
      // 初始化
      page.setData({
        Timer: {
          time: 60,
          text: "获取验证码",
        }
      })
      // 添加倒计时
      return (function() {
        page.Timer = function() {
          var stopTime = setInterval(function() {
            page.data.Timer.text = page.data.Timer.time + "秒"
            page.setData({
              "Timer.text": page.data.Timer.text
            })
            page.data.Timer.time--;
            if (page.data.Timer.time < 0) {
              page.data.Timer.time = 60
              page.data.Timer.text = "获取验证码"
              page.setData({
                "Timer.text": page.data.Timer.text
              })
              clearInterval(stopTime)
            }
          }, 1000)
        }
      })()
    },

    // 3.路由

    // 生成完整url路径
    getStringUrl: function(url, param) {
      var strngUrl = "";
      var newUrl = "";
      if (param) {
        for (var key in param) {
          strngUrl += "&" + key + "=" + param[key];
        }
        newUrl = url + "?" + strngUrl.slice(1)
      } else {
        newUrl = url;
      }
      return newUrl;
    },
    // 获取url路径的指定参数的值
    getUrlParam: function(url, name) {
      var reg = new RegExp("(^|&?)" + name + "=([^&]*)(&|$)", "i");
      var r = url.match(reg);
      if (r != null) {
        return unescape(r[2])
      }
      return null;
    },

    // 4.提示框

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
        image: '../../WApi/images/error.png',
        mask: true
      })
    },
    // 警告  
    showWarning: function(str) {
      wx.showToast({
        title: str,
        image: '../../WApi/images/warning.png',
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

    // 5.其它

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
    // 返回随机字符串
    randomChars: function(num) {
      var str = ""
      var length = WApi.Config.wordSetting.charAndNum().length
      for (var i = 0; i < num; i++) {
        str += WApi.Config.wordSetting.charAndNum()[Math.floor(Math.random() * length)]
      }
      return str
    }
  }
}

module.exports = WApi