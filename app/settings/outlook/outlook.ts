import $register = require("wxpage");

import { AppOption } from "../../app";
import {
  AdvancedListComponentConfig,
  PageDataWithContent,
  PickerListComponentItemConfig,
} from "../../../typings";

import { popNotice, resolvePage, setPage } from "../../utils/page";

const { globalData } = getApp<AppOption>();

/** 列表动作列表 */
type ListAction = "setTheme";

$register("setting", {
  data: {
    theme: globalData.theme,
    darkmode: globalData.darkmode,
    event: [],
    page: {
      title: "外观设置",
      grey: true,
      content: [
        {
          tag: "advanced-list",
          header: "主题设置",
          content: [
            {
              text: "主题设置",
              key: "themeNum",
              single: true,
              pickerValue: ["ios", "android", "nenu", "weui"],
              picker: "setTheme",
            },
          ],
        },
        {
          tag: "advanced-list",
          header: "资源更新",
          content: [{ text: "资源更新提示", swiKey: "resourceNotify" }],
        },
      ],
    } as PageDataWithContent,
  },

  onNavigate(res) {
    resolvePage(res, this.data.page);
  },

  onLoad(option) {
    if (globalData.page.id === "外观设置") setPage({ option, ctx: this });
    else setPage({ option, ctx: this }, this.data.page);

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("theme");
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 列表控制函数 */
  list({ detail }: WechatMiniprogram.TouchEvent) {
    if (detail.event) this[detail.event as ListAction](detail.value);
  },

  /**
   * 设置主题
   *
   * @param value 主题名称
   */
  setTheme(value: string) {
    const theme = (((this.data.page.content[0] as AdvancedListComponentConfig)
      .content[0] as PickerListComponentItemConfig).pickerValue as string[])[
      Number(value)
    ];

    globalData.theme = theme;
    wx.setStorageSync("theme", theme);
    this.setData({ theme });
    this.$emit("theme", theme);

    // 调试
    console.info(`theme 切换为 ${theme}`);
  },
});
