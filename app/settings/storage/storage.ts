import $register = require("wxpage");

import { AppOption } from "../../app";
import { PageDataWithContent } from "../../../typings";

import { resDownload } from "../../utils/app";
import { listFile, remove } from "../../utils/file";
import { popNotice, setPage } from "../../utils/page";
import { confirm, modal, tip } from "../../utils/wx";

const { globalData } = getApp<AppOption>();

/** 列表动作 */
type ListAction =
  | "refreshGuide"
  | "refreshFunc"
  | "refreshIntro"
  | "deleteData"
  | "resetApp";

$register("storage", {
  data: {
    theme: globalData.theme,
    darkmode: globalData.darkmode,
    page: {
      title: "存储设置",
      desc: `当前版本: ${globalData.version}`,
      grey: true,
      feedback: true,
      content: [
        {
          tag: "list",
          header: "空间占用",
          content: [
            { text: "小程序体积", desc: "390K" },
            { text: "数据缓存", desc: "获取中..." },
            { text: "文件系统", desc: "获取中..." },
          ],
        },
        {
          tag: "advanced-list",
          header: "资源刷新",
          foot: "如果页面显示出现问题请刷新资源",
          content: [
            { text: "刷新全部资源", button: "refreshAll" },
            { text: "刷新介绍资源", button: "refreshIntro" },
            { text: "刷新功能资源", button: "refreshFunc" },
            { text: "刷新指南资源", button: "refreshGuide" },
            { text: "刷新图标资源", button: "refreshIcon" },
          ],
        },
        {
          tag: "advanced-list",
          header: "重置",
          content: [
            { text: "清除小程序数据", button: "deleteData" },
            { text: "清除小程序文件", button: "deleteFile" },
            { text: "初始化小程序", button: "resetApp" },
            {
              text: "退出小程序",
              navigate: true,
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

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("storage");
  },

  onShow() {
    this.setStorage();
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll() {},

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 列表动作 */
  list({ detail }: WechatMiniprogram.TouchEvent) {
    if (detail.event) this[detail.event as ListAction]();
  },

  /** 设置存储信息 */
  setStorage() {
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
        ((res.stats as unknown) as any[]).forEach((element) => {
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
    confirm("刷新图标资源", () => {
      resDownload("function-guide-icon-intro");
    });
  },

  /** 清除小程序数据 */
  deleteData() {
    confirm("清除小程序数据", () => {
      wx.clearStorageSync();
      tip("数据清除完成");
    });
  },

  /** 清除小程序文件 */
  deleteFile() {
    confirm("清除小程序文件", () => {
      wx.showLoading({ title: "删除中", mask: true });

      listFile("").forEach((filePath: string) => {
        remove(filePath);
      });

      wx.hideLoading();
    });
  },

  /** 初始化小程序 */
  resetApp() {
    confirm("初始化小程序", () => {
      // 显示提示
      wx.showLoading({ title: "初始化中", mask: true });

      // 清除文件系统文件与数据存储
      listFile("").forEach((filePath: string) => {
        remove(filePath);
      });
      wx.clearStorageSync();

      // 隐藏提示
      wx.hideLoading();
      // 提示用户重启
      modal("小程序初始化完成", "请单击 “退出小程序按钮” 退出小程序");
    });
  },
});
