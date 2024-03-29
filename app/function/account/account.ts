import { $Page } from "@mptool/enhance";

import { getWindowInfo, modal, savePhoto, tip } from "../../utils/api";
import { appCoverPrefix } from "../../utils/config";
import { ensureJSON, getJSON } from "../../utils/json";
import { popNotice } from "../../utils/page";

import type { AppOption } from "../../app";

const { globalData } = getApp<AppOption>();
const { env } = globalData;

$Page("account", {
  data: {
    config: <unknown[]>[],

    type: globalData.env,

    footer: {
      desc: "校园媒体入驻，请联系 Mr.Hope",
    },
  },

  onNavigate() {
    ensureJSON(`function/account/${env}`);
  },

  onLoad({ type = env }) {
    getJSON<unknown[]>(`function/account/${type}`).then((config) => {
      const info = getWindowInfo();

      this.setData({
        config,
        type,
        height: info.windowHeight - info.statusBarHeight - 229,
      });
    });

    popNotice("account");
  },

  onShareAppMessage: () => ({
    title: "校园媒体",
    path: `/function/account/account`,
  }),

  onShareTimeline: () => ({ title: "校园媒体" }),

  onAddToFavorites: () => ({
    title: "校园媒体",
    imageUrl: `${appCoverPrefix}.jpg`,
  }),

  onResize({ size }) {
    this.setData({
      height: size.windowHeight - globalData.info.statusBarHeight - 229,
    });
  },

  switch({
    currentTarget,
  }: WechatMiniprogram.TouchEvent<
    Record<string, never>,
    Record<string, never>,
    { type: string }
  >) {
    const { type = "" } = currentTarget.dataset;

    getJSON<unknown[]>(`function/account/${type}`).then((config) => {
      this.setData({ config, type });
    });
  },

  detail(
    event: WechatMiniprogram.TouchEvent<
      Record<string, never>,
      Record<string, never>,
      { id: number; qrcode?: string }
    >
  ) {
    const { id, qrcode } = event.currentTarget.dataset;

    if (qrcode)
      savePhoto(qrcode)
        .then(() => tip("二维码已保存至相册"))
        .catch(() => tip("二维码下载失败"));
    else
      wx.setClipboardData({
        data: id.toString(),
        success: () => {
          modal("复制成功", "由于暂无二维码，QQ号已复制至您的剪切板");
        },
      });
  },
});
