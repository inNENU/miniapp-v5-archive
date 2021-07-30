import { $Page } from "@mptool/enhance";

import { getImagePrefix } from "../../utils/config";
import { popNotice, resolvePage, setPage } from "../../utils/page";
import { requestJSON } from "../../utils/wx";

import type { AppOption } from "../../app";
import type { ComponentConfig, PageDataWithContent } from "../../../typings";

const { globalData } = getApp<AppOption>();

$Page("log", {
  data: {
    theme: globalData.theme,
    darkmode: globalData.darkmode,
    page: {
      title: "更新日志",
      desc: `当前版本: ${globalData.version}`,
      grey: true,
    } as PageDataWithContent,
  },

  onNavigate(res) {
    resolvePage(res, this.data.page);
  },

  onLoad(option) {
    if (globalData.page.id === "更新日志") setPage({ option, ctx: this });
    else setPage({ option: { id: "log" }, ctx: this });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.onThemeChange);

    popNotice("log");
  },

  onReady() {
    // 在线获取日志页面文件
    requestJSON(
      `resource/config/${globalData.appID}/${globalData.version}/log`,
      (data: ComponentConfig[]) => {
        setPage(
          { option: { id: "更新日志" }, ctx: this },
          {
            ...this.data.page,
            content: data,
          }
        );
      }
    );
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage: () => ({ title: "更新日志", path: "/settings/log/log" }),

  onShareTimeline: () => ({ title: "更新日志" }),

  onAddToFavorites: () => ({
    title: "更新日志",
    imageUrl: `${getImagePrefix()}.jpg`,
  }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.onThemeChange);
  },

  onThemeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },
});
