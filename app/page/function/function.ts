/* 功能大厅 */
import $register = require("wxpage");
import { changeNav, popNotice, resolvePage, setPage } from "../../utils/page";
import { checkResUpdate, refreshPage } from "../../utils/tab";
import { AppOption } from "../../app";
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
    page: {
      title: "功能大厅",
      grey: true,
      hidden: true,
      content: [
        {
          tag: "card",
          type: "page",
          src: "http://v3.mp.innenu.com/img/tab/map.jpg",
          title: "校园地图",
          logo: "/icon/tabPage/map.svg",
          url: "map",
        },
        {
          tag: "card",
          type: "page",
          src: "http://v3.mp.innenu.com/img/tab/headphone.jpg",
          title: "音律东师",
          logo: "/icon/tabPage/music.svg",
          url: "player",
        },
        {
          tag: "card",
          type: "page",
          src: "http://v3.mp.innenu.com/img/tab/calendar.jpg",
          title: "校历",
          logo: "/icon/tabPage/calendar.svg",
          url: "calendar",
        },
        {
          tag: "card",
          type: "page",
          src: "http://v3.mp.innenu.com/img/tab/sport-field.jpg",
          title: "体测计算器",
          logo: "/icon/tabPage/calculate.svg",
          url: "PEcal",
        },
        {
          tag: "card",
          type: "page",
          src: "http://v3.mp.innenu.com/img/tab/wechat.jpg",
          title: "校园公众号",
          logo: "/icon/tabPage/wechat.svg",
          url: "wechat",
        },
      ],
    },
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
    checkResUpdate("function", "130K");
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

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);
  },

  onPullDownRefresh() {
    refreshPage("function", this, globalData);
    checkResUpdate("function", "130K");
    wx.stopPullDownRefresh();
  },

  onPageScroll(event) {
    changeNav(event, this, "nav");
  },

  onShareAppMessage: () => ({
    title: "功能大厅",
    path: "/page/function/function",
  }),

  onShareTimeline: () => ({ title: "功能大厅" }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  navigate() {
    this.$route("weather");
  },
});
