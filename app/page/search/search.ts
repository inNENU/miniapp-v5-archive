/* 搜索页 */

import $register = require("wxpage");
import { changeNav, popNotice, getColor } from "../../utils/page";
import { SearchResult, search, searching } from "../../utils/search";
import { AppOption } from "../../app";
import { server } from "../../utils/config";
const { globalData } = getApp<AppOption>();

$register("search", {
  data: {
    theme: globalData.theme,

    /** 状态栏高度 */
    statusBarHeight: getApp().globalData.info.statusBarHeight,

    /** 候选词 */
    words: [] as string[],

    /** 搜索结果 */
    result: [] as SearchResult[],

    /** 搜索词 */
    searchword: "",

    /** 自定义导航栏配置 */
    nav: {
      title: "搜索",
      action: "redirect",
      statusBarHeight: globalData.info.statusBarHeight,
      from: "返回",
    },
  },

  state: {
    name: "all",
    /** 搜索框中的内容 */
    value: "",
  },

  onLoad(options) {
    if (options.word) this.search({ detail: { value: options.word } });
    if (options.name) this.state.name = options.name;

    this.setData({
      "nav.from": getCurrentPages().length === 1 ? "主页" : "返回",
      color: getColor(true),
      searchword: options.word || "",
      theme: globalData.theme,
    });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);
    popNotice("search");
  },

  onPageScroll(event) {
    changeNav(event, this, "nav");
  },

  onShareAppMessage: () => ({
    title: "搜索",
    path: "/page/search/search",
    imageUrl: `${server}img/${
      globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "inNENU"
    }Share.jpg`,
  }),

  onShareTimeline: () => ({ title: "搜索" }),

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
  searching({ detail: { value } }: any) {
    searching(value, this.state.name, (words) => this.setData({ words }));
  },

  /**
   * 进行搜索
   *
   * @param value 搜索词
   */
  search({ detail: { value } }: any) {
    wx.showLoading({ title: "搜索中..." });

    search(value, this.state.name, (result) => {
      console.warn(result);
      this.setData({ result });

      this.state.value = value;

      wx.hideLoading();
    });
  },

  navigate({ currentTarget }: WXEvent.Touch) {
    this.$route(`page?id=${currentTarget.dataset.id}&from=搜索`);
  },

  redirect() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
