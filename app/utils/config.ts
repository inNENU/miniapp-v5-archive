/** 小程序服务器地址 */
export const server = "https://mp.innenu.com/";

/** 小程序版本 */
export const version = "3.6.0";

/** App初始化选项 */
export interface AppOption {
  [props: string]: string | boolean | number;
}

/** 小程序配置 */
export const appOption: AppOption = {
  theme: "iOS",
  themeNum: 0,
  /** 是否开启夜间模式 */
  darkmode: false,
  /** 图标更新提示 */
  resourceNotify: true,
  /** 开发者模式开启状态 */
  developMode: false,
};
