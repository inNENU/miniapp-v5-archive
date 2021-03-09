import $register = require("wxpage");

import { AppOption } from "../../app";

import { server } from "../../utils/config";
import { getColor, popNotice } from "../../utils/page";

const { globalData } = getApp<AppOption>();

interface DonateDetail {
  /** 赞赏支持者姓名 */
  0: string;
  /** 赞赏支持金额 */
  1: number;
}

$register("donate-list", {
  data: {
    theme: globalData.theme,
    page: {
      title: "赞赏列表",
      shareable: true,
      qrcode: false,
      from: "返回",
    },
    text: {
      style: "text-indent: 1.5rem",
      heading: "统计情况",
      text: [
        "该列表将由 Mr.Hope 每天手动统计更新，可能需要至多 48 小时来显示您的打赏信息。",
        "截至至 8 月 21日，2020 年度小程序的所有开支已经完全由大家的捐赠进行支出。这和大家的支持是分不开的，再次感谢大家对 Mr.Hope 的支持与厚爱!谢谢大家!",
        "关于今年超过的费用问题，我目前的想法是先填补前两年的亏空(前两年其实跟 2020 级的大家没什么关系，所以在此还是谢谢大家)。在填补完之后，酌情考虑升级服务器配置。大家近期也发现了小程序图片加载缓慢，这是因为小程序云端配置有限。目前 Mr.Hope 为了省钱，除了每年的一些固定费用之外，平均每天云端服务器成本不足 1.5(没错，就是三度电的价格)。所以 Mr.Hope 可能会考虑，在大家捐赠支持资金充足的情况下，将每年预计开销扩大一倍(即 1200 元)，如果还有结余，Mr.Hope 就打算自己犒劳自己了，再次感谢大家。♥",
      ],
    },
  },

  onLoad() {
    this.setData({
      color: getColor(),
      "page.statusBarHeight": globalData.info.statusBarHeight,
    });

    wx.request<DonateDetail[]>({
      url: `${server}service/donateList.php?year=2019`,
      enableHttp2: true,
      success: (res) => {
        console.log(res);
        if (res.statusCode === 200) {
          const donateList = res.data;
          let sum2019 = 0;

          donateList.forEach((element) => {
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

    wx.request<DonateDetail[]>({
      url: `${server}service/donateList.php?year=2020`,
      enableHttp2: true,
      success: (res) => {
        if (res.statusCode === 200) {
          const donateList = res.data;
          let sum2020 = 0;

          donateList.forEach((element) => {
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage: () => ({
    title: "赞赏列表",
    path: "/settings/donate/list",
    imageUrl: `${server}img/${
      globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "inNENU"
    }Share.jpg`,
  }),

  onShareTimeline: () => ({ title: "赞赏列表" }),

  onAddToFavorites: () => ({
    title: "赞赏列表",
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
});
