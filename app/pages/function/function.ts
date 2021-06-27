import $register = require("wxpage");
import page from "./pageData";

import { AppOption } from "../../app";

import { checkResUpdate } from "../../utils/app";
import { server } from "../../utils/config";
import { popNotice, resolvePage, setPage } from "../../utils/page";
import { refreshPage } from "../../utils/tab";

const { globalData } = getApp<AppOption>();

$register("function", {
  data: {
    theme: globalData.theme,

    /** 自定义导航栏配置 */
    nav: {
      title: "功能大厅",
      action: false,
      statusBarHeight: globalData.info.statusBarHeight,
    },

    /** 页面数据 */
    page,
  },

  onPreload(res) {
    this.$put(
      "function",
      resolvePage(res, wx.getStorageSync("function") || this.data.page)
    );
    console.info(
      `功能大厅预加载用时${new Date().getTime() - globalData.date}ms`
    );
  },

  onLoad() {
    setPage(
      { option: { id: "function" }, ctx: this },
      this.$take("function") || this.data.page
    );
  },

  onShow() {
    refreshPage("function", this, globalData);
    popNotice("function");
  },

  onReady() {
    // 注册事件监听器
    this.$on("theme", (theme: string) => {
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

  navigate() {
    this.$route("/function/weather");
  },
});
