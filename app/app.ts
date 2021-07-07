import { $App, $Config } from "@mptool/enhance";

import {
  appInit,
  appUpdate,
  checkResUpdate,
  getDarkmode,
  noticeCheck,
  startup,
} from "./utils/app";
import { version } from "./utils/config";

import type { PageData } from "../typings";

export interface GlobalData {
  /** 小程序运行环境 */
  env: string;
  /** 版本号 */
  version: string;
  /** 播放器信息 */
  music: {
    /** 是否正在播放 */
    playing: boolean;
    /** 播放歌曲序号 */
    index: number;
  };
  /** 页面信息 */
  page: {
    /** 页面数据 */
    data?: PageData;
    /** 页面标识符 */
    id?: string;
  };
  /** 启动时间 */
  date: number;
  /** 正在应用的主题 */
  theme: string;
  /** 夜间模式开启状态 */
  darkmode: boolean;
  /** 设备信息 */
  info: WechatMiniprogram.SystemInfo;
  /** 小程序appid */
  appID: string;
}

export interface AppOption {
  globalData: GlobalData;
}

$Config({
  defaultRoute: "/pages/$name$name",
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
    ["work", "/settings/about/work"],
  ],
});

$App<AppOption>({
  /** 小程序的全局数据 */
  globalData: {
    version,
    music: { playing: false, index: 0 },
    page: {
      data: [],
      aim: "",
    },
    date: new Date().getTime(),
    env: "wx",
  } as unknown as GlobalData,

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
