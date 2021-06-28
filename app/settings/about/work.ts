import $register = require("wxpage");

import { donateListPage, donatePage, workPage } from "./pageData";
import { getImagePrefix, server } from "../../utils/config";
import { getColor, popNotice } from "../../utils/page";
import { savePhoto } from "../../utils/wx";

import type { AppOption } from "../../app";
import type { PageData } from "../../../typings";

const { globalData } = getApp<AppOption>();

interface DonateDetail {
  /** 赞赏支持者姓名 */
  0: string;
  /** 赞赏支持金额 */
  1: number;
}

$register("donate", {
  data: {
    theme: globalData.theme,
    page: workPage as PageData,
    type: "work" as "work" | "donate" | "donateList",
  },

  onLoad(options) {
    const type =
      (options.type as "work" | "donate" | "donateList" | undefined) || "work";

    if (type === "donate") {
      donatePage.statusBarHeight = globalData.info.statusBarHeight;
      this.setData({
        color: getColor(),
        type,
        page: donatePage,
      });
    } else if (type === "donateList") {
      donateListPage.statusBarHeight = globalData.info.statusBarHeight;
      this.setData({
        color: getColor(),
        type,
        page: donateListPage,
      });

      [2019, 2020, 2021].forEach((year) => {
        // fetch 2019
        wx.request<DonateDetail[]>({
          url: `${server}service/donateList.php?year=${year}`,
          enableHttp2: true,
          success: (res) => {
            if (res.statusCode === 200) {
              const donateList = res.data;
              let sum = 0;

              donateList.forEach((element) => {
                sum += element[1];
              });

              this.setData({
                [`donate${year}`]: donateList,
                [`sum${year}`]: sum.toFixed(2),
                [`result${year}`]: (sum - 600).toFixed(2),
              });
            }
          },
        });
      });
    } else
      this.setData({
        color: getColor(),
        type,
        "page.statusBarHeight": globalData.info.statusBarHeight,
      });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.onThemeChange);

    popNotice(type);
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return {
      title: this.getTitle(),
      path: `/settings/donate/donate?type=${this.data.type}`,
      imageUrl: `${getImagePrefix()}Share.jpg`,
    };
  },

  onShareTimeline(): WechatMiniprogram.Page.ICustomTimelineContent {
    return { title: this.getTitle() };
  },

  onAddToFavorites(): WechatMiniprogram.Page.IAddToFavoritesContent {
    return {
      title: this.getTitle(),
      imageUrl: `${getImagePrefix()}.jpg`,
      query: `type=${this.data.type}`,
    };
  },

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.onThemeChange);
  },

  onThemeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  getTitle() {
    return this.data.type === "donate"
      ? "支持 Mr.Hope"
      : this.data.type === "donateList"
      ? "捐赠列表"
      : "关于";
  },

  /** 保存二维码 */
  saveWechatQRCode() {
    savePhoto("img/donate/Wechat.jpg");
  },

  saveAlipayQRCode() {
    savePhoto("img/donate/Alipay.jpg");
  },
});
