/* 更新日志 */

import $register = require("wxpage");
import { changeNav, popNotice, resolvePage, setPage } from "../../utils/page";
import { AppOption } from "../../app";
import { requestJSON } from "../../utils/wx";
import { PageConfig } from "../../../typings";
const { globalData } = getApp<AppOption>();

$register("log", {
  data: {
    theme: globalData.theme,
    darkmode: globalData.darkmode,
    page: {
      title: "更新日志",
      desc: `当前版本: ${globalData.version}`,
      grey: true,
      feedback: true,
      content: [
        {
          tag: "list",
          header: "近期更新",
          content: [
            {
              text: "V 3.4.0:\n · 添加了东师介绍板块\n · 对搜索功能进行了增强",
            },
            { text: "V 3.3.0:\n小程序现在支持全文搜索" },
            { text: "V 3.2.0:\n添加校园公众号" },
            {
              text:
                "V 3.1.0:\n重构播放器\n· 解决被系统中断后无法播放的问题\n · 添加歌词",
            },
            {
              text:
                "V 3.0.0:\n重构 UI，小程序整体表现更加精致\n · 适配微信暗黑模式\n · 改善小程序底层，降低小程序内存占用",
            },
            { text: "查看详细日志", url: "page?path=other/log/index" },
          ],
        },
      ],
    },
  },

  onNavigate(res) {
    resolvePage(res, this.data.page as PageConfig);
  },

  onLoad(option: any) {
    if (globalData.page.id === "更新日志") setPage({ option, ctx: this });
    else setPage({ option: { id: "log" }, ctx: this });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("log");
  },

  onReady() {
    // 在线获取日志页面文件
    requestJSON(
      `resource/config/${globalData.appID}/${globalData.version}/log`,
      (data: any) => {
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

  onPageScroll(event) {
    changeNav(event, this);
  },

  onShareAppMessage: () => ({ title: "更新日志", path: "/settings/log/log" }),

  onShareTimeline: () => ({ title: "更新日志" }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },
});
