import { $Page } from "@mptool/enhance";

import { getImagePrefix } from "../utils/config";
import { loadOnlinePage, resolvePage, setOnlinePage } from "../utils/page";

import type { PageData } from "../../typings";

$Page("page", {
  data: { page: {} as PageData & { id: string } },

  state: {
    /** 在线文件路径 */
    path: "",
  },

  onNavigate(option) {
    resolvePage(option);
  },

  onLoad(option) {
    console.info("onLoad options: ", option);

    // 生成页面 ID
    if (option.scene)
      option.id = decodeURIComponent(option.scene)
        .replace(/^#/, "guide/")
        .replace(/^@/, "intro/")
        .replace(/\/$/, "/index");

    if ("path" in option) {
      loadOnlinePage(option as Record<string, never> & { path: string }, this);
      this.state.path = option.path as string;
    } else setOnlinePage(option, this);

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.onThemeChange);

    wx.reportAnalytics("id_count", { id: option.id });
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return {
      title: this.data.page.title,
      path: `/module/page?${
        this.state.path
          ? `path=${this.state.path}`
          : `scene=${this.data.page.id}`
      }`,
    };
  },

  onShareTimeline(): WechatMiniprogram.Page.ICustomTimelineContent {
    return {
      title: this.data.page.title,
      query: `id=${this.data.page.id}`,
    };
  },

  onAddToFavorites(): WechatMiniprogram.Page.IAddToFavoritesContent {
    return {
      title: this.data.page.title,
      imageUrl: `${getImagePrefix()}.jpg`,
      query: `from=主页&id=${this.data.page.id}`,
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
