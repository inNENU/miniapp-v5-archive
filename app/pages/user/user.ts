/* 我的东师 */

import $register = require("wxpage");
import { changeNav, popNotice, resolvePage, setPage } from "../../utils/page";
import { AppOption } from "../../app";
import { PageData } from "../../../typings";
import { server } from "../../utils/config";
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
              icon: "about",
              url: "log",
              desc: globalData.version,
            },
            {
              text: "关于",
              icon: "about",
              url: "about",
            },
            {
              text: "赞赏支持 Mr.Hope",
              icon: "donate",
              desc: "了解详情",
              url: "donate",
              hidden: globalData.appID === "wx9ce37d9662499df3",
            },
          ],
        },
      ],
    } as PageData,

    footer: {
      author: "",
      desc: `当前版本: ${globalData.version}\n${
        globalData.appID === "wx9ce37d9662499df3"
          ? "Mr.Hope 已授权东北师范大学校学生会使用小程序代码。\n"
          : ""
      }小程序由 Mr.Hope 个人制作，如有错误还请见谅`,
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
    path: "/pages/main/main",
    imageUrl: `${server}img/${
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

  addToDesktop() {
    wx.saveAppToDesktop({
      success: () => {
        console.log("添加成功");
      },
    });
  },
});
