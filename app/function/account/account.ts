import { $Page } from "@mptool/enhance";

import { getImagePrefix } from "../../utils/config";
import { ensureJSON, getJSON } from "../../utils/json";
import { getColor, popNotice } from "../../utils/page";
import { savePhoto, tip } from "../../utils/wx";

import type { AppOption } from "../../app";

const { globalData } = getApp<AppOption>();
const { env } = globalData;

$Page("account", {
  data: {
    config: [] as unknown[],

    theme: globalData.theme,
    info: globalData.info,
    env: globalData.env,
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
      this.setData({
        config,

        type,
        color: getColor(),
        theme: globalData.theme,
        firstPage: getCurrentPages().length === 1,
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
    imageUrl: `${getImagePrefix()}.jpg`,
  }),

  switch({
    currentTarget,
  }: WechatMiniprogram.Touch<
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    WechatMiniprogram.TouchDetail,
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    { type: string }
  >) {
    const { type = "" } = currentTarget.dataset;

    getJSON<unknown[]>(`function/account/${type}`).then((config) => {
      this.setData({ config, type });
    });
  },

  qrcode({
    currentTarget,
  }: WechatMiniprogram.Touch<
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    WechatMiniprogram.TouchDetail,
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    { qrcode: string }
  >) {
    savePhoto(currentTarget.dataset.qrcode)
      .then(() => tip("二维码已保存至相册"))
      .catch(() => tip("二维码下载失败"));
  },
});
