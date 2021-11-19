import { $Page } from "@mptool/enhance";
import { put, take } from "@mptool/file";

import { checkResUpdate } from "../../utils/app";
import { getImagePrefix } from "../../utils/config";
import { getColor, popNotice, resolvePage, setPage } from "../../utils/page";
import { searching } from "../../utils/search";
import { refreshPage } from "../../utils/tab";

import type { AppOption } from "../../app";

const { globalData } = getApp<AppOption>();

$Page("guide", {
  data: {
    theme: globalData.theme,

    statusBarHeight: globalData.info.statusBarHeight,

    /** 候选词 */
    words: [] as string[],

    /** 页面数据 */
    page: {
      title: "东师介绍",
      grey: true,
      hidden: true,
    },
  },

  onPreload(res) {
    put(
      "intro",
      resolvePage(res, wx.getStorageSync("intro") || this.data.page)
    );
    console.info(
      `Intro page load time: ${new Date().getTime() - globalData.date}ms`
    );
  },

  onLoad() {
    setPage(
      { option: { id: "intro" }, ctx: this },
      take("intro") || this.data.page
    );
    popNotice("intro");
  },

  onShow() {
    refreshPage("intro").then((data) => {
      setPage({ ctx: this, option: { id: "intro" } }, data);
    });
    popNotice("intro");
  },

  onReady() {
    // 注册事件监听器
    this.$on("theme", this.setTheme);
  },

  onPullDownRefresh() {
    refreshPage("intro").then((data) => {
      setPage({ ctx: this, option: { id: "intro" } }, data);
    });
    checkResUpdate();
    wx.stopPullDownRefresh();
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage: () => ({ title: "东师介绍", path: "/pages/intro/intro" }),

  onShareTimeline: () => ({ title: "东师介绍" }),

  onAddToFavorites: () => ({
    title: "东师介绍",
    imageUrl: `${getImagePrefix()}.jpg`,
  }),

  onUnload() {
    this.$off("theme", this.setTheme);
  },

  setTheme(theme: string): void {
    this.setData({ color: getColor(this.data.page.grey), theme });
  },

  /**
   * 在搜索框中输入时触发的函数
   *
   * @param value 输入的搜索词
   */
  searching({ detail: { value } }: WechatMiniprogram.Input) {
    searching(value, "intro").then((words) => this.setData({ words }));
  },

  /**
   * 跳转到搜索页面
   *
   * @param value 输入的搜索词
   */
  search({ detail }: WechatMiniprogram.Input) {
    this.$go(`search?name=intro&word=${detail.value}`);
  },
});
