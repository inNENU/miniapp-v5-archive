import { $Page } from "@mptool/enhance";
import { put, take } from "@mptool/file";

import { checkResUpdate } from "../../utils/app";
import { getImagePrefix } from "../../utils/config";
import { popNotice, resolvePage, setPage } from "../../utils/page";
import { refreshPage } from "../../utils/tab";

import type { AppOption } from "../../app";

const { globalData } = getApp<AppOption>();

$Page("function", {
  data: {
    theme: globalData.theme,

    /** 自定义导航栏配置 */
    nav: {
      title: "功能大厅",
      action: false,
      statusBarHeight: globalData.info.statusBarHeight,
    },

    /** 页面数据 */
    page: {
      title: "功能大厅",
      grey: true,
      hidden: true,
    },
  },

  onPreload(res) {
    put(
      "function",
      resolvePage(res, wx.getStorageSync("function") || this.data.page)
    );
    console.info(
      `Function page loading time: ${new Date().getTime() - globalData.date}ms`
    );
  },

  onLoad() {
    setPage(
      { option: { id: "function" }, ctx: this },
      take("function") || this.data.page
    );
  },

  onShow() {
    refreshPage("function", this, globalData);
    popNotice("function");
  },

  onReady() {
    // 注册事件监听器
    this.$emitter.on("theme", (theme: string) => {
      this.setData({ theme });
    });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.onThemeChange);
  },

  onPullDownRefresh() {
    refreshPage("function", this, globalData);
    checkResUpdate();
    wx.stopPullDownRefresh();
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage: () => ({
    title: "功能大厅",
    path: "/pages/function/function",
  }),

  onShareTimeline: () => ({ title: "功能大厅" }),

  onAddToFavorites: () => ({
    title: "功能大厅",
    imageUrl: `${getImagePrefix()}.jpg`,
  }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.onThemeChange);
  },

  onThemeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },
});
