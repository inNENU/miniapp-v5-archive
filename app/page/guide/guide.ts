/* 东师指南 */
import $register = require("wxpage");
import { checkResUpdate } from "../../utils/app";
import { changeNav, popNotice, resolvePage, setPage } from "../../utils/page";
import { refreshPage } from "../../utils/tab";
import { searching } from "../../utils/search";
import { AppOption } from "../../app";
import page from "./pageData";
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

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);
  },

  onPullDownRefresh() {
    refreshPage("guide", this, globalData);
    checkResUpdate("guide", "东师指南", "285K");
    wx.stopPullDownRefresh();
  },

  onPageScroll(event) {
    changeNav(event, this, "nav");
  },

  onShareAppMessage: () => ({ title: "东师指南", path: "/page/guide/guide" }),

  onShareTimeline: () => ({ title: "东师指南" }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /**
   * 在搜索框中输入时触发的函数
   *
   * @param value 输入的搜索词
   */
  searching({ detail: { value } }: WXEvent.Input) {
    searching(value, "guide", (words) => this.setData({ words }));
  },

  /**
   * 跳转到搜索页面
   *
   * @param value 输入的搜索词
   */
  search({ detail }: WXEvent.Input) {
    this.$route(`search?name=guide&word=${detail.value}`);
  },
});
