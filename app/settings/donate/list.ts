/* 赞赏支持 */
import $register = require("wxpage");
import { changeNav, popNotice, getColor } from "../../utils/page";
import { server } from "../../utils/config";
import { AppOption } from "../../app";
const { globalData } = getApp<AppOption>();

interface DonateDetail {
  /** 赞赏支持者姓名 */
  0: string;
  /** 赞赏支持金额 */
  1: number;
}

type DonateList = DonateDetail[];

$register("donate-list", {
  data: {
    theme: globalData.theme,
    page: {
      title: "赞赏列表",
      shareable: true,
      from: "返回",
    },
    text: {
      style: "text-indent: 1.5rem",
      heading: "统计情况",
      text: [
        "该列表将由 Mr.Hope 每天手动统计更新，可能需要至多 40 小时来显示您的打赏信息。",
        "再次感谢大家对 Mr.Hope 的支持与厚爱!",
      ],
    },
  },

  onLoad() {
    this.setData({
      color: getColor(),
      "page.statusBarHeight": globalData.info.statusBarHeight,
    });

    if (getCurrentPages().length === 1)
      this.setData({ "page.from": "主页", "page.action": "redirect" });

    wx.request({
      url: `${server}service/donateList.php?year=2019`,
      enableHttp2: true,
      success: (res) => {
        console.log(res);
        if (res.statusCode === 200) {
          const donateList = res.data as DonateList;
          let sum2019 = 0;

          ((donateList as unknown) as DonateList).forEach((element) => {
            sum2019 += element[1];
          });

          this.setData({
            donate2019: donateList,
            sum2019: sum2019.toFixed(2),
            result2019: (sum2019 - 600).toFixed(2),
          });
        }
      },
    });

    wx.request({
      url: `${server}service/donateList.php?year=2020`,
      enableHttp2: true,
      success: (res) => {
        if (res.statusCode === 200) {
          const donateList = res.data as DonateList;
          let sum2020 = 0;

          ((donateList as unknown) as DonateList).forEach((element) => {
            sum2020 += element[1];
          });

          this.setData({
            donate2020: donateList,
            sum2020: sum2020.toFixed(2),
            result2020: (sum2020 - 600).toFixed(2),
          });
        }
      },
    });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("donate-list");
  },

  onPageScroll(event) {
    changeNav(event, this);
  },

  onShareAppMessage: () => ({
    title: "赞赏列表",
    path: "/settings/donate/list",
    imageUrl: `${server}img/${
      globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "inNENU"
    }Share.jpg`,
  }),

  onShareTimeline: () => ({ title: "赞赏列表" }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 重定向到主页 */
  redirect() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
