/* 关于 */

import $register = require("wxpage");
import { changeNav, popNotice, resolvePage, setPage } from "../../utils/page";
import { requestJSON, tip } from "../../utils/wx";
import { AppOption } from "../../app";
import { PageConfig, AdvancedListComponentConfig } from "../../../typings";
const { globalData } = getApp<AppOption>();
let clickNumber = 0;
let developMode = false;

$register("about", {
  data: {
    theme: globalData.theme,
    darkmode: globalData.darkmode,
    page: {
      title: "关于",
      desc: `当前版本：${globalData.version}`,
      grey: true,
      feedback: true,
      content: [
        {
          tag: "List",
          header: "版本号",
          content: [
            { text: globalData.version, button: "debugMode" },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { text: "启用测试功能", swiKey: "test", Switch: "testSwitch" },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { text: "调试开关", swiKey: "debugMode", Switch: "debugSwitch" },
            { text: "退出开发者模式", button: "debugMode" },
          ],
        },
        {
          tag: "list",
          header: "工作室与开发者介绍",
          content: [
            { text: "   小程序全部内容均由Hope Studio独立开发。" },
            { text: "Hope Studio介绍", aim: "MrHope0" },
            { text: "Mr.Hope个人介绍", aim: "MrHope1" },
            { text: "致谢名单", aim: "MrHope4" },
          ],
        },
        {
          tag: "list",
          header: "小程序介绍",
          content: [
            { text: "开发者访谈", aim: "MrHope3" },
            { text: "小程序功能太少?", aim: "MrHope2" },
          ],
        },
      ],
    },
  },

  onNavigate(res) {
    const { page } = this.data;

    // 读取开发者模式并对页面显示做相应改变
    developMode = wx.getStorageSync("developMode");
    if (!developMode)
      (page.content[0] as AdvancedListComponentConfig).content.forEach(
        (x, y) => {
          x.hidden = y !== 0;
        }
      );

    resolvePage(res, page as PageConfig);
  },

  onLoad(option: any) {
    if (globalData.page.id === "关于") setPage({ option, ctx: this });
    else {
      const { page } = this.data;

      // 读取开发者模式并对页面显示做相应改变
      developMode = wx.getStorageSync("developMode");
      if (!developMode)
        (page.content[0].content as any[]).forEach((x, y) => {
          x.hidden = y !== 0;
        });

      setPage({ option: { id: "about" }, ctx: this }, page as PageConfig);
    }

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("about");
  },

  onReady() {
    // 读取在线文件更新页面显示
    requestJSON(
      `resource/config/${globalData.appID}/${globalData.version}/about`,
      (data: any) => {
        setPage(
          { option: { id: "关于" }, ctx: this },
          {
            ...this.data.page,
            content: this.data.page.content
              .slice(0, 1)
              .concat(data) as PageConfig["content"],
          }
        );
      }
    );
  },

  onPageScroll(event) {
    changeNav(event, this);
  },

  onShareAppMessage: () => ({
    title: "关于",
    path: "/settings/about/about",
    imageUrl: `https://v3.mp.innenu.com/img/${
      globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "inNENU"
    }Share.jpg`,
  }),

  onShareTimeline: () => ({ title: "关于" }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 列表控制函数 */
  list({ detail }: any) {
    if (detail.event)
      this[detail.event as "debugSwitch" | "testSwitch"](detail.value);
  },

  /** 点击版本号时触发的函数 */
  debugMode() {
    // 关闭开发者模式
    if (developMode) {
      wx.setStorageSync("developMode", false);
      (this.data.page.content[0].content as any[]).forEach((x, y) => {
        x.hidden = y !== 0;
      });
      this.setData({ page: this.data.page });
      clickNumber = 0;
      developMode = false;

      // 不做任何操作
    } else if (clickNumber < 5) clickNumber += 1;
    // 提示还有几次点击即可启用开发者模式
    else if (clickNumber < 10) {
      tip(`再点击${10 - clickNumber}次即可启用开发者模式`);
      clickNumber += 1;

      // 启用开发者模式
    } else
      this.setData({ debug: true }, () => {
        wx.nextTick(() => {
          this.setData({ focus: true });
        });
      });
  },

  /**
   * 输入密码时出发的函数
   * 用于判断密码是否正确并启用开发者模式
   *
   * @param event 输入事件
   */
  password(event: WXEvent.Input) {
    if (event.detail.value.length === 7) {
      // 密码正确
      if (event.detail.value === "5201314") {
        tip("已启用开发者模式");
        (this.data.page.content[0].content as any[]).forEach((x) => {
          x.hidden = false;
        });
        this.setData({ page: this.data.page, debug: false });
        wx.setStorageSync("developMode", true);
        developMode = true;
      } else {
        // 密码错误
        wx.showToast({
          title: "密码错误",
          icon: "none",
          duration: 1000,
          image: "/icon/close.png",
        });
        this.setData({ debug: false });
      }

      // 清空输入框
      event.detail.value = "";
    }

    return event.detail.value;
  },

  /** 取消输入 */
  cancelInput() {
    this.setData({ debug: false });
  },

  /**
   * 控制调试开关
   *
   * @param value 开关状态
   */
  debugSwitch(value: boolean) {
    (this.data.page.content[0].content as any[])[2].status = value;
    this.setData({ page: this.data.page });
    wx.setStorageSync("debugMode", value);

    if (value) wx.setEnableDebug({ enableDebug: true });
    else wx.setEnableDebug({ enableDebug: false });
  },

  /**
   * 控制测试功能开关
   *
   * @param value 开关状态
   */
  testSwitch(value: boolean) {
    tip(`已${value ? "启用" : "关闭"}测试功能`);
  },

  /** 重定向到主页 */
  redirect() {
    this.$launch("main");
  },
});
