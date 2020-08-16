/* 赞赏支持 */
import $register = require("wxpage");
import { changeNav, popNotice, getColor } from "../../utils/page";
import { savePhoto } from "../../utils/wx";
import { server } from "../../utils/config";
import { AppOption } from "../../app";
const { globalData } = getApp<AppOption>();

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
            "如果您愿意对我进行赞赏支持，可以点击下方二维码。这样会将对应的二维码保存至您的手机相册。您可以稍后使用相应 APP 扫码来进行打赏。因为您也是学生，Mr.Hope 不建议您赞赏支持数目较大的金额，1元钱就是一份心意。",
          ],
        },
        { tag: "title", text: "备注" },
        {
          tag: "text",
          style: "text-indent: 1.5em;",
          text: [
            "为了方便统计，请您在打赏时备注“小程序打赏+ 昵称/姓名”。Mr.Hope 会将每一笔赞赏支持的姓名和打赏金额显示在赞赏列表中。再次感谢您的支持！",
            "如果您没有备注姓名，Mr.Hope 无法在转账页面获取到您的昵称或者姓名，所以只能使用佚名来进行统计。另外，不排除您没有备注“小程序打赏”时，Mr.Hope 将其遗漏掉的情况，如果您打赏但是没有看到您的姓名，请您联系我。",
          ],
        },
        { tag: "title", text: "二维码" },
      ],
      shareable: true,
      from: "返回",
    },

    list: {
      content: [{ text: "捐赠列表", url: "/settings/donate/list" }],
    },
  },

  onLoad() {
    this.setData({
      color: getColor(),
      "page.statusBarHeight": globalData.info.statusBarHeight,
    });

    if (getCurrentPages().length === 1)
      this.setData({ "page.from": "主页", "page.action": "redirect" });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("donate");
  },

  onPageScroll(event) {
    changeNav(event, this);
  },

  onShareAppMessage: () => ({
    title: "支持 Mr.Hope",
    path: "/settings/donate/donate",
    imageUrl: `${server}img/${
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

  /** 保存二维码 */
  save(res: WXEvent.Touch) {
    console.info("Start QRCode download."); // 调试
    savePhoto(`img/donate/${res.currentTarget.dataset.name}.png`);
  },

  /** 重定向到主页 */
  redirect() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
