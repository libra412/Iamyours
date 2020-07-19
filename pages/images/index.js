// pages/images/index.js
var app = getApp()
const qiniuUploader = require("../../utils/qiniuUploader");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src:'',
    width:375,//宽度
    height: 375,//高度
    index:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      //获取到image-cropper实例
      this.cropper = this.selectComponent("#image-cropper");
      this.cropper.upload()
      this.data.index = options.index

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
    console.log(e.detail);
    //点击裁剪框阅览图片
    wx.previewImage({
        current: e.detail.url, // 当前显示图片的http链接
        urls: [e.detail.url] // 需要预览的图片http链接列表
    })
    let that = this
    this.cropper.getImg(function(obj){
      let filePath = obj.url
      // 交给七牛上传
      qiniuUploader.upload(filePath, (res) => {
        var imageList = that.data.imageList
        imageList[0]="http://"+res.imageURL
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  }
})