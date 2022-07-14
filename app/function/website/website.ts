import { $Page } from "@mptool/enhance";

import { getImagePrefix } from "../../utils/config";
import { ensureJSON, getJSON } from "../../utils/json";
import { popNotice } from "../../utils/page";
import { getWindowInfo, modal } from "../../utils/wx";

import type { AppOption } from "../../app";

const { globalData } = getApp<AppOption>();

$Page("website", {
  data: {
    config: <unknown[]>[],
  },

  onNavigate() {
    ensureJSON("function/website/index");
  },

  onLoad() {
    getJSON<unknown[]>("function/website/index").then((config) => {
      const info = getWindowInfo();

      this.setData({
        config,
        height: info.windowHeight - info.statusBarHeight - 229,
      });
    });

    popNotice("account");
  },

  onShareAppMessage: () => ({
    title: "东师网站",
    path: `/function/website/website`,
  }),

  onShareTimeline: () => ({ title: "东师网站" }),

  onAddToFavorites: () => ({
    title: "东师网站",
    imageUrl: `${getImagePrefix()}.jpg`,
  }),

  onResize({ size }) {
    this.setData({
      height: size.windowHeight - globalData.info.statusBarHeight - 229,
    });
  },

  copy({
    currentTarget,
  }: WechatMiniprogram.TouchEvent<
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    { link: string }
  >) {
    wx.setClipboardData({
      data: currentTarget.dataset.link,
      success: () => {
        modal(
          "功能受限",
          "受到小程序限制，无法直接打开网页，网址已复制到剪切板"
        );
      },
    });
  },
});
