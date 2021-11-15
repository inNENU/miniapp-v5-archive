import { $App, $Config, wrapFunction } from "@mptool/enhance";

import {
  appInit,
  appUpdate,
  checkResUpdate,
  getDarkmode,
  getGlobalData,
  noticeCheck,
  startup,
} from "./utils/app";

import type { TrivialPageInstance } from "@mptool/enhance";
import type { GlobalData } from "./utils/app";

export interface AppOption {
  globalData: GlobalData;
}

$Config({
  defaultRoute: "/pages/$name/$name",
  routes: [
    [["function", "page", "web"], "/module/$name"],
    [
      [
        "account",
        "calendar",
        "location",
        "map",
        "music",
        "PEcal",
        "phone",
        "video",
        "weather",
        "website",
      ],
      "/function/$name/$name",
    ],
    ["account-detail", "/function/account/detail"],
    [["about", "log", "privacy", "storage"], "/settings/$name/$name"],
  ],

  injectPage: (_name, options) => {
    options.onThemeChange =
      (options.onThemeChange as (
        this: TrivialPageInstance,
        { theme }: WechatMiniprogram.OnThemeChangeCallbackResult
      ) => void | undefined) ||
      function (
        this: TrivialPageInstance,
        { theme }: WechatMiniprogram.OnThemeChangeCallbackResult
      ): void {
        this.setData({ darkmode: theme === "dark" });
      };

    options.onLoad = wrapFunction(
      options.onLoad,
      function (this: TrivialPageInstance & { onThemeChange: () => void }) {
        if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.onThemeChange);
      }
    );

    options.onUnload = wrapFunction(
      options.onUnload,
      function (this: TrivialPageInstance & { onThemeChange: () => void }) {
        if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.onThemeChange);
      }
    );
  },
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
