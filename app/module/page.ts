/* 展示页面 */

import $register = require("wxpage");
import {
  changeNav,
  resolvePage,
  loadOnlinePage,
  setOnlinePage,
} from "../utils/page";

$register("page", {
  onNavigate(option) {
    resolvePage(option);
  },

  onLoad(option: any) {
    console.info("进入参数为", option);

    if (getCurrentPages().length === 1) option.action = "redirect";

    if (option.scene)
      option.id = decodeURIComponent(option.scene)
        .replace("#", "guide/")
        .replace("@", "intro/");

    if ("path" in option) {
      loadOnlinePage(option, this);
      this.path = option.path;
    } else setOnlinePage(option, this);

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);
  },

  onPageScroll(event) {
    changeNav(event, this);
  },

  onShareAppMessage() {
    return {
      title: this.data.page.title,
      path: `/module/page?${this.path ? `path=${this.path}` : `scene=${id}`}`,
    };
  },

  onShareTimeline() {
    return {
      title: this.data.page.title,
      query: { id: this.data.page.id },
    };
  },

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 重定向到主页 */
  redirect() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
