import { $Page } from "@mptool/enhance";

import { modal, savePhoto, tip } from "../../utils/api";
import { appCoverPrefix, server } from "../../utils/config";
import { ensureJSON } from "../../utils/json";
import { getColor, popNotice } from "../../utils/page";

import type { AppOption } from "../../app";
import type { WechatConfig } from "../../../typings";

const { globalData } = getApp<AppOption>();

$Page("wechat-detail", {
  data: {
    loading: true,
    config: <WechatConfig>{},
    statusBarHeight: globalData.info.statusBarHeight,
    footer: {
      desc: "更新文章，请联系 Mr.Hope",
    },
  },

  state: {
    path: "",
  },

  onNavigate(options) {
    if (options.path) ensureJSON(`function/account/${options.path}`);
  },

  onLoad({ path = "" }) {
    this.setData({
      darkmode: globalData.darkmode,
      firstPage: getCurrentPages().length === 1,
      color: getColor(true),
    });

    wx.request<WechatConfig>({
      url: `${server}service/account.php`,
      enableHttp2: true,
      method: "POST",
      data: { id: path },
      success: ({ data, statusCode }) => {
        if (statusCode === 200) this.setData({ loading: false, config: data });
        else tip("服务器出现问题");
      },
    });

    this.state.path = path;

    popNotice(`account/${this.data.config.name}`);
  },

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return {
      title: this.data.config.name,
      path: `/function/account/detail?path=${this.state.path}`,
    };
  },

  onShareTimeline(): WechatMiniprogram.Page.ICustomTimelineContent {
    return {
      title: this.data.config.name,
      query: `path=${this.state.path}`,
    };
  },

  onAddToFavorites(): WechatMiniprogram.Page.IAddToFavoritesContent {
    return {
      title: this.data.config.name,
      imageUrl: `${appCoverPrefix}.jpg`,
      query: `path=${this.state.path}`,
    };
  },

  navigate({
    currentTarget,
  }: WechatMiniprogram.TouchEvent<
    never,
    never,
    { title: string; url: string }
  >) {
    const { url } = currentTarget.dataset;

    wx.setClipboardData({
      data: url,
      success: () => {
        modal(
          "无法跳转",
          "QQ小程序并不支持跳转微信图文，链接地址已复制至剪切板。请打开浏览器粘贴查看"
        );
      },
    });
  },

  follow() {
    const { qrcode } = this.data.config;

    savePhoto(qrcode)
      .then(() => tip("二维码已存至相册"))
      .catch(() => tip("二维码保存失败"));
  },

  back() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
