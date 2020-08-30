import * as $register from "wxpage";
import { changeNav, popNotice, getColor } from "../../utils/page";
import { AppOption } from "../../app";
import { ensureJSON, getJSON } from "../../utils/file";

const { globalData } = getApp<AppOption>();

interface WechatConfig {
  name: string;
  desc: string;
  logo: string;
  path: string;
}

$register("wechat", {
  data: {
    theme: globalData.theme,

    /** 头部配置 */
    nav: {
      title: "校园公众号",
      statusBarHeight: globalData.info.statusBarHeight,
      from: "功能大厅",
    },

    wechat: [] as WechatConfig[],

    footer: {
      desc: "公众号入驻，请联系 QQ 1178522294",
    },
  },

  onNavigate() {
    ensureJSON({ path: "function/wechat/index" });
  },

  onLoad({ from = "功能大厅" }) {
    getJSON({
      path: "function/wechat/index",
      url: "resource/function/wechat/index",
      success: (wechat) => {
        this.setData({
          color: getColor(),
          theme: globalData.theme,
          wechat: wechat as WechatConfig[],
          "nav.from": from,
        });
      },
    });

    if (getCurrentPages().length === 1)
      this.setData({ "nav.action": "redirect", "nav.from": "主页" });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("wechat");
  },

  onPageScroll(event) {
    changeNav(event, this, "nav");
  },

  onShareAppMessage() {
    return { title: "校园公众号", path: `/function/wechat/wechat` };
  },

  onShareTimeline: () => ({ title: "校园公众号" }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  navigate({ currentTarget }: WechatMiniprogram.TouchEvent) {
    this.$route(
      `/function/wechat/detail?path=${currentTarget.dataset.path}&from=校园公众号`
    );
  },

  redirect() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
