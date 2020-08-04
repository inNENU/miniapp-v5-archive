/* 赞赏支持 */
import $register = require("wxpage");
import { changeNav, popNotice, getColor } from "../../utils/page";
import { requestJSON, savePhoto } from "../../utils/wx";
import { AppOption } from "../../app";
const { globalData } = getApp<AppOption>();

interface DonateDetail {
  /** 赞赏支持者姓名 */
  0: string;
  /** 赞赏支持金额 */
  1: number;
}

type DonateList = DonateDetail[];

$register("donate", {
  data: {
    theme: globalData.theme,
    page: {
      title: "赞赏支持",

      content: [
        { tag: "title", text: "服务器现状" },
        {
          tag: "text",
          style: "text-indent: 1.5em;",
          text: [
            "Mr.Hope 每年会在小程序与网站上支出服务器、域名、数据库等成本约 600 元。Mr.Hope 向同学郑重承诺，你打赏的每一分钱都会投入到小程序开发上来。",
          ],
        },
        { tag: "title", text: "赞赏方式" },
        {
          tag: "text",
          style: "text-indent: 1.5em;",
          text: [
            "如果您愿意对我进行赞赏支持，可以点击下方二维码。这样会将对应的二维码保存至您的手机相册。您可以稍后使用相应 APP 扫码来进行打赏。因为您也是学生，Mr.Hope 不建议您赞赏支持数目较大的金额，几分钱也是同学一份心意。为了方便统计，请您在打赏时备注“小程序打赏+ 昵称/姓名”，这样能够方便 Mr.Hope 统计。Mr.Hope 会将每一笔赞赏支持的姓名和打赏金额显示在下方的列表中。再次感谢您的支持！",
          ],
        },
        { tag: "title", text: "二维码" },
      ],
      shareable: true,
      from: "返回",
    },
    donate2019: [
      ["小迷妹", 52.13],
      ["东方逸仙", 23.36],
      ["望竹", 25],
      ["羊焓熙", 20],
      ["小黄", 20],
      ["佚名", 20],
      ["佚名", 15.54],
      ["李念真", 14.48],
      ["老炮", 11.11],
      ["佚名", 11.11],
      ["范静怡", 10],
      ["李文雯", 10],
      ["卢大帅", 10],
      ["南棠", 10],
      ["王昊", 10],
      ["张雨衫", 10],
      ["佚名", 10],
      ["吴亚坤", 9.99],
      ["育明", 8.88],
      ["佚名", 7],
      ["佚名", 6.88],
      ["佚名", 6.66],
      ["白晶", 6.66],
      ["伍洁婷", 6.66],
      ["佚名", 6],
      ["佚名", 6],
      ["...", 5],
      ["等你很久了.", 5],
      ["佚名", 5],
      ["佚名", 2.5],
      ["佚名", 2],
      ["佚名", 2],
      ["佚名", 2],
    ],
    sum2019: 370.96,
    income2019: -229.04,
  },

  onLoad() {
    this.setData({
      color: getColor(),
      "page.statusBarHeight": globalData.info.statusBarHeight,
    });

    if (getCurrentPages().length === 1)
      this.setData({
        "page.from": "主页",
        "page.action": "redirect",
      });

    // 获取赞赏支持列表数据
    requestJSON("resource/config/donate/2020", (donateList) => {
      let sum2020 = 0;

      ((donateList as unknown) as DonateList).forEach((element) => {
        sum2020 += element[1];
      });

      this.setData({
        donate2020: donateList,
        sum2020: Math.floor(100 * sum2020) / 100,
      });
    });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("donate");
  },

  onPageScroll(event) {
    changeNav(event, this);
  },

  onShareAppMessage: () => ({
    title: "支持 Mr.Hope",
    path: "/settings/donate/donate",
    imageUrl: `https://v3.mp.innenu.com/img/${
      globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "inNENU"
    }Share.jpg`,
  }),

  onShareTimeline: () => ({ title: "支持 Mr.Hope" }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 重定向到主页 */
  redirect() {
    this.$launch("main");
  },

  /** 保存二维码 */
  save(res: WXEvent.Touch) {
    console.info("Start QRCode download."); // 调试
    savePhoto(`img/donate/${res.currentTarget.dataset.name}.png`);
  },
});
