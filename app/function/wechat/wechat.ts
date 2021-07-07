import { $Page } from "@mptool/enhance";

import { getImagePrefix } from "../../utils/config";
import { ensureJSON, getJSON } from "../../utils/file";
import { getColor, popNotice } from "../../utils/page";

import type { AppOption } from "../../app";

const { globalData } = getApp<AppOption>();

interface WechatConfig {
  name: string;
  desc: string;
  logo: string;
  path: string;
}

$Page("wechat", {
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

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.onThemeChange);

    popNotice("wechat");
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage() {
    return { title: "校园公众号", path: `/function/wechat/wechat` };
  },

  onShareTimeline: () => ({ title: "校园公众号" }),

  onAddToFavorites: () => ({
    title: "校园公众号",
    imageUrl: `${getImagePrefix()}.jpg`,
  }),
  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.onThemeChange);
  },

  onThemeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  navigate({
    currentTarget,
  }: WechatMiniprogram.TouchEvent<never, never, { path: string }>) {
    this.$go(
      `wechat-detail?path=${currentTarget.dataset.path}&from=校园公众号`
    );
  },
});
