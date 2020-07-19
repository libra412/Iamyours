// pages/user/index.js
var app = getApp()
const qiniuUploader = require("../../utils/qiniuUploader");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageList: ['../../img/addImg.jpeg', '../../img/addImg.jpeg', '../../img/addImg.jpeg', '../../img/addImg.jpeg'],
    user:{},   
    isShowCutPic:false, 
    src:'',
    width:250,//宽度
    height: 250,//高度
    index:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
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
          var imgList = user.ImageUrl.split(",")
          for (var i = 0; i < imgList.length; i++) {
            that.data.imageList[i] = imgList[i]
          }
          that.setData({
            user: user,
            imageList: that.data.imageList
          })
        }
      }
    })
  },
  // 保存用户信息
  saveUser: function (e) {
    var that = this
    var obj = e.detail.value;
    var imageArr = []
    var j = 0
    for(var i=0;i<that.data.imageList.length;i++) {
      if (that.data.imageList[i] !=="../../img/addImg.jpeg") {
        imageArr[j++] = that.data.imageList[i]
      }
    }
    obj.imageUrl = imageArr.join()
    console.log(obj)
    wx.request({
      url: "https://api.shareone.online/user/update",
      method: "post",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: obj,
      success: function (res) {
        console.log(res.data)
        wx.showToast({
          title: "保存成功！",
          duration: 3000,
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  uploadImg0:function(){
    this.uploadImg(0)
    this.data.index = 0
  },
  uploadImg1: function () {
    this.uploadImg(1)
    this.data.index = 1
  },
  uploadImg2: function () {
    this.uploadImg(2)
    this.data.index = 2
  },
  uploadImg3: function () {
    this.uploadImg(3)
    this.data.index = 3
  },


  //上传图片
  uploadImg(index) {
    let that = this
    that.setData({
      isShowCutPic:true,
    })
    this.cropper = this.selectComponent("#image-cropper")
    this.cropper.upload()
 
  },
  cropperload(e){
    console.log("cropper初始化完成");
},
loadimage(e){
    console.log("图片加载完成",e.detail);
    wx.hideLoading();
    //重置图片角度、缩放、位置
    this.cropper.imgReset();
},
clickcut(e) {
   let that = this
    console.log(e.detail);
    //点击裁剪框阅览图片
    wx.previewImage({
        current: e.detail.url, // 当前显示图片的http链接
        urls: [e.detail.url] // 需要预览的图片http链接列表
    })
},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
  },
  /**
   *  取消上传
   */
  cancelUpload: function() {
    let that = this
    that.setData({
      isShowCutPic: false,
      src: '',
    })
  },
  sureUpload: function() {
    let that = this
    this.cropper.getImg(function(obj){
      let filePath = obj.url
      // 交给七牛上传
      qiniuUploader.upload(filePath, (res) => {
        var imageList = that.data.imageList
        imageList[that.data.index]="http://"+res.imageURL
        that.data.imageList= imageList
        that.setData({
            imageList
        });
        console.log('file url is: ' + res.fileUrl);
      }, (error) => {
        console.log('error: ' + error);
      }, {
          region: 'ECN',
          domain: 'www.zheweidao.com', // // bucket 域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 ImageURL 字段。否则需要自己拼接
        key: app.globalData.openid+Date.parse(new Date())+".jpg", // [非必须]自定义文件 key。如果不设置，默认为使用微信小程序 API 的临时文件名
          // 以下方法三选一即可，优先级为：uptoken > uptokenURL > uptokenFunc
        // uptoken: '[yourTokenString]', // 由其他程序生成七牛 uptoken
          uptokenURL: 'https://api.shareone.online/qiniu/token', // 从指定 url 通过 HTTP GET 获取 uptoken，返回的格式必须是 json 且包含 uptoken 字段，例如： {"uptoken": "[yourTokenString]"}
          //uptokenFunc: function () { return '[yourTokenString]'; }
        }, (res) => {
          console.log('上传进度', res.progress)
          console.log('已经上传的数据长度', res.totalBytesSent)
          console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
        }, () => {
          // 取消上传
          that.setData({
            isShowCutPic:false,
          })
        }, () => {
          // `before` 上传前执行的操作
        }, (err) => {
          // `complete` 上传接受后执行的操作(无论成功还是失败都执行)
          console.log("complete")
          that.setData({
            isShowCutPic:false,
          })
        });
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this;
    let uid = that.data.user.Id;
    return {
      title: 'TA喜不喜欢我，“结果”一下就知道',
      path: '/pages/user/index?uid='+uid,
    }
  },
   /**
   *  用户分享朋友圈
   */
  onShareTimeline: function() {
    let that = this;
    let uid = that.data.user.Id;
    return {
      title: 'TA喜不喜欢我，“结果”一下就知道',
      path: '/pages/user/index?uid='+uid,
    }
  }
})