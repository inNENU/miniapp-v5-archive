import $register = require("wxpage");
import { changeNav, popNotice, getColor } from "../../utils/page";
import { ensureJSON, getJSON } from "../../utils/file";
import { AppOption } from "../../app";
import { TimeLineItem } from "../../components/timeline/timeline";
import { modal } from "../../utils/wx";
const { globalData } = getApp<AppOption>();

interface CalendarDetail {
  title: string;
  content: TimeLineItem[];
}

$register("calendar", {
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
    getJSON({
      path: "function/calendar/index",
      url: "resource/function/calendar/index",
      success: (calendar) => {
        this.setData({
          color: getColor(),
          theme: globalData.theme,
          calendar: calendar as TimeLineItem[],
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

    if (getCurrentPages().length === 1)
      this.setData({ "nav.action": "back", "nav.from": "主页" });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("calendar");
  },

  onPageScroll(event) {
    changeNav(event, this, "nav");
  },

  onShareAppMessage: () => ({
    title: "东师校历",
    path: "/function/calendar/calendar",
  }),

  onShareTimeline: () => ({ title: "东师校历" }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 显示校历详情 */
  display(event: WXEvent.Touch) {
    getJSON({
      path: `function/calendar/${event.detail.path}`,
      url: `resource/function/calendar/${event.detail.path}`,
      success: (data) => {
        this.setData({
          "popupConfig.title": (data as CalendarDetail).title,
          calendarDetail: (data as CalendarDetail).content,
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
