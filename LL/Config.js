/***********************
====▶项目配置文件◀=======
========★落落★========
***********************/

var Config = {
  //配置文件的版本号，用来区别不同版本配置文件，修改配置文件时，修改此版本号     
  version: "0.2",
  //程序开发模式，Development:开发模式，Test:测试模式，Online:线上模式
  mode: "Development",
  //项目中文名称
  chName: "SPA",
  //项目英文文名称
  enName: "",

  ////====Ajax请求相关配置====////
  AjaxSetting: {
    //所有地址请求头部  
    URLHead: "https://xcx1.zheweidao.com/",
    //是否开启API模式       
    isApi: false,
    //获取用户openId接口
    openIdPort: "get_openid",
    //获取用户TOKEN接口
    tokenPort: "save_user_info",
    //获取用户信息接口    
    userInfoPort: "save_user_info",
    //上传图片接口
    imgUploadPort: "/coreAttachment/upload",
    //上传文件接口
    filePort: "/controller.ashx?action=uploadimage",
    //支付接口
    payPort: "/coreRechargeRecord/get/package",
    //获取微信用户绑定手机号接口，数据需要后台解密
    getPhonePort: "/member/GetWechatPhoneModelInXcx",
    //Loading显示文字
    loadingTitle: "加载中",
  },

  ////====页面结构相关配置====////      
  pageSetting: {
    //主页页面路径
    home: "/pages/Home/Index",
    //登录页面路径
    login: "/pages/Home/Login",
  },

  //所有页面图片地址头部
  imgURLHead: "http://spax.mammothcode.com",

  //虚拟用户
  NPCInfo: {
    openId: "oCkn-0LsCAirFyL9nQ80myluoluo",
    name: "落落",
    headPortrait: "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTI2iasISZ1LOFONyGqyKiaEkbIIvyLPyz9cz1hocv2rcBwgGuqib2Y5BmD3YDSLcsUjc8PQXb9YdsKhg/0"
  },

  ////====各种字典库====////
  wordLib: {
    //数字字典库
    int: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    //小写字母
    smallChar: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    //大写字母
    bigChar: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    //字母字典库
    char: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    //字母数字字典库
    charAndNum: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    //星期字典库，可以用来处理星期显示格式
    week: ["日", "一", "二", "三", "四", "五", "六"],
  },

  ////====正则表达式====////
  regular: {
    //电话号码
    phone: /^1[3|4|5|7|8][0-9]{9}$/,
    //中文字符1-10个
    Chinese: /^[\u4e00-\u9fa5]{1,10}$/,
    //邮箱地址
    Email: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
    //网址
    Url: /[a-zA-z]+:\/\/[^\s]*/,
    //身份证号
    Id: /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/,
    //普通密码6-20位
    password: /^[a-zA-Z0-9_~！@#￥%…&—=【】、《》<>:;"'\-\*\.\?\+\$\^\[\]\(\)\{\}\|\\\/]{6,20}$/,
    //纯数字
    num: /^\d{1,}$/,
    //纯字母
    character: /^[a-zA-Z]{1,}$/,
  },

  ////====密匙相关====////    
  key: {}

}
//ES6标准接口
module.exports = Config