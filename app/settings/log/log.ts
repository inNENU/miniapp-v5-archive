/* 更新日志 */

import $register = require("wxpage");
import { changeNav, popNotice, resolvePage, setPage } from "../../utils/page";
import { AppOption } from "../../app";
import { requestJSON } from "../../utils/wx";
import { ComponentConfig, PageDataWithContent } from "../../../typings";
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
            { text: "V 3.7.0:\n · 重构资源更新逻辑" },
            { text: "V 3.6.0:\n · 图标支持热更新" },
            {
              text:
                "V 3.5.0:\n · 添加了复制组件\n · 添加了添加好友、加群、发送到桌面等快捷功能(仅QQ)\n · 添加了二维码(仅QQ)\n · 添加了版权说明",
            },
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
    } as PageDataWithContent,
  },

  onNavigate(res) {
    resolvePage(res, this.data.page);
  },

  onLoad(option) {
    if (globalData.page.id === "更新日志") setPage({ option, ctx: this });
    else setPage({ option: { id: "log" }, ctx: this });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

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
