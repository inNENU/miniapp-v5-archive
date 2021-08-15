import { $Page } from "@mptool/enhance";

import { popNotice, resolvePage, setPage } from "../../utils/page";

import type { AppOption } from "../../app";
import type {
  AdvancedListComponentConfig,
  PageDataWithContent,
  PickerListComponentItemConfig,
} from "../../../typings";
import { modal } from "../../utils/wx";

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
          header: "内容更新",
          content: [
            {
              text: "内容更新提示",
              type: "switch",
              key: "resourceNotify",
              handler: "notify",
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

    popNotice("theme");
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

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

  notify(status: boolean) {
    modal(
      `更新提示已${status ? "打开" : "关闭"}`,
      status
        ? "您将收到内容更新的提醒"
        : "7天内，您不会再收到内容更新的提醒。\n警告: 这会导致您无法获取7天内新增与修正的内容。"
    );
  },
});
