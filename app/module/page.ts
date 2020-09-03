import $register = require("wxpage");
import { PageConfig } from "../../typings";
import {
  changeNav,
  resolvePage,
  loadOnlinePage,
  setOnlinePage,
} from "../utils/page";

$register("page", {
  data: { page: {} as PageConfig },

  state: {
    /** 在线文件路径 */
    path: "",
  },

  onNavigate(option) {
    resolvePage(option);
  },

  onLoad(option) {
    console.log(this.data.page);
    console.info("进入参数为: ", option);

    // 生成页面 ID
    if (option.scene)
      option.id = decodeURIComponent(option.scene)
        .replace("#", "guide/")
        .replace("@", "intro/");

    option.action = "redirect";

    if ("path" in option) {
      loadOnlinePage(option as Record<string, never> & { path: string }, this);
      this.state.path = option.path as string;
    } else setOnlinePage(option, this);

    console.log(this.data.page);
    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    wx.reportAnalytics("id_count", { id: option.id });
  },

  onPageScroll(event) {
    changeNav(event, this);
  },

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return {
      title: this.data.page.title,
      path: `/module/page?${
        this.state.path
          ? `path=${this.state.path}`
          : `scene=${this.data.page.id}`
      }`,
    };
  },

  onShareTimeline(): WechatMiniprogram.Page.ICustomTimelineContent {
    return {
      title: this.data.page.title,
      query: `id=${this.data.page.id as string}`,
    };
  },

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  /** 设置主题 */
  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 重定向到主页 */
  redirect() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
