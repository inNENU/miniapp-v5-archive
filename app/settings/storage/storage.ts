/* 关于 */
import $register = require("wxpage");
import { remove, listFile } from "../../utils/file";
import { changeNav, popNotice, resolvePage, setPage } from "../../utils/page";
import { confirm, modal, tip } from "../../utils/wx";
import { AppOption } from "../../app";
import { resDownload } from "../../utils/tab";
import { PageConfig } from "../../../typings";
const { globalData } = getApp<AppOption>();

/** 列表动作 */
type ListAction =
  | "getStorage"
  | "refreshGuide"
  | "refreshFunc"
  | "deleteData"
  | "deleteData"
  | "resetApp";

$register("storage", {
  data: {
    theme: globalData.theme,
    darkmode: globalData.darkmode,
    page: {
      title: "存储设置",
      desc: `当前版本：${globalData.version}`,
      grey: true,
      feedback: true,
      content: [
        {
          tag: "List",
          header: "数据缓存",
          content: [{ text: "空间占用情况", desc: "0K/10240K" }],
        },
        {
          tag: "List",
          header: "文件系统",
          content: [{ text: "空间占用情况", desc: "0K/10240K" }],
        },
        {
          tag: "List",
          header: "资源刷新",
          foot: "如果页面显示出现问题请刷新资源",
          content: [
            { text: "刷新功能资源", button: "refreshFunc" },
            { text: "刷新指南资源", button: "refreshGuide" },
          ],
        },
        {
          tag: "List",
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
    },
  },

  onNavigate(res) {
    resolvePage(res, this.getStorage());
  },

  onLoad(option: any) {
    if (globalData.page.id === "存储设置") setPage({ option, ctx: this });
    else
      setPage(
        { option: { id: "storage" }, ctx: this },
        this.data.page as PageConfig
      );

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("storage");
  },

  onShow() {
    if (globalData.page.id !== "存储设置")
      setPage({ option: { id: "storage" }, ctx: this }, this.getStorage());
  },

  onPageScroll(event) {
    changeNav(event, this);
  },

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 列表动作 */
  list({ detail }: any) {
    if (detail.event) this[detail.event as ListAction]();
  },

  /** 获得存储信息 */
  getStorage() {
    const page = this.data.page as any;
    const { currentSize } = wx.getStorageInfoSync();
    let fileSize = 0;

    ((wx
      .getFileSystemManager()
      .statSync(wx.env.USER_DATA_PATH, true) as unknown) as any[]).forEach(
      (element) => {
        fileSize += element.stats.size;
      }
    );

    page.content[0].content[0].desc = `${currentSize}K/10240K`; // 写入存储大小
    page.content[1].content[0].desc = `${Math.floor(fileSize / 1024)}K/10240K`; // 写入文件大小

    return page;
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
