import $register = require("wxpage");

import { AppOption } from "../../app";
import { PageDataWithContent } from "../../../typings";

import { server } from "../../utils/config";
import { popNotice, getColor } from "../../utils/page";
import { savePhoto } from "../../utils/wx";

const { globalData } = getApp<AppOption>();

$register("donate", {
  data: {
    theme: globalData.theme,
    page: {
      title: "赞赏支持",

      content: [
        { tag: "title", text: "小程序现状" },
        {
          tag: "text",
          style: "text-indent: 1.5em;",
          text: [
            "至今，制作和完善小程序花费了 Mr.Hope 近 1800 小时的时间，Mr.Hope 也成功利用这段时间，为大家带来超过 31 万字的最全新生攻略。",
            "Mr.Hope 目前迎新期间每天会新增 2000 - 3000 字的内容至小程序中，同时也会每天花费约 4 个小时解答大家向我询问的各种问题。在平日里，Mr.Hope 也会每月抽出一整天校对和更新小程序内容。",
            "Mr.Hope 平均每年在小程序上花费的时间超过 500 小时。另外 Mr.Hope 每年会在小程序与网站上支出服务器、域名、数据库等成本约 600 元。欢迎您进行打赏，以便支持小程序每年的开支与 Mr.Hope 付出的时间。",
          ],
        },
        { tag: "title", text: "赞赏方式" },
        {
          tag: "text",
          style: "text-indent: 1.5em;",
          text: [
            "如果您愿意对我的工作以及我的开销进行赞赏支持，可以点击下方二维码。这样会将对应的二维码保存至您的手机相册。您可以稍后使用相应 APP 扫码来进行打赏。如果您是学生，Mr.Hope 不建议您赞赏支持数目较大的金额，1 至 2 元钱就是一份心意。如果您是家长，Mr.Hope 欢迎您进行一定程度的赞赏。",
          ],
        },
        { tag: "title", text: "赞赏方式" },
        {
          tag: "advanced-list",
          header: false,
          content: [{ text: "保存二维码", button: "save" }],
        },
        { tag: "title", text: "捐赠列表" },
        {
          tag: "advanced-list",
          header: false,
          content: [{ text: "查看详情", url: "/settings/donate/list" }],
        },
        { tag: "title", text: "备注" },
        {
          tag: "text",
          style: "text-indent: 1.5em;",
          text: [
            "由于 Mr.Hope 无法在转账页面获取到您的昵称或者姓名，请您在打赏时备注“小程序打赏 + 昵称/姓名”。Mr.Hope 会将每一笔赞赏支持的姓名和打赏金额显示在赞赏列表中(未备注的捐赠将显示为佚名)。再次感谢您的支持！",
            "Mr.Hope 也许会产生统计遗漏，如果您捐赠但未看到您的姓名，请您务必联系我。",
          ],
        },
      ],
      action: false,
      shareable: true,
      qrcode: false,
    } as PageDataWithContent,
  },

  onLoad() {
    this.setData({
      color: getColor(),
      "page.statusBarHeight": globalData.info.statusBarHeight,
    });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("donate");
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage: () => ({
    title: "支持 Mr.Hope",
    path: "/settings/donate/donate",
    imageUrl: `${server}img/${
      globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "inNENU"
    }Share.jpg`,
  }),

  onShareTimeline: () => ({ title: "支持 Mr.Hope" }),

  onAddToFavorites: () => ({
    title: "支持 Mr.Hope",
    imageUrl: `${server}img/${
      globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "inNENU"
    }.jpg`,
  }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 保存二维码 */
  save() {
    console.info("Start QRCode download."); // 调试
    savePhoto("img/donate/Alipay.jpg");
    savePhoto("img/donate/Wechat.jpg");
  },
});
