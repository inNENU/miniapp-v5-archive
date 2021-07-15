import { $App, $Config } from "@mptool/enhance";

import {
  appInit,
  appUpdate,
  checkResUpdate,
  getDarkmode,
  getGlobalData,
  noticeCheck,
  startup,
} from "./utils/app";

import type { GlobalData } from "./utils/app";

export interface AppOption {
  globalData: GlobalData;
}

$Config({
  defaultRoute: "/pages/$name/$name",
  routes: [
    [["function", "page", "web"], "/module/$name"],
    [
      ["calendar", "map", "music", "PEcal", "video", "weather", "wechat"],
      "/function/$name/$name",
    ],
    ["location", "/function/map/location"],
    ["wechat-detail", "/function/wechat/detail"],
    [
      ["about", "auth", "log", "outlook", "resource", "storage"],
      "/settings/$name/$name",
    ],
  ],
});

$App<AppOption>({
  /** 小程序的全局数据 */
  globalData: getGlobalData(),

  onLaunch(options) {
    // 调试
    console.info("App launched with options:", options);

    // 如果初次启动执行初始化
    if (!wx.getStorageSync("innenu-inited")) appInit();

    startup(this.globalData);

    console.info("GlobalData:", this.globalData);
  },

  onShow() {
    // 小程序已经初始化完成，检查页面资源
    if (wx.getStorageSync("innenu-inited")) checkResUpdate();
  },

  onAwake(time: number) {
    console.info(`App awakes after ${time}ms`);

    // 重新应用夜间模式、
    this.globalData.darkmode = getDarkmode();

    noticeCheck(this.globalData);
    appUpdate(this.globalData);
  },

  onError(errorMsg) {
    console.error("Catch error msg: ", errorMsg);
  },

  onPageNotFound(msg) {
    // 重定向到主界面
    wx.switchTab({ url: "pages/main/main" });

    console.warn("Page not found:", msg);
  },

  onThemeChange({ theme }) {
    this.globalData.darkmode = theme === "dark";
  },
});
