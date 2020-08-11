/* 主页 */
import $register = require("wxpage");
import {
  changeNav,
  popNotice,
  getColor,
  setPage,
  resolvePage,
} from "../../utils/page";
import { checkResUpdate, refreshPage } from "../../utils/tab";
import { searching } from "../../utils/search";
import { AppOption } from "../../app";
import { requestJSON } from "../../utils/wx";
import { server } from "../../utils/config";
import { PageConfig } from "../../../typings";
const { globalData } = getApp<AppOption>();

$register("main", {
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
      content: [
        {
          tag: "text",
          heading: " ",
          style: "text-indent: 1.5em;font-size:14px;color:#888;",
          text: [
            "如果各位新生同学们还有什么疑问，但是小程序中没有提及的，欢迎联系 QQ 1178522294 咨询。",
          ],
        },
      ],
      hidden: true,
    },
  },

  onPageLaunch() {
    console.info("主页面启动: ", new Date().getTime() - globalData.date, "ms");
    const page = wx.getStorageSync("main");

    resolvePage({ query: { id: "main" } }, page ? page : this.data.page);
  },

  onLoad() {
    setPage({ option: { id: "main" }, ctx: this });
    // 设置胶囊和背景颜色
    this.setData({ color: getColor(this.data.page.grey) });
    refreshPage("main", this, globalData);
    popNotice("main");
  },

  onReady() {
    // 注册事件监听器
    this.$on("theme", (theme: string) => {
      this.setData({ color: getColor(this.data.page.grey), theme });
    });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    // 小程序已经初始化完成，检查页面资源
    if (wx.getStorageSync("app-inited")) checkResUpdate("guide", "580K");

    // 执行 tab 页预加载
    ["guide", "function"].forEach((x) => {
      requestJSON(
        `resource/config/${globalData.appID}/${globalData.version}/${x}`,
        (data: PageConfig) => {
          wx.setStorageSync(x, data);
          this.$preload(`${x}?id=${x}`);
        }
      );
    });
    this.$preload("me?id=me");
  },

  onPullDownRefresh() {
    refreshPage("main", this, globalData);
    wx.stopPullDownRefresh();
  },

  onPageScroll(event) {
    changeNav(event, this, "nav");
  },

  onShareAppMessage: () => ({
    title: globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "in东师",
    path: "/page/main/main",
    imageUrl: `${server}img/${
      globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "inNENU"
    }Share.jpg`,
  }),

  onShareTimeline: () => ({
    title: globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "in东师",
  }),

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
    searching(value, (words) => this.setData({ words }));
  },

  /**
   * 跳转到搜索页面
   *
   * @param value 输入的搜索词
   */
  search({ detail }: WXEvent.Input) {
    this.$route(`search?words=${detail.value}`);
  },
});
