import { $Page } from "@mptool/enhance";

import { popNotice, resolvePage, setPage } from "../../utils/page";

import type { AppOption } from "../../app";
import type {
  AdvancedListComponentConfig,
  PageDataWithContent,
  PickerListComponentItemConfig,
} from "../../../typings";

const { globalData } = getApp<AppOption>();

$Page("setting", {
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
              type: "picker",
              text: "主题设置",
              select: ["ios", "android", "nenu", "weui"],
              key: "themeNum",
              handler: "updateTheme",
              single: true,
            },
          ],
        },
        {
          tag: "advanced-list",
          header: "资源更新",
          content: [
            {
              text: "资源更新提示",
              type: "switch",
              key: "resourceNotify",
            },
          ],
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

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.onThemeChange);

    popNotice("theme");
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.onThemeChange);
  },

  onThemeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  updateTheme(value: string) {
    // get the updated theme
    const theme = (
      (
        (this.data.page.content[0] as AdvancedListComponentConfig)
          .content[0] as PickerListComponentItemConfig
      ).select as string[]
    )[Number(value)];

    globalData.theme = theme;
    wx.setStorageSync("theme", theme);
    this.setData({ theme });
    this.$emitter.emit("theme", theme);

    // debug
    console.info(`Switched to ${theme} theme`);
  },
});
