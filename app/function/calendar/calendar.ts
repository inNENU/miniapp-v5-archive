import { $Page } from "@mptool/enhance";

import { getColor, popNotice } from "../../utils/page";
import { ensureJSON, getJSON } from "../../utils/json";
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
    info: globalData.info,

    calendar: [] as TimeLineItem[],
    popupConfig: {
      title: "校历详情",
      cancel: false,
    },
  },

  onNavigate() {
    ensureJSON("function/calendar/index");
  },

  onLoad() {
    getJSON<TimeLineItem[]>("function/calendar/index")
      .then((calendar) => {
        this.setData({
          color: getColor(),
          theme: globalData.theme,
          info: globalData.info,
          firstPage: getCurrentPages().length === 1,
          calendar,
        });
      })
      .catch(() => {
        modal(
          "获取失败",
          "校历信息获取失败，请稍后重试。如果该情况持续发生，请反馈给开发者",
          () => this.back()
        );
      });

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

  /** 显示校历详情 */
  display(event: WechatMiniprogram.TouchEvent<{ path: string }>) {
    getJSON<CalendarDetail>(`function/calendar/${event.detail.path}`)
      .then((data) => {
        this.setData({
          "popupConfig.title": data.title,
          calendarDetail: data.content,
          display: true,
        });
      })
      .catch(() => {
        modal(
          "获取失败",
          "学期详情获取失败，请稍后重试。如果该情况持续发生，请反馈给开发者"
        );
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
