import type { AppOption } from "../app";

/** 小程序服务器地址 */
export const server = "https://mp.innenu.com/";

/** 小程序版本 */
export const version = "4.0.2";

/** App初始化选项 */
export interface AppConfig {
  [props: string]: string | boolean | number;
}

/** 小程序配置 */
export const appConfig: AppConfig = {
  theme: "ios",
  themeNum: 0,
  /** 是否开启夜间模式 */
  darkmode: false,
  /** 图标更新提示 */
  resourceNotify: true,
  /** 开发者模式开启状态 */
  developMode: false,
};

export const getTitle = (): string => {
  const { globalData } = getApp<AppOption>();

  return globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "in东师";
};

export const getImagePrefix = (): string => {
  const { globalData } = getApp<AppOption>();

  return `${server}img/${
    globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "inNENU"
  }`;
};
