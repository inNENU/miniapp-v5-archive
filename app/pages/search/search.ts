import { $Page } from "@mptool/enhance";

import { appCoverPrefix } from "../../utils/config";
import { getColor, popNotice } from "../../utils/page";
import { SearchResult, search } from "../../utils/search";

import type { AppOption } from "../../app";

const { globalData } = getApp<AppOption>();

$Page("search", {
  data: {
    theme: globalData.theme,

    /** 状态栏高度 */
    statusBarHeight: globalData.info.statusBarHeight,

    /** 候选词 */
    words: <string[]>[],

    /** 搜索结果 */
    result: <SearchResult[]>[],

    /** 搜索词 */
    searchword: "",
  },

  state: {
    /** 分类 */
    name: <"all" | "guide" | "intro">"all",
    /** 是否正在输入 */
    typing: false,
    /** 搜索框中的内容 */
    value: "",
  },

  onLoad(options) {
    if (options.name)
      this.state.name = options.name as "all" | "guide" | "intro";
    if (options.word) this.search({ detail: { value: options.word } });

    this.setData({
      firstPage: getCurrentPages().length === 1,
      color: getColor(true),
      searchword: options.word || "",
      theme: globalData.theme,
      darkmode: globalData.darkmode,
    });

    popNotice("search");
  },

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return {
      title: "搜索",
      path: `/pages/search/search?name=${this.state.name}&word=${this.state.value}`,
      imageUrl: `${appCoverPrefix}Share.png`,
    };
  },

  onShareTimeline(): WechatMiniprogram.Page.ICustomTimelineContent {
    return {
      title: "搜索",
      query: `name=${this.state.name}&word=${this.state.value}`,
    };
  },

  onAddToFavorites(): WechatMiniprogram.Page.IAddToFavoritesContent {
    return {
      title: "搜索",
      imageUrl: `${appCoverPrefix}.jpg`,
      query: `name=${this.state.name}&word=${this.state.value}`,
    };
  },

  /**
   * 在搜索框中输入时触发的函数
   *
   * @param value 输入的搜索词
   */
  searching({ detail: { value } }: WechatMiniprogram.Input) {
    this.state.typing = true;
    search<string[]>({
      word: value,
      scope: this.state.name,
      type: "word",
    }).then((words) => {
      if (this.state.typing) this.setData({ words });
    });
  },

  /**
   * 进行搜索
   *
   * @param value 搜索词
   */
  search({ detail: { value } }: { detail: { value: string } }) {
    this.state.typing = false;
    this.setData({ words: [] });
    wx.showLoading({ title: "搜索中..." });

    search<SearchResult[]>({
      word: value,
      scope: this.state.name,
      type: "result",
    }).then((result) => {
      this.setData({ result });
      this.state.value = value;
      wx.hideLoading();
    });
  },

  back() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
