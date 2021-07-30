import { $Page } from "@mptool/enhance";

import { getImagePrefix } from "../utils/config";
import {
  loadOnlinePage,
  id2path,
  resolvePage,
  setOnlinePage,
} from "../utils/page";

import type { PageData, PageOption } from "../../typings";

$Page("page", {
  data: { page: {} as PageData & { id: string } },

  onNavigate(option) {
    resolvePage(option);
  },

  onLoad(option: PageOption & { path?: string }) {
    console.info("onLoad options: ", option);

    if ("path" in option) {
      loadOnlinePage(option as PageOption & { path: string }, this);
    } else {
      // 生成页面 ID
      option.id = id2path(option.scene || option.id);
      setOnlinePage(option, this);
    }

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.onThemeChange);

    wx.reportEvent?.("page_id", { id: option.id });
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return {
      title: this.data.page.title,
      path: `/module/page?path=${this.data.page.id}`,
    };
  },

  onShareTimeline(): WechatMiniprogram.Page.ICustomTimelineContent {
    return {
      title: this.data.page.title,
      query: `path=${this.data.page.id}`,
    };
  },

  onAddToFavorites(): WechatMiniprogram.Page.IAddToFavoritesContent {
    return {
      title: this.data.page.title,
      imageUrl: `${getImagePrefix()}.jpg`,
      query: `path=${this.data.page.id}`,
    };
  },

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.onThemeChange);
  },

  /** 设置主题 */
  onThemeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },
});
