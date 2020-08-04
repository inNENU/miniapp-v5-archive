/* 小程序资源说明 */
import $register = require("wxpage");
import { changeNav, popNotice, getColor } from "../../utils/page";
import { AppOption } from "../../app";
import { modal } from "../../utils/wx";
const { globalData } = getApp<AppOption>();

/** 列表动作 */
type ListAction = "resource" | "public" | "physics";

$register("resource", {
  data: {
    theme: globalData.theme,
    darkmode: globalData.darkmode,
    page: {
      title: "资源说明",
      content: [
        { tag: "title", text: "小程序页面资源" },
        {
          tag: "text",
          style: "text-indent: 1.5em;",
          text: [
            "小程序资源项目库在 Github 上开源。如果您愿意对小程序提供帮助，可以帮助扩充或编辑小程序的页面文字、图片以及相关文件。您可以点击下方的复制链接按钮复制链接，并使用浏览器访问对应网站。",
          ],
        },
        {
          tag: "List",
          header: false,
          content: [{ text: "资源地址", button: "resource" }],
        },
        { tag: "title", text: "学习资源" },
        {
          tag: "text",
          style: "text-indent: 1.5em;",
          text: [
            "目前，Mr.Hope 正在发起学习资源共享。你可以提供你所在专业的学习资料来帮助 Mr.Hope 扩充资料库。您可以点击下方的复制链接按钮复制链接，并使用浏览器访问对应网站。",
          ],
        },
        {
          tag: "List",
          header: false,
          content: [
            { text: "公共课程", button: "public" },
            { text: "物理学", button: "physics" },
          ],
        },
        { tag: "footer" },
      ],
      shareable: true,
      from: "返回",
    },
  },

  onLoad(options) {
    this.setData({
      color: getColor(),
      "page.action": options.action,
      "page.from": options.from || this.data.page.from,
      "page.statusBarHeight": globalData.info.statusBarHeight,
    });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("resource");
  },

  onPageScroll(event) {
    changeNav(event, this);
  },

  onShareAppMessage: () => ({
    title: "小程序资源",
    path: "/settings/resource/resource?action=redirect&from=主页",
  }),

  onShareTimeline: () => ({ title: "小程序资源" }),

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

  /** 复制资源地址到剪切板 */
  resource() {
    this.copy("https://github.com/Hope-Studio/innenu-res");
  },

  /** 复制公共课程地址到剪切板 */
  public() {
    this.copy("https://github.com/nenuyouth/publicCourse");
  },

  /** 复制物理学课程地址到剪切板 */
  physics() {
    this.copy("https://github.com/nenuyouth/physics");
  },

  /** 复制内容到剪切板 */
  copy(url: string) {
    wx.setClipboardData({
      data: url,
      success: () => {
        modal("复制成功", "链接地址已经成功复制至剪切板，请打开浏览器粘贴跳转");
      },
    });
  },

  /** 重定向到主页 */
  redirect() {
    console.log("redirect");
    this.$launch("main");
  },
});
