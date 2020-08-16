import * as $register from "wxpage";
import { changeNav, popNotice, getColor } from "../../utils/page";
import { AppOption } from "../../app";
import { ensureJSON, getJSON } from "../../utils/file";
import { modal } from "../../utils/wx";
import { WechatConfig } from "./wechat";

const { globalData } = getApp<AppOption>();

interface WechatDetail {
  name: string;
  authorized?: boolean;
  content: WechatConfig[];
}

$register("wechat-detail", {
  data: {
    theme: globalData.theme,

    /** 头部配置 */
    nav: {
      title: "公众号",
      statusBarHeight: globalData.info.statusBarHeight,
      from: "校园公众号",
      grey: true,
    },

    config: {} as WechatDetail,

    footer: {
      desc: "更新文章，请联系 QQ 1178522294",
    },
  },

  state: {} as Record<string, any>,

  onNavigate(options) {
    ensureJSON({ path: `function/wechat/${options.query.path || "index"}` });
  },

  onLoad({ from, path }) {
    getJSON({
      path: `function/wechat/${path}`,
      url: `resource/function/wechat/${path}`,
      success: (wechat) => {
        this.setData({
          color: getColor(true),
          theme: globalData.theme,
          config: wechat as WechatDetail,
          "nav.title": (wechat as WechatDetail).name,
          "nav.from": getCurrentPages().length === 1 ? "主页" : from || "返回",
        });
      },
    });

    this.state.path = path;

    if (getCurrentPages().length === 1)
      this.setData({ "nav.action": "redirect", "nav.from": "主页" });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice(`wechat/${this.data.nav.title}`);
  },

  onPageScroll(event) {
    changeNav(event, this, "nav");
  },

  onShareAppMessage() {
    return {
      title: this.data.nav.title,
      path: `/function/wechat/detail?path=${this.state.path}`,
    };
  },

  onShareTimeline() {
    return { title: this.data.nav.title };
  },

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  cardTap({ currentTarget }: WXEvent.Touch) {
    const { title, url } = currentTarget.dataset;

    // 无法跳转，复制链接到剪切板
    if (this.data.config.authorized === false)
      wx.setClipboardData({
        data: url,
        success: () => {
          modal(
            "尚未授权",
            "目前暂不支持跳转到该微信公众号图文，链接地址已复制至剪切板。请打开浏览器粘贴查看"
          );
        },
      });
    else if (globalData.env === "qq")
      wx.setClipboardData({
        data: url,
        success: () => {
          modal(
            "无法跳转",
            "QQ小程序并不支持跳转微信图文，链接地址已复制至剪切板。请打开浏览器粘贴查看"
          );
        },
      });
    else this.$route(`web?url=${url}&title=${title}`);
  },

  redirect() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
