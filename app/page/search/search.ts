/* 搜索页 */

import $register = require("wxpage");
import { popNotice, getColor } from "../../utils/page";
import { SearchResult, search, searching } from "../../utils/search";
import { AppOption } from "../../app";
import { server } from "../../utils/config";
const { globalData } = getApp<AppOption>();

$register("search", {
  data: {
    theme: globalData.theme,

    /** 状态栏高度 */
    statusBarHeight: globalData.info.statusBarHeight,

    /** 候选词 */
    words: [] as string[],

    /** 搜索结果 */
    result: [] as SearchResult[],

    /** 搜索词 */
    searchword: "",
  },

  state: {
    /** 分类 */
    name: "all",
    /** 是否正在输入 */
    typing: false,
    /** 搜索框中的内容 */
    value: "",
  },

  onLoad(options) {
    if (options.name) this.state.name = options.name;
    if (options.word) this.search({ detail: { value: options.word } });

    this.setData({
      firstPage: getCurrentPages().length === 1,
      color: getColor(true),
      searchword: options.word || "",
      theme: globalData.theme,
    });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);
    popNotice("search");
  },

  onShareAppMessage() {
    return {
      title: "搜索",
      path: `/page/search/search?name=${this.state.name}&word=${this.state.value}`,
      imageUrl: `${server}img/${
        globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "inNENU"
      }Share.jpg`,
    };
  },

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
    this.state.typing = true;
    searching(value, this.state.name, (words) => {
      if (this.state.typing) this.setData({ words });
    });
  },

  /**
   * 进行搜索
   *
   * @param value 搜索词
   */
  search({ detail: { value } }: any) {
    this.state.typing = false;
    this.setData({ words: [] });
    wx.showLoading({ title: "搜索中..." });

    search(value, this.state.name, (result) => {
      this.setData({ result });
      this.state.value = value;
      wx.hideLoading();
    });
  },

  navigate({ currentTarget }: WXEvent.Touch) {
    this.$route(`page?id=${currentTarget.dataset.id}&from=搜索`);
  },

  back() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
