import $register = require("wxpage");
import page from "./pageData";

import { AppOption } from "../../app";

import { checkResUpdate } from "../../utils/app";
import { server } from "../../utils/config";
import { popNotice, resolvePage, setPage } from "../../utils/page";
import { searching } from "../../utils/search";
import { refreshPage } from "../../utils/tab";

const { globalData } = getApp<AppOption>();

$register("guide", {
  data: {
    theme: globalData.theme,

    /** 候选词 */
    words: [] as string[],

    /** 自定义导航栏配置 */
    nav: {
      title: "东师指南",
      action: false,
      statusBarHeight: globalData.info.statusBarHeight,
    },

    /** 页面数据 */
    page,
  },

  onPreload(res) {
    this.$put(
      "guide",
      resolvePage(res, wx.getStorageSync("guide") || this.data.page)
    );
    console.info(
      `东师指南预加载用时${new Date().getTime() - globalData.date}ms`
    );
  },

  onLoad() {
    setPage(
      { option: { id: "guide" }, ctx: this },
      this.$take("guide") || this.data.page
    );
    popNotice("guide");
  },

  onShow() {
    refreshPage("guide", this, globalData);
    popNotice("guide");
  },

  onReady() {
    // 注册事件监听器
    this.$on("theme", (theme: string) => {
      this.setData({ theme });
    });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.onThemeChange);
  },

  onPullDownRefresh() {
    refreshPage("guide", this, globalData);
    checkResUpdate();
    wx.stopPullDownRefresh();
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage: () => ({ title: "东师指南", path: "/pages/guide/guide" }),

  onShareTimeline: () => ({ title: "东师指南" }),

  onAddToFavorites: () => ({
    title: "东师指南",
    imageUrl: `${server}img/${
      globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "inNENU"
    }.jpg`,
  }),
  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.onThemeChange);
  },

  onThemeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /**
   * 在搜索框中输入时触发的函数
   *
   * @param value 输入的搜索词
   */
  searching({ detail: { value } }: WechatMiniprogram.Input) {
    searching(value, "guide", (words) => this.setData({ words }));
  },

  /**
   * 跳转到搜索页面
   *
   * @param value 输入的搜索词
   */
  search({ detail }: WechatMiniprogram.Input) {
    this.$route(`/pages/search/search?name=guide&word=${detail.value}`);
  },
});
