import { $Page } from "@mptool/enhance";

import { checkResUpdate } from "../../utils/app";
import { getImagePrefix, getTitle } from "../../utils/config";
import { getColor, popNotice, resolvePage, setPage } from "../../utils/page";
import { searching } from "../../utils/search";
import { refreshPage } from "../../utils/tab";
import { requestJSON } from "../../utils/wx";

import type { AppOption } from "../../app";
import type { PageData, PageDataWithContent } from "../../../typings";

const { globalData } = getApp<AppOption>();

$Page("main", {
  data: {
    theme: globalData.theme,

    /** 候选词 */
    words: [] as string[],

    /** 自定义导航栏配置 */
    nav: {
      title: "首页",
      action: false,
      statusBarHeight: globalData.info.statusBarHeight,
    },
    page: {
      title: "首页",
      id: "main",
      grey: true,
      hidden: true,
    } as PageData,
  },

  onPageLaunch() {
    console.info(
      "Main Page Launched: ",
      new Date().getTime() - globalData.date,
      "ms"
    );
    const page = wx.getStorageSync<PageDataWithContent | undefined>("main");

    resolvePage({ id: "main" }, page ? page : this.data.page);
  },

  onLoad() {
    setPage({ option: { id: "main" }, ctx: this });
    // 设置胶囊和背景颜色
    this.setData({ color: getColor(this.data.page.grey) });

    refreshPage("main", this, globalData);
  },

  onShow() {
    popNotice("main");
  },

  onReady() {
    // 注册事件监听器
    this.$emitter.on("theme", this.setTheme);
    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.onThemeChange);

    // 执行 tab 页预加载
    ["function", "guide", "intro"].forEach((x) => {
      requestJSON(
        `resource/config/${globalData.appID}/${globalData.version}/${x}`,
        (data: PageDataWithContent) => {
          wx.setStorageSync(x, data);
          this.$preload(`${x}?id=${x}`);
        }
      );
    });
  },

  onPullDownRefresh() {
    refreshPage("main", this, globalData);
    checkResUpdate();
    wx.stopPullDownRefresh();
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage: () => ({
    title: getTitle(),
    path: "/pages/main/main",
    imageUrl: `${getImagePrefix()}Share.png`,
  }),

  onShareTimeline: () => ({
    title: getTitle(),
  }),

  onAddToFavorites: () => ({
    title: getTitle(),
    imageUrl: `${getImagePrefix()}.jpg`,
  }),

  onUnload() {
    this.$emitter.off("theme", this.setTheme);
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.onThemeChange);
  },

  setTheme(theme: string): void {
    this.setData({ color: getColor(this.data.page.grey), theme });
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
    searching(value, "all", (words) => this.setData({ words }));
  },

  /**
   * 跳转到搜索页面
   *
   * @param value 输入的搜索词
   */
  search({ detail }: WechatMiniprogram.Input) {
    this.$go(`search?name=all&word=${detail.value}`);
  },
});
