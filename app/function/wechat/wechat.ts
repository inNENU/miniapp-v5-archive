import * as $register from "wxpage";
import { changeNav, popNotice, getColor } from "../../utils/page";
import { AppOption } from "../../app";
import { ensureJSON, getJSON } from "../../utils/file";
import { modal } from "../../utils/wx";

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

    footer: {
      desc: "公众号入驻，请联系 QQ 1178522294",
    },
  },

  state: {} as Record<string, any>,

  onNavigate(options) {
    ensureJSON({ path: `function/wechat/${options.query.path || "index"}` });
  },

  onLoad({ path = "index", from = "功能大厅" }) {
    getJSON({
      path: `function/wechat/${path}`,
      url: `resource/function/wechat/${path}`,
      success: (wechat) => {
        this.setData({
          homePage: path === "index",
          color: getColor(path !== "index"),
          theme: globalData.theme,
          wechat: wechat as WechatConfig[],
          grey: path !== "index",
          "nav.title":
            path === "index"
              ? "校园公众号"
              : (wechat as Record<string, any>).name,
          "nav.from": from,
          "footer.desc":
            path === "index"
              ? "公众号入驻，请联系 QQ 1178522294"
              : "更新文章，请联系 QQ 1178522294",
        });
      },
    });

    this.state.path = path;

    if (getCurrentPages().length === 1)
      this.setData({ "nav.action": "redirect", "nav.from": "主页" });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("wechat");
  },

  onPageScroll(event) {
    changeNav(event, this, "nav");
  },

  onShareAppMessage() {
    return {
      title: "校园公众号",
      path: `/funtion/wechat/wechat?path=${this.state.path}&from=${this.data.nav.title}`,
    };
  },

  onShareTimeline: () => ({ title: "校园公众号" }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  navigate({ currentTarget }: WXEvent.Touch) {
    this.$route(
      `wechat?path=${currentTarget.dataset.path}&from=${this.data.nav.title}`
    );
  },

  cardTap({ currentTarget }: WXEvent.Touch) {
    const { title, url } = currentTarget.dataset;

    // 无法跳转，复制链接到剪切板
    if (globalData.env === "qq")
      wx.setClipboardData({
        data: url,
        success: () => {
          modal(
            "无法跳转",
            "该小程序无法跳转网页，链接地址已复制至剪切板。请打开浏览器粘贴查看"
          );
        },
      });
    else this.$route(`/module/web?url=${url}&title=${title}`);
  },

  redirect() {
    this.$switch("main");
  },
});
