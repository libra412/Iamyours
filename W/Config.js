/***********************
=====▶项目配置文件◀=====
=========★方★==========
***********************/

var Config = {

  ////====Ajax请求配置====////
  AjaxSetting: {
    //所有请求地址头部
    UrlHead: "https://shierchajian.mammothcode.com",
    //所有图片地址头部
    imgUrlHead: "http://123.206.198.137:1099",

    //获取用户openId接口
    getOpenid: "",
    //获取用户TOKEN接口
    getToken: "",
    //获取用户信息接口    
    getUserInfo: "",

    //图片、视频、音频上传接口
    Upload: "",
    //支付接口
    requestPayment: "",
    //获取用户手机号接口
    getPhonePort: "",
  },

  ////====字典库====////
  wordSetting: {
    //数字
    int: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    //小写字母
    smallChar: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    //大写字母
    bigChar: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    //所有字母
    char: function() {
      return Config.wordSetting.smallChar.concat(Config.wordSetting.bigChar)
    },
    //字母加数字
    charAndNum: function() {
      return Config.wordSetting.smallChar.concat(Config.wordSetting.bigChar).concat(Config.wordSetting.int)
    },
    //星期格式
    week: ["日", "一", "二", "三", "四", "五", "六"]
  },

  ////====正则表达式====////
  regularSetting: {
    //电话号码
    phone: /^1[3|4|5|7|8][0-9]{9}$/,
    //中文字符1-10个
    Chinese: /^[\u4e00-\u9fa5]{1,10}$/,
    //邮箱地址
    Email: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
    //网址
    Url: /[a-zA-z]+:\/\/[^\s]*/,
    //纯字母
    character: /^[a-zA-Z]{1,}$/,
  }

}

module.exports = Config