Page({
  onLoad(res) {
    // 设置导航栏标题
    const title = res.title || "in东师";

    wx.setNavigationBarTitle({ title });
    this.setData({ url: res.url, title });
  },

  onShareAppMessage() {
    return { title: this.data.title, path: `/module/web?url=${this.data.url}` };
  },
});
