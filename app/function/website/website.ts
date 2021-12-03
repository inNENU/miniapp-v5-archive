import { $Page } from "@mptool/enhance";

import { getImagePrefix } from "../../utils/config";
import { ensureJSON, getJSON } from "../../utils/json";
import { popNotice } from "../../utils/page";
import { modal } from "../../utils/wx";

import type { AppOption } from "../../app";

const { globalData } = getApp<AppOption>();

$Page("website", {
  data: {
    config: [] as unknown[],
    info: globalData.info,
  },

  onNavigate() {
    ensureJSON("function/website/index");
  },

  onLoad() {
    getJSON<unknown[]>("function/website/index").then((config) => {
      this.setData({ config, info: globalData.info });
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
