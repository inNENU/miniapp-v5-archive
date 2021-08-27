import { $Page } from "@mptool/enhance";
import { put, take } from "@mptool/file";

import { checkResUpdate } from "../../utils/app";
import { getImagePrefix, getTitle } from "../../utils/config";
import { getColor, popNotice, resolvePage, setPage } from "../../utils/page";
import { refreshPage } from "../../utils/tab";

import type { AppOption } from "../../app";
import type {
  AdvancedListComponentConfig,
  PageDataWithContent,
  PickerListComponentItemConfig,
} from "../../../typings";

const { globalData } = getApp<AppOption>();
const { appID, version } = globalData;

$Page("user", {
  data: {
    page: {
      title: "我的东师",
      grey: true,
      hidden: true,
    },

    footer: {
      author: "",
      desc: `当前版本: ${version}\n${
        appID === "wx9ce37d9662499df3"
          ? "Mr.Hope 已授权东北师范大学校学生会使用小程序代码。\n"
          : ""
      }小程序由 Mr.Hope 个人制作，如有错误还请见谅`,
    },

    theme: globalData.theme,
    statusBarHeight: globalData.info.statusBarHeight,
  },

  onPreload(res) {
    put("user", resolvePage(res, wx.getStorageSync("user") || this.data.page));
    console.info(
      `User page loading time: ${new Date().getTime() - globalData.date}ms`
    );
  },

  onLoad() {
    setPage(
      { option: { id: "user" }, ctx: this },
      take("user") || this.data.page
    );
  },

  onShow() {
    refreshPage("user").then((data) => {
      setPage({ ctx: this, option: { id: "user" } }, data);
    });
    popNotice("user");
  },

  onPullDownRefresh() {
    refreshPage("user").then((data) => {
      setPage({ ctx: this, option: { id: "user" } }, data);
    });
    checkResUpdate();
    wx.stopPullDownRefresh();
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onShareAppMessage: () => ({
    title: getTitle(),
    path: "/pages/main/main",
    imageUrl: `${getImagePrefix()}Share.png`,
  }),

  onShareTimeline: () => ({ title: getTitle() }),

  onAddToFavorites: () => ({
    title: getTitle(),
    imageUrl: `${getImagePrefix()}.jpg`,
  }),

  addToDesktop() {
    wx.saveAppToDesktop({
      success: () => {
        console.log("Add to desktop success!");
      },
    });
  },

  updateTheme(value: string) {
    // get the updated theme
    const theme = (
      (
        (
          (this.data.page as PageDataWithContent)
            .content[0] as AdvancedListComponentConfig
        ).content[0] as PickerListComponentItemConfig
      ).select as string[]
    )[Number(value)];

    globalData.theme = theme;
    wx.setStorageSync("theme", theme);
    this.setData({ color: getColor(this.data.page.grey), theme });
    this.$emitter.emit("theme", theme);

    // debug
    console.info(`Switched to ${theme} theme`);
  },
});
