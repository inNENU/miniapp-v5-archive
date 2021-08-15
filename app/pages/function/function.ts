import { $Page } from "@mptool/enhance";
import { put, take } from "@mptool/file";

import { checkResUpdate } from "../../utils/app";
import { getImagePrefix } from "../../utils/config";
import { getColor, popNotice, resolvePage, setPage } from "../../utils/page";
import { refreshPage } from "../../utils/tab";

import type { AppOption } from "../../app";

const { globalData } = getApp<AppOption>();

$Page("function", {
  data: {
    theme: globalData.theme,

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
    refreshPage("function").then((data) => {
      setPage({ ctx: this, option: { id: "function" } }, data);
    });
    popNotice("function");
  },

  onReady() {
    // 注册事件监听器
    this.$emitter.on("theme", this.setTheme);
  },

  onPullDownRefresh() {
    refreshPage("function").then((data) => {
      setPage({ ctx: this, option: { id: "function" } }, data);
    });
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
    this.$emitter.off("theme", this.setTheme);
  },

  setTheme(theme: string): void {
    this.setData({ color: getColor(this.data.page.grey), theme });
  },
});
