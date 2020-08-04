/* 我的东师 */

import $register = require("wxpage");
import { changeNav, popNotice, resolvePage, setPage } from "../../utils/page";
import { AppOption } from "../../app";
import { PageConfig } from "../../../typings";
const { globalData } = getApp<AppOption>();

$register("me", {
  data: {
    theme: globalData.theme,
    env: globalData.env,
    appID: globalData.appID,

    /** 自定义导航栏配置 */
    nav: {
      title: "我的东师",
      action: false,
      grey: true,
      statusBarHeight: globalData.info.statusBarHeight,
    },
    page: {
      tag: "head",
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
              icon: "/icon/tabPage/setting.svg",
              url: "outlook",
            },
            {
              text: "权限设置",
              icon: "/icon/tabPage/setting.svg",
              url: "auth",
            },
            {
              text: "存储设置",
              icon: "/icon/tabPage/setting.svg",
              url: "storage",
            },
            {
              text: "更新日志",
              icon: "/icon/tabPage/about.svg",
              url: "log",
              desc: globalData.version,
            },
            {
              text: "小程序内容",
              desc: "帮助更新?",
              icon: "/icon/tabPage/about.svg",
              url: "resource",
            },
            {
              text: "关于",
              icon: "/icon/tabPage/about.svg",
              url: "about",
            },
            {
              text: "赞赏支持 Mr.Hope",
              icon: "/icon/tabPage/donate.svg",
              desc: "了解详情",
              url: "donate",
              hidden: globalData.appID === "wx9ce37d9662499df3",
            },
          ],
        },
      ],
    } as PageConfig,

    footer: {
      author: "",
      desc: `当前版本：${globalData.version}\n小程序由${
        globalData.appID === "wx9ce37d9662499df3"
          ? "校学生会委托 Mr.Hope "
          : " Mr.Hope 个人"
      }制作，如有错误还请见谅`,
    },
  },

  onPreload(res) {
    this.$put("me", resolvePage(res, this.data.page));
    console.info(
      `我的东师预加载用时${new Date().getTime() - globalData.date}ms`
    );
  },

  onLoad() {
    setPage({ option: { id: "me" }, ctx: this }, this.$take("me"));
    popNotice("me");
  },

  onReady() {
    // 注册事件监听器
    this.$on("theme", (theme: string) => {
      this.setData({ theme });
    });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);
  },

  onPageScroll(event) {
    changeNav(event, this, "nav");
  },

  onShareAppMessage: () => ({
    title: globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "in东师",
    path: "/page/main/main",
    imageUrl: `https://v3.mp.innenu.com/img/${
      globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "inNENU"
    }Share.jpg`,
  }),

  onShareTimeline: () => ({
    title: globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "in东师",
  }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },
});
