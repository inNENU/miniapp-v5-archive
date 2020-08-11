/* 招生报考 */
import $register = require("wxpage");
import { changeNav, popNotice, resolvePage, setPage } from "../../utils/page";
import { checkResUpdate, refreshPage } from "../../utils/tab";
import { searching } from "../../utils/search";
import { AppOption } from "../../app";
const { globalData } = getApp<AppOption>();

$register("guide", {
  data: {
    theme: globalData.theme,

    /** 候选词 */
    words: [] as string[],

    /** 自定义导航栏配置 */
    nav: {
      title: "招生报考",
      action: false,
      statusBarHeight: globalData.info.statusBarHeight,
    },

    page: {
      title: "招生报考",
      grey: true,
      hidden: true,
      content: [
        {
          tag: "grid",
          header: "学院列表",
          content: [
            {
              text: "教育学部",
              color: "red",
              name: "Edu",
              icon: "/icon/tabPage/degree.svg",
              path: "enroll/school/check/index",
            },
            {
              text: "FAQ",
              color: "orange",
              name: "FAQ",
              icon: "/icon/tabPage/faq.svg",
              path: "FAQ/index",
            },
          ],
        },
        {
          tag: "grid",
          header: "学在东师",
          content: [
            {
              text: "学位",
              color: "blue",
              name: "Course",
              icon: "/icon/tabPage/degree.svg",
              path: "degree/index",
            },
            {
              text: "课程",
              color: "orange",
              name: "Course",
              icon: "/icon/tabPage/course.svg",
              path: "course/index",
            },
            {
              text: "学习",
              color: "red",
              name: "Study",
              icon: "/icon/tabPage/study.svg",
              path: "study/index",
            },
            {
              text: "选课",
              color: "purple",
              name: "Select",
              icon: "/icon/tabPage/select.svg",
              path: "select/index",
            },
            {
              text: "图书馆",
              color: "cyan",
              name: "Library",
              icon: "/icon/tabPage/library.svg",
              path: "library/index",
            },
            {
              text: "考试",
              color: "olive",
              name: "Exam",
              icon: "/icon/tabPage/test.svg",
              path: "exam/index",
            },
          ],
        },
        {
          tag: "grid",
          header: "行在东师",
          content: [
            {
              text: "寝室",
              color: "blue",
              name: "Dorm",
              icon: "/icon/tabPage/dorm.svg",
              path: "dorm/index",
            },
            {
              text: "食堂",
              color: "orange",
              name: "Dining",
              icon: "/icon/tabPage/dining.svg",
              path: "dining/index",
            },
            {
              text: "校园卡",
              color: "red",
              name: "Card",
              icon: "/icon/tabPage/card.svg",
              path: "card/index",
            },

            {
              text: "校园网",
              color: "purple",
              name: "Network",
              icon: "/icon/tabPage/network.svg",
              path: "network/index",
            },
            {
              text: "账户",
              color: "olive",
              name: "Account",
              icon: "/icon/tabPage/account.svg",
              path: "account/index",
            },
            {
              text: "生活",
              color: "mauve",
              name: "Life",
              icon: "/icon/tabPage/life.svg",
              path: "life/index",
            },
            {
              text: "SIM 卡",
              color: "blue",
              name: "SIM",
              icon: "/icon/tabPage/sim.svg",
              path: "sim/index",
            },
            {
              text: "资助",
              color: "orange",
              name: "Subsidize",
              icon: "/icon/tabPage/subsidize.svg",
              path: "subsidize/index",
            },
          ],
        },
        {
          tag: "grid",
          header: "乐在东师",
          content: [
            {
              text: "学生组织",
              color: "blue",
              name: "Orgnazation",
              icon: "/icon/tabPage/studentOrg.svg",
              path: "organization/index",
            },
            {
              text: "社团",
              color: "orange",
              name: "Association",
              icon: "/icon/tabPage/association.svg",
              path: "association/index",
            },
            {
              text: "交通",
              color: "red",
              name: "Traffic",
              icon: "/icon/tabPage/traffic.svg",
              path: "traffic/index",
            },
            {
              text: "吃喝玩乐",
              color: "purple",
              name: "Nearby",
              icon: "/icon/tabPage/nearby.svg",
              path: "life/nearby/index",
            },
          ],
        },
        {
          tag: "grid",
          header: "关于东师",
          content: [
            {
              text: "学校概况",
              color: "red",
              name: "Description",
              icon: "/icon/tabPage/about.svg",
              path: "about/index",
            },
            {
              text: "学院介绍",
              color: "orange",
              name: "School",
              icon: "/icon/tabPage/school.svg",
              path: "school/index",
            },
            {
              text: "学校机构",
              color: "blue",
              name: "Apartment",
              icon: "/icon/tabPage/apartment.svg",
              path: "apartment/index",
            },
          ],
          footer: " ",
        },
      ],
    },
  },

  onPreload(res) {
    this.$put(
      "guide",
      resolvePage(res, wx.getStorageSync("guide") || this.data.page)
    );
    console.info(
      `招生报考预加载用时${new Date().getTime() - globalData.date}ms`
    );
  },

  onLoad() {
    setPage(
      { option: { id: "guide" }, ctx: this },
      this.$take("guide") || this.data.page
    );
    popNotice("guide");
    checkResUpdate("guide", "580K");
  },

  onShow() {
    refreshPage("guide", this, globalData);
    popNotice("guide");
  },

  onReady() {
    // 注册事件监听器
    this.$on("theme", (theme: string) => {
      this.setData({ theme });
    });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);
  },

  onPullDownRefresh() {
    refreshPage("guide", this, globalData);
    checkResUpdate("guide", "580K");
    wx.stopPullDownRefresh();
  },

  onPageScroll(event) {
    changeNav(event, this, "nav");
  },

  onShareAppMessage: () => ({ title: "招生报考", path: "/page/enroll/enroll" }),

  onShareTimeline: () => ({ title: "招生报考" }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /**
   * 在搜索框中输入时触发的函数
   *
   * @param value 输入的搜索词
   */
  searching({ detail: { value } }: WXEvent.Input) {
    searching(value, (words) => this.setData({ words }));
  },

  /**
   * 跳转到搜索页面
   *
   * @param value 输入的搜索词
   */
  search({ detail }: WXEvent.Input) {
    this.$route(`search?words=${detail.value}`);
  },
});
