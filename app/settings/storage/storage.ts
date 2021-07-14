import { $Page } from "@mptool/enhance";
import { ls, rm } from "@mptool/file";

import { resDownload } from "../../utils/app";
import { popNotice, setPage } from "../../utils/page";
import { confirm, modal, tip } from "../../utils/wx";

import type { AppOption } from "../../app";
import type { PageDataWithContent } from "../../../typings";

const { globalData } = getApp<AppOption>();

$Page("storage", {
  data: {
    theme: globalData.theme,
    darkmode: globalData.darkmode,
    page: {
      title: "存储设置",
      desc: `当前版本: ${globalData.version}`,
      grey: true,
      content: [
        {
          tag: "list",
          header: "空间占用",
          content: [
            { text: "小程序体积", desc: "412K" },
            { text: "数据缓存", desc: "获取中..." },
            { text: "文件系统", desc: "获取中..." },
          ],
        },
        {
          tag: "advanced-list",
          header: "资源刷新",
          foot: "如果页面显示出现问题请刷新资源",
          content: [
            { text: "刷新全部资源", type: "button", handler: "refreshAll" },
            { text: "刷新介绍资源", type: "button", handler: "refreshIntro" },
            { text: "刷新功能资源", type: "button", handler: "refreshFunc" },
            { text: "刷新指南资源", type: "button", handler: "refreshGuide" },
            { text: "刷新图标资源", type: "button", handler: "refreshIcon" },
          ],
        },
        {
          tag: "advanced-list",
          header: "重置",
          content: [
            { text: "清除小程序数据", type: "button", handler: "clearData" },
            { text: "清除小程序文件", type: "button", handler: "clearFiles" },
            { text: "初始化小程序", type: "button", handler: "resetApp" },
            {
              text: "退出小程序",
              type: "navigator",
              openType: "exit",
              target: "miniProgram",
            },
          ],
        },
      ],
    } as PageDataWithContent,
  },

  onLoad() {
    setPage({ option: { id: "storage" }, ctx: this }, this.data.page);

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.onThemeChange);

    popNotice("storage");
  },

  onShow() {
    this.setStorageStat();
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.onThemeChange);
  },

  onThemeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 设置存储信息 */
  setStorageStat() {
    wx.getStorageInfo({
      success: ({ currentSize }) => {
        // 写入存储大小
        this.setData({
          "page.content[0].content[1].desc": `${currentSize}K/10240K`,
        });
      },
    });

    let fileSize = 0;

    wx.getFileSystemManager().stat({
      path: wx.env.USER_DATA_PATH,
      recursive: true,
      success: (res) => {
        // TODO: update
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (res.stats as unknown as any[]).forEach((element) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          fileSize += element.stats.size;
        });

        // 写入文件大小
        this.setData({
          "page.content[0].content[2].desc": `${Math.ceil(
            fileSize / 1024
          )}K/10240K`,
        });
      },
    });
  },

  /** 刷新指南资源 */
  refreshGuide() {
    confirm("刷新指南资源", () => {
      resDownload("guide");
    });
  },

  /** 刷新功能资源 */
  refreshFunc() {
    confirm("刷新功能资源", () => {
      resDownload("function");
    });
  },

  /** 刷新功能资源 */
  refreshIntro() {
    confirm("刷新介绍资源", () => {
      resDownload("intro");
    });
  },

  /** 刷新图标资源 */
  refreshIcon() {
    confirm("刷新图标资源", () => {
      resDownload("icon");
    });
  },

  /** 刷新所有资源 */
  refreshAll() {
    confirm("刷新全部资源", () => {
      resDownload("function-guide-icon-intro");
    });
  },

  /** 清除小程序数据 */
  clearData() {
    confirm("清除小程序数据", () => {
      wx.clearStorageSync();
      tip("数据清除完成");
    });
  },

  /** 清除小程序文件 */
  clearFiles() {
    confirm("清除小程序文件", () => {
      wx.showLoading({ title: "删除中", mask: true });

      ls("").forEach((filePath) => rm(filePath));

      wx.hideLoading();
    });
  },

  /** 初始化小程序 */
  resetApp() {
    confirm("初始化小程序", () => {
      // 显示提示
      wx.showLoading({ title: "初始化中", mask: true });

      // 清除文件系统文件与数据存储
      ls("").forEach((filePath) => rm(filePath));
      wx.clearStorageSync();

      // 隐藏提示
      wx.hideLoading();
      // 提示用户重启
      modal("小程序初始化完成", "请单击 “退出小程序按钮” 退出小程序");
    });
  },
});
