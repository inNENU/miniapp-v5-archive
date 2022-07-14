import { $Page } from "@mptool/enhance";

import { getTitle } from "../utils/config";

$Page<{ title: string; url: string }, Record<string, unknown>>("web", {
  onLoad({ title, url }) {
    // 设置导航栏标题
    const navigationBarTitle = title || getTitle();

    wx.setNavigationBarTitle({ title: navigationBarTitle });
    this.setData({ url, title: navigationBarTitle });
  },

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return { title: this.data.title, path: `/module/web?url=${this.data.url}` };
  },

  onAddToFavorites(): WechatMiniprogram.Page.IAddToFavoritesContent {
    return { title: this.data.title };
  },
});
