import $register = require("wxpage");

import { getTitle } from "../utils/config";

$register<{ title: string; url: string }, Record<string, unknown>>("web", {
  onLoad(res) {
    // 设置导航栏标题
    const title = res.title || getTitle();

    wx.setNavigationBarTitle({ title });
    this.setData({ url: res.url, title });
  },

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return { title: this.data.title, path: `/module/web?url=${this.data.url}` };
  },

  onAddToFavorites(): WechatMiniprogram.Page.IAddToFavoritesContent {
    return { title: this.data.title };
  },
});
