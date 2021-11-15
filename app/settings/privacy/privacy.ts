import { $Page } from "@mptool/enhance";

import { popNotice, resolvePage, setPage } from "../../utils/page";
import { modal, tip } from "../../utils/wx";

import type { AppOption } from "../../app";
import type {
  ButtonListComponnetItemConfig,
  ListComponentConfig,
  PageDataWithContent,
} from "../../../typings";

const { globalData } = getApp<AppOption>();

type AuthorizeList =
  | "scope.userLocation"
  | "scope.writePhotosAlbum"
  | "scope.address"
  | "scope.invoiceTitle"
  | "scope.invoice"
  | "scope.werun"
  | "scope.record"
  | "scope.camera";

const authorizeList: AuthorizeList[] = [
  "scope.userLocation",
  "scope.writePhotosAlbum",
  // "scope.address",
  // "scope.invoiceTitle",
  // "scope.invoice",
  // "scope.werun",
  // "scope.record",
  // "scope.camera",
];

$Page("privacy", {
  data: {
    theme: globalData.theme,
    darkmode: globalData.darkmode,
    page: {
      title: "隐私说明",
      content: [
        {
          tag: "list",
          header: "隐私声明",
          content: [
            {
              text: "查看详情",
              url: `page?path=other/about/${globalData.env}-privacy`,
            },
          ],
        },
        {
          tag: "list",
          header: "授权状态",
          content: [
            { text: "地理位置", desc: "未授权×" },
            { text: "保存到相册", desc: "未授权×" },
            // { text: "用户信息", desc: "未授权×" },
            // { text: "通讯地址", desc: "未授权×" },
            // { text: "发票抬头", desc: "未授权×" },
            // { text: "获取发票", desc: "未授权×" },
            // { text: "微信运动步数", desc: "未授权×" },
            // { text: "录音", desc: "未授权×" },
            // { text: "摄像头", desc: "未授权×" },
          ],
        },
        {
          tag: "functional-list",
          header: "进行授权",
          content: [
            { text: "地理位置", type: "button", handler: "location" },
            { text: "保存到相册", type: "button", handler: "album" },
            // { text: "用户信息", type: "button", openType: "getUserInfo" },
            // { text: "通讯地址", type: "button", handler: "address" },
            // { text: "发票抬头", type: "button", handler: "invoiceTitle" },
            // { text: "获取发票", type: "button", handler: "invoice" },
            // { text: "微信运动步数", type: "button", handler: "werun" },
            // { text: "录音", type: "button", handler: "record" },
            // { text: "摄像头", type: "button", handler: "camera" },
          ],
          footer: " ",
        },
        {
          tag: "functional-list",
          header: "取消授权",
          content: [
            { text: "取消授权请进入设置页。" },
            { text: "打开设置页", type: "button", handler: "openSetting" },
          ],
          footer: " ",
        },
      ],
    } as PageDataWithContent,

    authorize: {},
  },

  onNavigate(res) {
    resolvePage(res, this.data.page);
  },

  onLoad(option) {
    if (globalData.page.id === "授权设置") setPage({ option, ctx: this });
    else setPage({ option: { id: "authorize" }, ctx: this });

    popNotice("privacy");
  },

  onReady() {
    const list = (this.data.page.content[1] as ListComponentConfig).content;

    // update authorize status
    wx.getSetting({
      success: (res) => {
        authorizeList.forEach((type, index) => {
          if (res.authSetting[type]) list[index].desc = "已授权✓";
        });

        this.setData({ "page.content[1].content": list });
      },
    });

    popNotice("privacy");
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  /** 定位授权 */
  location() {
    this.authorize(0);
  },

  /** 相册授权 */
  album() {
    this.authorize(1);
  },

  // /** 通讯地址授权 */
  // address() {
  //   this.authorize(2);
  // },

  // /** 发票抬头授权 */
  // invoiceTitle() {
  //   this.authorize(3);
  // },

  // /** 发票授权 */
  // invoice() {
  //   this.authorize(4);
  // },

  // /** 微信运动数据授权 */
  // werun() {
  //   this.authorize(5);
  // },

  // /** 录音授权 */
  // record() {
  //   this.authorize(6);
  // },

  // /** 摄像头授权 */
  // camera() {
  //   this.authorize(7);
  // },

  /** 添加好友授权 */
  addFriend() {
    this.authorize(2);
  },

  /** 授权函数 */
  authorize(type: number) {
    wx.showLoading({ title: "授权中" });

    wx.authorize({
      scope: authorizeList[type],
      success: () => {
        wx.hideLoading();
        tip("授权成功");
        this.setData({ [`page.content[1].content.[${type}].desc`]: "已授权✓" });
      },
      fail: () => {
        // 用户拒绝权限，提示用户开启权限
        wx.hideLoading();
        modal("权限被拒", "您拒绝了权限授予，请在小程序设置页允许权限", () => {
          wx.openSetting({
            success: (res) => {
              if (res.authSetting[authorizeList[type]]) tip("授权成功");
              else tip("授权失败，您没有授权");

              wx.getSetting({
                success: (res2) => {
                  const list = (
                    this.data.page.content[1] as ListComponentConfig
                  ).content;

                  authorizeList.forEach((type2, index) => {
                    (list as ButtonListComponnetItemConfig[])[index].desc = res2
                      .authSetting[type2]
                      ? "已授权✓"
                      : "未授权×";
                  });

                  this.setData({ "page.content[1].content": list });
                },
              });
            },
          });
        });
      },
    });
  },

  openSetting() {
    wx.openSetting({
      success: () => {
        wx.getSetting({
          success: (res2) => {
            const list = (this.data.page.content[1] as ListComponentConfig)
              .content;

            authorizeList.forEach((type2, index) => {
              (list as ButtonListComponnetItemConfig[])[index].desc = res2
                .authSetting[type2]
                ? "已授权✓"
                : "未授权×";
            });

            this.setData({ "page.content[1].content": list });
          },
        });
      },
    });
  },
});
