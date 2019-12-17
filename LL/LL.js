/***********************
====▶项目通用方法◀=====
========★落落★========
***********************/

var LL = {
  //====★版本号★====//
  //文件的版本号，用来区别不同版本文件，修改文件时，修改此版本号
  version: "0.3.2",

  //====★配置文件★====//
  //引入配置文件
  Config: require("Config.js"),

  //====★合并对象★====//
  //合并多个对象，后面对象的属性会覆盖前面对象的属性，不支持深度合并，不支持合并数组   
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

  //====★通用Ajax方法★====//    
  //通用请求方法
  Ajax: function(options, pageData) {
    //Ajax配置项
    var setting = LL.extend({
      id: LL.Tool.randomChars(10), //ajax请求id防止重复请求
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
      setting.url = LL.Config.AjaxSetting.URLHead + setting.url
    }
    var request = function() {
      //显示Loading
      if (setting.hasLoading) {
        wx.showLoading({
          title: LL.Config.AjaxSetting.loadingTitle,
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
        var requestData = LL.extend(setting.data, {
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
          if (res.data.Issuccess) {
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

  //====★工具箱★====//
  //各种工具，辅助方法
  Tool: {
    //图片地址补全
    imgUrlAdd: function(str) {
      return LL.Config.imgURLHead + str
    },
    //时间戳转化为指定格式，例yyyy-mm-dd hh:mm:ss ww
    dateFormat: function(time, format) {
      if (time == undefined) {
        return "null"
      }
      var date = new Date(time * 1000); //这里根据后台时间戳格式调整
      var data = format;
      var weekLib = LL.Config.wordLib.week
      data = data.replace(/[y]{4}/i, date.getFullYear())
      data = data.replace(/[m]{2}/i, LL.Tool.twoNum(date.getMonth() + 1))
      data = data.replace(/[d]{2}/i, LL.Tool.twoNum(date.getDate()))
      data = data.replace(/[h]{2}/i, LL.Tool.twoNum(date.getHours()))
      data = data.replace(/[n]{2}/i, LL.Tool.twoNum(date.getMinutes()))
      data = data.replace(/[s]{2}/i, date.getSeconds())
      data = data.replace(/[w]{2}/i, weekLib[date.getDay()])
      return data
    },
    //日期转化为指定格式，例yyyy-mm-dd
    dateStyle: function(date, format) {
      var date = date + ""
      var dateArry = date.split("")
      var data = format
      data = data.replace(/[y]{4}/i, dateArry[0] + dateArry[1] + dateArry[2] + dateArry[3])
      data = data.replace(/[m]{2}/i, dateArry[4] + dateArry[5])
      data = data.replace(/[d]{2}/i, dateArry[6] + dateArry[7])
      return data
    },
    //价格数据处理，可以取整，取两位小数，或者只取小数
    priceFormat: function(num, style) {
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
    //返回两位数，返回格式可能为数字或字符
    twoNum: function(num) {
      var num = parseInt(num)
      return num > 9 ? num : "0" + num
    },
    //针对后台图片地址数据可能为字符串集合，只取第一张图片，默认加地址 
    onlyOneImg: function(url, mode) {
      var imgList = []
      if (url != undefined) {
        imgList = url.split(",")
      }
      if (mode === false) {
        return imgList[0]
      } else {
        return LL.imgUrlAdd(imgList[0])
      }
    },
    //小程序原生不支持jsonp格式数据，该方法针对某些接口返回的是jsonp格式数据进行解析
    jsonPParse: function(result, callbackName) {
      if (typeof(result) !== "string") {
        console.warn("数据格式错误")
        return false
      }
      var num = callbackName.length + 11
      return JSON.parse(result.slice(num, -3))
    },
    //验证码计时器
    verificationCodeTime: function(that, options) {
      //配置项
      var setting = LL.extend({
        time: 60, //倒计时时间
        text: "获取验证码", //显示文字内容
      }, options)
      var stopTime = setInterval(function() {
        setting.text = setting.time + "秒"
        that.setData({
          "pageData.verificationCodetext": setting.text
        })
        setting.time--
          if (setting.time < 0) {
            setting.time = 60
            setting.text = "获取验证码"
            that.setData({
              "pageData.verificationCodetext": setting.text
            })
            clearInterval(stopTime)
          }
      }, 1000)
    },
    //针对tab页面刷新方法
    //由于小程序tab页面在切换的时候默认是不刷新的，针对该问题进行解决
    tabRefresh: function(options, pageData) {
      //页面隐藏的时候传hide参数，页面显示的时候传show参数
      if (options === "hide") {
        pageData.setData({
          "css.refresh": true
        })
      } else if (options === "show" && pageData.data.css && pageData.data.css.refresh) {
        pageData.onLoad(pageData.data.options)
      }
    },
    //返回随机字符串的方法
    randomChars: function(num) {
      var str = ""
      var length = LL.Config.wordLib.charAndNum.length
      for (var i = 0; i < num; i++) {
        str += LL.Config.wordLib.charAndNum[Math.floor(Math.random() * length)]
      }
      return str
    },
    //时间转化为指定天时分秒，传入秒单位时间,注意不能返回类似出现大于24小时的时间
    timeChange: function(time, format) {
      if (time == undefined) {
        return "null"
      }
      var time = parseInt(time)
      format = format.replace(/[d]{2}/i, Math.floor(time / 86400))
      format = format.replace(/[hh]{2}/i, LL.Tool.twoNum(Math.floor(time % 86400 / 3600)))
      format = format.replace(/[mm]{2}/i, LL.Tool.twoNum(Math.floor(time % 3600 / 60)))
      format = format.replace(/[s]{2}/i, LL.Tool.twoNum(Math.floor(time % 60)))
      return format
    },
    //字符编码，用于替换特殊字符，防止出现意外
    charSwitch: function(str) {
      return escape(str)
    },
    //url参数获取方法，传入url和参数名称
    getQueryString: function(url, name) {
      var reg = new RegExp("(^|&?)" + name + "=([^&]*)(&|$)", "i");
      var r = url.match(reg);
      if (r != null) {
        return unescape(r[2])
      }
      return null;
    },
    //提示信息相关
    showWarning: function(str) {
      wx.showToast({
        title: str,
        image: '../../img/ic-warning.png',
        mask: true
      })
    },
    showSuccess: function(str) {
      wx.showToast({
        title: str,
        mask: true
      })
    },
    showTips: function(str, that) {
      that.setData({
        "pageData.tips": {
          state: true,
          text: str
        }
      })
      setTimeout(function() {
        that.setData({
          "pageData.tips": {
            state: false,
            text: ""
          }
        })
      }, 1500)
    },
    //转换数据进制的方法，传入的是十进制数据
    changeLog(num, log) {
      var int = []

      function getInt() {
        var now = num % log
        int.unshift(now)
        num = Math.floor(num / log)
        if (num > 0) {
          getInt()
        }
      }
      getInt()
      int = int.map(function(item) {
        return arr[item]
      })
      return int.join("")
    }
  },

  getOpenId: function(fn) {
    wx.login({
      success: function(res) {
        if (res.code) {
          //发起网络请求
          LL.Ajax({
            url: LL.Config.AjaxSetting.openIdPort,
            data: {
              code: res.code
            },
            success: function(res) {
              wx.setStorageSync("openID", res.data);
              fn();
            }
          })
        }
      }
    })
  },

  //====★登录方法★====//   
  //通用登录方法
  getUserInfo: function(options, pageData) {
    //**用户登录方法**//
    //配置项
    var setting = LL.extend({
      isJump: true,
      isRegister: false,
      data: {}, //调用注册登录接口的时候需要附加的数据
      infoUrl: LL.Config.AjaxSetting.userInfoPort, // 获取用户信息接口
      openIdUrl: LL.Config.AjaxSetting.openIdPort, // 获取用户openId
      tokenUrl: LL.Config.AjaxSetting.tokenPort, //注册登录接口
      success: function() {}, // 请求成功回调
      fail: function() {}, // 请求失败回调
    }, options)
    getUserInfo()

    function getUserInfo() {
      //先判定Token存不存在
      wx.getStorage({
        key: "Code",
        success: function(res) {
          //存在Token，通过Token获取用户信息        
          LL.Ajax({
            url: setting.infoUrl,
            data: {
              openid: res.data
            },
            success: function(res) {
              var userInfo = res.data
              wx.setStorageSync("openID", userInfo.openid)
              if (pageData) {
                pageData.setData({
                  "userData": userInfo
                })
              }
              //成功获取用户信息
              setting.success(userInfo)
            },
            fail: function() {
              //Token失效，删除Token
              wx.removeStorageSync("Code")
              // 调用获取微信用户信息方法
              if (setting.isRegister) {
                getWeChatInfo()
              } else {
                // wx.navigateTo({
                //   url: '/pages/Home/Register',
                // })
              }
            }
          })
        },
        fail: function() {
          //Token不存在，调用获取微信用户信息方法       
          getWeChatInfo()
        }
      })
    }

    function getWeChatInfo() {
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userInfo']) {
            wx.navigateTo({
              url: 'getUserInfo',
            })
          } else {
            wx.login({
              success: function(res) {
                if (res.code) {
                  //发起网络请求
                  LL.Ajax({
                    url: setting.openIdUrl,
                    data: {
                      code: res.code
                    },
                    success: function(res) {
                      var openid = res.data;
                      wx.setStorageSync("openID", res.data)
                      wx.getUserInfo({
                        success: function(res) {
                          var info = {}
                          info.openid = openid
                          info.nickName = res.userInfo.nickName
                          info.avatarUrl = res.userInfo.avatarUrl
                          //拿到用户openID，执行登录注册方法
                          getToken(info)
                        },
                        //用户取消授权
                        fail: function(res) {
                          // wx.showModal({
                          //   title: "授权失败",
                          //   content: "获取用户信息失败了，重新授权？",
                          //   success: function(res) {
                          //     if (res.confirm) {
                          //       //重新授权
                          //       wx.openSetting()
                          //     }
                          //   }
                          // })
                        }
                      })
                    },
                    fail: function(res) {
                      setting.fail(res);
                    }
                  })
                } else {
                  setting.fail(res);
                }
              }
            });
          }
        }
      })
    }
    //通过微信信息获取用户TOKEN
    function getToken(info) {
      LL.Ajax({
        url: setting.tokenUrl,
        data: info,
        success: function(res) {
          //成功注册，这里直接跳转到完善信息页面
          wx.setStorageSync("Code", res.data.openid)
          // wx.reLaunch({
          //   url: '/pages/User/UserInfo',
          // })
        },
        fail: function(res) {
          setting.fail(res);
        }
      })
    }
  },

  //====★上传图片★====//
  //通用上传图片方法,支持多图上传，返回的是每张图片上传结果的数组
  uploadImg: function(options) {
    //配置项
    var setting = LL.extend({
      hasLoading: true, // 是否有loading     
      url: LL.Config.AjaxSetting.URLHead + LL.Config.AjaxSetting.imgUploadPort, //这里填默认服务器接口
      count: 1, //最多可以选择几张图片
      name: "imagefile", //后台接收的key
      success: function() {}, // 请求成功回调 
      fail: function() {}, // 请求失败回调 
      beforeSend: function() {},
      complete: function() {}
    }, options)
    setting.beforeSend();
    //调用微信方法选择图片
    wx.chooseImage({
      count: setting.count,
      sizeType: ["compressed"],
      success: function(res) {
        var result = res.tempFilePaths
        //成功选择图片后上传图片
        if (setting.hasLoading) {
          wx.showLoading({
            title: "上传中",
            mask: true
          })
        }
        //暂时没有延迟对象，采用另一种思路实现，用队列实现上传
        uploadFile(0)
        var allResult = []

        function uploadFile(i) {
          if (i >= result.length) {
            //完成上传任务
            if (setting.hasLoading) {
              wx.hideLoading();
            }
            setting.success(allResult);
          } else {
            //未完成任务，执行上传任务
            wx.uploadFile({
              url: setting.url,
              filePath: result[i],
              name: setting.name,
              formData: {
                cratmType: "15",
                cratmDir: ""
              },
              success: function(res) {
                allResult.push(JSON.parse(res.data))
                i++
                uploadFile(i)
              },
              fail: function(res) {
                allResult.push(res)
                if (setting.hasLoading) {
                  wx.hideLoading();
                }
                setting.fail(allResult);
              }
            })
          }
        }
      },
      fail: function(res) {
        setting.fail(res);
      }
    })
  },

  //====★支付方法★====//
  //通用支付方法
  payment: function(options) {
    //配置项
    var setting = LL.extend({
      hasLoading: true, // 是否有loading
      url: LL.Config.AjaxSetting.payPort, //支付接口
      data: {},
      success: function() {}, // 请求成功回调 
      fail: function() {}, // 请求失败回调 
      beforeSend: function() {},
      complete: function() {}
    }, options)
    setting.beforeSend()
    //先从服务器获取支付参数
    LL.Ajax({
      url: setting.url,
      data: setting.data,
      dataType: "html",
      success: function(res) {
        pay(res.data)
      },
      fail: function(res) {
        setting.fail(res)
      }
    })
    //调起微信支付方法
    function pay(result) {
      wx.requestPayment({
        "nonceStr": result.nonceStr,
        "package": result.package,
        "paySign": result.paySign,
        "signType": "MD5",
        "timeStamp": result.timeStamp,
        success: function(res) {
          setting.success(res)
        },
        fail: function(res) {
          setting.fail(res)
        },
        complete: function(res) {
          //用户取消支付不会触发fail，需要判断
          if (res.errMsg == "requestPayment:cancel") {
            setting.fail(res)
          }
        }
      })
    }
  },

  //====★自动获取绑定手机★====//
  //自动获取微信用户绑定手机号方法，数据需要后台解密
  registerPhone: function(options) {
    //配置项
    var setting = LL.extend({
      url: LL.Config.AjaxSetting.getPhonePort,
      data: {},
      success: function() {}, // 请求成功回调 
      fail: function() {}, // 请求失败回调 
    }, options)
    //调用ajax方法发送请求
    LL.ajax(setting)
  },

  //====★获取用户openID方法★====//
  //获取用户openID方法，不会先判定，获取成功会储存在缓存里，并且会反馈到页面中,建议在页面进入时静默获取
  getOpenID: function(pageData) {
    //配置
    var setting = {
      url: "https://trade.ehowbuy.com/cgi/cc/miniprog/queryOpenId.htm", //请求接口
      mode: "GET",
      isFeedback: false, //是否开启数据反馈，用来反馈请求是否成功，列表状态,为列表请求时，建议开启
    }
    //在开发模式下，使用虚拟数据
    if (LL.Config.mode === "Development") {
      wx.setStorageSync("openID", LL.Config.NPCInfo.openId)
      pageData.setData({
        "userData.openID": LL.Config.NPCInfo.openId,
      })
      return
    }
    //先调用微信登录方法
    wx.login({
      success: function(res) {
        LL.Ajax({
          hasLoading: false,
          url: setting.url, //请求接口
          urlAuto: false,
          mode: setting.mode,
          data: {
            code: res.code
          },
          isFeedback: setting.isFeedback, //是否开启数据反馈，用来反馈请求是否成功，列表状态,为列表请求时，建议开启
          success: function(res) {
            if (res.code === "0000") {
              pageData.setData({
                "userData.openID": res.body.data.openId,
              })
            }
          }
        })
      }
    })
  },

  //====★可以用来实例化的ajax方法★====//
  //使用new函数构造可以实例化的ajax方法，并通过内部封装的方法修改参数，发送请求。通常用来处理列表请求
  ajaxObject: function(options, pageData) {
    //Ajax配置项
    var setting = LL.extend({
      name: "listData", //ajax数据名字
      hasLoading: true, // 是否有loading
      confirmTitle: false, // 是否有确认框
      url: "", //请求接口
      isList: true, //是否为列表请求，
      urlAuto: true, //是否自动处理地址，可单独处理特殊请求地址
      data: {}, //请求数据
      dataType: "json", //数据格式
      mode: "POST", //请求方式
      isFeedback: true, //是否开启数据反馈，用来反馈请求是否成功，列表状态,为列表请求时，建议开启
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
    var send = function() {
      if (setting.listState === 1 || setting.listState === 2) {
        return
      }
      var data
      if (setting.isList) {
        data = LL.extend(setting.data, {
          pageIndex: setting.pageIndex,
          pageSize: setting.pageSize
        })
      } else {
        data = setting.data
      }
      LL.Ajax({
        hasLoading: setting.hasLoading, // 是否有loading
        confirmTitle: setting.confirmTitle, // 是否有确认框
        url: setting.url, //请求接口
        urlAuto: setting.urlAuto, //是否自动处理地址，可单独处理特殊请求地址
        data: data, //请求数据
        dataType: setting.dataType, //数据格式
        mode: setting.mode, //请求方式
        isList: false, //是否为列表请求
        isFeedback: false, //是否开启数据反馈，用来反馈请求是否成功，列表状态,为列表请求时，建议开启
        success: function(res) {
          //这里可以加一些确认成功的逻辑
          //处理成功逻辑
          res.data = setting.result(res.data)
          //根据页码返回数据
          if (!pageData.data.ajaxData) {
            pageData.data.ajaxData = {}
          }
          if (setting.pageIndex === 1 || !pageData.data.ajaxData[setting.name]) {
            pageData.data.ajaxData[setting.name] = res.data
          } else {
            pageData.data.ajaxData[setting.name] = pageData.data.ajaxData[setting.name].concat(res.data)
          }
          //更新显示数据
          pageData.setData({
            ajaxData: pageData.data.ajaxData,
          })
          //处理列表页码逻辑
          setting.ajaxState = 1
          if (res.data.length > 0) {
            setting.listState = 0
          } else if (res.data.length === 0 && setting.pageIndex === 1) {
            setting.listState = 1
          } else if (res.data.length === 0 && setting.pageIndex > 1) {
            setting.listState = 2
          }
          setting.pageIndex++
            if (setting.isFeedback) {
              pageData.setData({
                "listAjax.ajaxState": setting.ajaxState,
                "listAjax.listState": setting.listState,
                "listAjax.pageIndex": setting.pageIndex,
                "listAjax.pageSize": setting.pageSize,
              })
            }
          setting.success(res.data)
        }, //请求成功回调 
        fail: function(res) {
          setting.ajaxState = 0
          pageData.setData({
            "listAjax.ajaxState": setting.ajaxState,
            "listAjax.listState": setting.listState,
            "listAjax.pageIndex": setting.pageIndex,
            "listAjax.pageSize": setting.pageSize,
          })
          //处理失败逻辑
          setting.fail(res)
        }, //请求失败回调
        complete: function(res) {
          setting.complete(res)
        }, //请求完成后回调
      }, pageData)
    }
    //发送方法
    this.send = function() {
      send()
    }
    //删除某个参数
    this.delData = function(name) {
      delete setting.data[name]
    }
    //增加参数
    this.addData = function(obj) {
      setting.data = LL.extend(setting.data, obj)
    }
    //改变参数
    this.changeData = function(obj) {
      setting.data = LL.extend(setting.data, obj)
    }
    //刷新页面
    this.refreshPage = function() {
      setting.ajaxState = 1
      setting.listState = 0
      setting.pageIndex = 1
      send()
    }
    //更改请求地址
    this.changeURL = function(url) {
      setting.url = url
    }
    //查看设置内容
    this.showSetting = function() {
      console.log(setting)
    }
  },

  //====★延迟对象★====//
  //由于嫌弃网上延迟对象改造麻烦，自己写一个延迟对象的方法，用来处理一些需要引入延迟对象的过程，使用时，请先实例化延迟对象
  Deferred: {
    //这个是用来实例化的原型方法,可以用来绑定单个延迟对象
    Object: function() {
      //配置
      var setting = {
        state: 0, //延迟对象状态，0初始化，1失败了，2成功了
        done: function() {},
        fail: function() {},
        then: function() {},
      }
      this.resolved = function() {
        if (setting.state === 0) {
          setting.state = 2
          setting.done()
          setting.then()
        }
      }
      this.rejected = function() {
        if (setting.state === 0) {
          setting.state = 1
          setting.fail()
          setting.then()
        }
      }
      this.done = function(method) {
        setting.done = method
        return this
      }
      this.fail = function(method) {
        setting.fail = method
        return this
      }
      this.then = function(method) {
        setting.then = method
        return this
      }
      this.checked = function() {
        return setting.state
      }

    },
    //这个是用来绑定多个延迟对象的方法，直接调用，传入延迟对象即可
    when: function() {
      var newDeferred = new LL.Deferred.Object()
      var setting = {
        state: [],
        length: arguments.length,
        done: function() {},
        fail: function() {},
        then: function() {},
      }
      for (var i = 0; i < arguments.length; i++) {
        arguments[i].done(function() {
          setting.state.push(true)
          checked()
        })
        arguments[i].fail(function() {
          setting.state.push(false)
          checked()
        })
      }

      function checked() {
        if (setting.state.length === setting.length) {
          for (var j = 0; j < setting.state.length; j++) {
            if (!setting.state[j]) {
              break
            }
          }
          if (j === setting.state.length) {
            newDeferred.resolved()
          } else {
            newDeferred.rejected()
          }
        }
      }
      return newDeferred
    }
  }
}

//ES6标准接口
module.exports = LL