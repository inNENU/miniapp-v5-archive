import { $Page } from "@mptool/enhance";
import { ls, rm } from "@mptool/file";

import { modal } from "../../utils/api";
import { appCoverPrefix } from "../../utils/config";

import type { AppOption } from "../../app";

const {
  globalData: { theme },
} = getApp<AppOption>();

$Page("action", {
  onLoad(options) {
    if (options.scene) {
      const arg = decodeURIComponent(options.scene);

      this.setData({ [arg]: true, theme });
    } else if (options.action) this.setData({ [options.action]: true, theme });
  },

  onShareAppMessage: () => ({
    title: "功能页",
    path: "/pages/action/action?action=all",
  }),

  onShareTimeline: () => ({ title: "功能页", query: "action=all" }),

  onAddToFavorites(): WechatMiniprogram.Page.IAddToFavoritesContent {
    return {
      title: "功能页",
      imageUrl: `${appCoverPrefix}.jpg`,
      query: "action=all",
    };
  },

  /** 初始化小程序 */
  resetApp() {
    // 显示提示
    wx.showLoading({ title: "初始化中", mask: true });

    // 清除文件系统文件与数据存储
    ls("").forEach((filePath) => rm(filePath));
    wx.clearStorageSync();

    // 隐藏提示
    wx.hideLoading();
    // 提示用户重启
    modal("小程序初始化完成", "请单击 “退出小程序按钮” 退出小程序");

    this.setData({ exit: true, reset: false });
  },

  /** 返回主页 */
  home() {
    this.$reLaunch("main");
  },
});
