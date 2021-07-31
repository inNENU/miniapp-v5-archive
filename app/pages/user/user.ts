import { $Page } from "@mptool/enhance";

import { getImagePrefix, getTitle } from "../../utils/config";
import { getColor, popNotice, setPage } from "../../utils/page";

import type { AppOption } from "../../app";
import type { PageData } from "../../../typings";

const { globalData } = getApp<AppOption>();
const { appID, env, version } = globalData;

$Page("user", {
  data: {
    theme: globalData.theme,

    statusBarHeight: globalData.info.statusBarHeight,

    page: {
      title: "我的东师",
      grey: true,
      hidden: true,
      content: [
        {
          tag: "list",
          header: false,
          content: [
            {
              text: "外观设置",
              icon: "setting",
              url: "outlook",
            },
            {
              text: "权限设置",
              icon: "setting",
              url: "auth",
            },
            {
              text: "存储设置",
              icon: "setting",
              url: "storage",
            },
            {
              text: "更新日志",
              icon: "log",
              url: "log",
              desc: version,
            },
            {
              text: "关于",
              icon: "about",
              url: "about",
            },
          ],
        },
        {
          tag: "advanced-list",
          content: [
            {
              text: "分享小程序",
              icon: "share",
              type: "button",
              openType: "share",
            },
            {
              hidden: env === "wx",
              text: "加入 in 东师咨询群",
              icon: "qq-group",
              type: "button",
              openType: "openGroupProfile",
              groupId: "1139044856",
            },
            {
              hidden: env === "wx",
              text: "添加 Mr.Hope 好友",
              icon: "qq",
              type: "button",
              openType: "addFriend",
              openId: "868D7B2F0C609B4285698EAB77A47BA1",
            },
            {
              hidden: env === "qq",
              text:
                appID === "wx9ce37d9662499df3" ? "联系校会君" : "联系 Mr.Hope",
              icon: "contact",
              type: "button",
              openType: "contact",
            },
            {
              hidden: env === "wx",
              text: "添加到桌面",
              icon: "send",
              type: "button",
              handler: "addToDesktop",
            },
          ],
        },
      ],
    } as PageData,

    footer: {
      author: "",
      desc: `当前版本: ${version}\n${
        appID === "wx9ce37d9662499df3"
          ? "Mr.Hope 已授权东北师范大学校学生会使用小程序代码。\n"
          : ""
      }小程序由 Mr.Hope 个人制作，如有错误还请见谅`,
    },
  },

  onLoad() {
    setPage({ option: { id: "me" }, ctx: this });
    popNotice("me");
  },

  onReady() {
    // 注册事件监听器
    this.$emitter.on("theme", this.setTheme);
    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.onThemeChange);
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage: () => ({
    title: getTitle(),
    path: "/pages/main/main",
    imageUrl: `${getImagePrefix()}Share.png`,
  }),

  onShareTimeline: () => ({ title: getTitle() }),

  onAddToFavorites: () => ({
    title: getTitle(),
    imageUrl: `${getImagePrefix()}.jpg`,
  }),

  onUnload() {
    this.$emitter.off("theme", this.setTheme);
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.onThemeChange);
  },

  setTheme(theme: string): void {
    this.setData({ color: getColor(this.data.page.grey), theme });
  },

  onThemeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  addToDesktop() {
    wx.saveAppToDesktop({
      success: () => {
        console.log("Add to desktop success!");
      },
    });
  },
});
