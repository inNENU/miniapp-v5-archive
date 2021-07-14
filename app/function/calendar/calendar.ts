import { $Page } from "@mptool/enhance";

import { getColor, popNotice } from "../../utils/page";
import { ensureJSON, getJSON } from "../../utils/file";
import { modal } from "../../utils/wx";
import { getImagePrefix } from "../../utils/config";

import type { AppOption } from "../../app";
import type { TimeLineItem } from "../../components/timeline/timeline";

const { globalData } = getApp<AppOption>();

interface CalendarDetail {
  title: string;
  content: TimeLineItem[];
}

$Page("calendar", {
  data: {
    theme: globalData.theme,
    /** 头部配置 */
    nav: {
      title: "东师校历",
      statusBarHeight: globalData.info.statusBarHeight,
      from: "功能大厅",
    },
    calendar: [] as TimeLineItem[],
    popupConfig: {
      title: "校历详情",
      cancel: false,
    },
  },

  onNavigate() {
    ensureJSON({ path: "function/calendar/index" });
  },

  onLoad() {
    getJSON<TimeLineItem[]>({
      path: "function/calendar/index",
      url: "resource/function/calendar/index",
      success: (calendar) => {
        this.setData({
          color: getColor(),
          theme: globalData.theme,
          calendar,
        });
      },
      fail: () => {
        modal(
          "获取失败",
          "校历信息获取失败，请稍后重试。如果该情况持续发生，请反馈给开发者",
          () => this.back()
        );
      },
    });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.onThemeChange);

    popNotice("calendar");
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage: () => ({
    title: "东师校历",
    path: "/function/calendar/calendar",
  }),

  onShareTimeline: () => ({ title: "东师校历" }),

  onAddToFavorites: () => ({
    title: "东师校历",
    imageUrl: `${getImagePrefix()}.jpg`,
  }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.onThemeChange);
  },

  onThemeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 显示校历详情 */
  display(event: WechatMiniprogram.TouchEvent<{ path: string }>) {
    getJSON<CalendarDetail>({
      path: `function/calendar/${event.detail.path}`,
      url: `resource/function/calendar/${event.detail.path}`,
      success: (data) => {
        this.setData({
          "popupConfig.title": data.title,
          calendarDetail: data.content,
          display: true,
        });
      },
      fail: () => {
        modal(
          "获取失败",
          "学期详情获取失败，请稍后重试。如果该情况持续发生，请反馈给开发者"
        );
      },
    });
  },

  /** 关闭校历详情 */
  close() {
    this.setData({ display: false });
  },

  back() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
