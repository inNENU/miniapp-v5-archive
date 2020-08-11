/* 东师介绍 */
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
      title: "东师介绍",
      action: false,
      statusBarHeight: globalData.info.statusBarHeight,
    },

    page: {
      title: "东师介绍",
      grey: true,
      hidden: true,
      content: [
        {
          tag: "grid",
          header: "学院介绍",
          content: [
            {
              text: "教育学部",
              color: "blue",
              name: "Education",
              icon: "/icon/intro/education.svg",
              path: "intro/school/education/index",
            },
            {
              text: "心理学院",
              color: "orange",
              name: "Psychology",
              icon: "/icon/intro/psychology.svg",
              path: "intro/school/psychology/index",
            },
            {
              text: "政法学院",
              color: "red",
              name: "Politics",
              icon: "/icon/intro/politics.svg",
              path: "intro/school/politics/index",
            },
            {
              text: "经济与管理学院",
              color: "purple",
              name: "Economy",
              icon: "/icon/intro/economy.svg",
              path: "intro/school/economy/index",
            },
            {
              text: "文学院",
              color: "cyan",
              name: "Chinese",
              icon: "/icon/intro/chinese.svg",
              path: "intro/school/chinese/index",
            },
            {
              text: "历史文化学院",
              color: "olive",
              name: "History",
              icon: "/icon/intro/history.svg",
              path: "intro/school/history/index",
            },
            {
              text: "外国语学院",
              color: "mauve",
              name: "Foreign",
              icon: "/icon/intro/foreign.svg",
              path: "intro/school/foreign/index",
            },
            {
              text: "音乐学院",
              color: "blue",
              name: "Music",
              icon: "/icon/intro/music.svg",
              path: "intro/school/music/index",
            },
            {
              text: "美术学院",
              color: "orange",
              name: "Art",
              icon: "/icon/intro/art.svg",
              path: "intro/school/art/index",
            },
            {
              text: "马克思主义学部",
              color: "red",
              name: "Marx",
              icon: "/icon/intro/marx.svg",
              path: "intro/school/marx/index",
            },
            {
              text: "数学与统计学院",
              color: "purple",
              name: "Math",
              icon: "/icon/intro/math.svg",
              path: "intro/school/math/index",
            },
            {
              text: "信息科学与技术学院",
              color: "cyan",
              name: "Politic",
              icon: "/icon/intro/ist.svg",
              path: "intro/school/ist/index",
            },
            {
              text: "物理学院",
              color: "olive",
              name: "Physics",
              icon: "/icon/intro/physics.svg",
              path: "intro/school/physics/index",
            },
            {
              text: "化学学院",
              color: "mauve",
              name: "Chemistry",
              icon: "/icon/intro/chemistry.svg",
              path: "intro/school/chemistry/index",
            },
            {
              text: "生命科学学院",
              color: "blue",
              name: "Biology",
              icon: "/icon/intro/biology.svg",
              path: "intro/school/biology/index",
            },
            {
              text: "地理科学学院",
              color: "orange",
              name: "Geology",
              icon: "/icon/intro/geology.svg",
              path: "intro/school/geology/index",
            },
            {
              text: "环境学院",
              color: "red",
              name: "Env",
              icon: "/icon/intro/environment.svg",
              path: "intro/school/environment/index",
            },
            {
              text: "体育学院",
              color: "purple",
              name: "Math",
              icon: "/icon/intro/pe.svg",
              path: "intro/school/pe/index",
            },
            {
              text: "传媒科学学院",
              color: "cyan",
              name: "Media",
              icon: "/icon/intro/media.svg",
              path: "intro/school/media/index",
            },
            {
              text: "国际汉学院",
              color: "olive",
              name: "Internation",
              icon: "/icon/guide/school.svg",
              path: "intro/school/physics/index",
            },
            {
              text: "纽瓦克学院",
              color: "mauve",
              name: "Newark",
              icon: "/icon/guide/school.svg",
              path: "intro/school/newark/index",
            },
          ],
        },
        {
          tag: "grid",
          header: "机构介绍",
          content: [
            {
              text: "党委学生工作部",
              color: "blue",
              name: "Student",
              icon: "/icon/intro/student.svg",
              path: "intro/apartment/student",
            },
            {
              text: "学生心理健康教育中心",
              color: "orange",
              name: "Psychology",
              icon: "/icon/intro/psychology.svg",
              path: "intro/apartment/psychology",
            },
            {
              text: "学校办公室",
              color: "red",
              name: "Office",
              icon: "/icon/intro/office.svg",
              path: "intro/apartment/office",
            },
            {
              text: "校团委",
              color: "purple",
              name: "League",
              icon: "/icon/intro/league.svg",
              path: "intro/apartment/youth-league",
            },
            {
              text: "后勤管理处",
              color: "cyan",
              name: "Logistics",
              icon: "/icon/intro/wrench.svg",
              path: "intro/apartment/logistics",
            },
            {
              text: "校医院",
              color: "olive",
              name: "Hospital",
              icon: "/icon/intro/hospital.svg",
              path: "intro/apartment/hospital/index",
            },
            {
              text: "保卫科",
              color: "mauve",
              name: "Defend",
              icon: "/icon/intro/shield.svg",
              path: "intro/apartment/defend",
            },
          ],
          footer: " ",
        },
      ],
    },
  },

  onPreload(res) {
    this.$put(
      "intro",
      resolvePage(res, wx.getStorageSync("intro") || this.data.page)
    );
    console.info(
      `东师介绍预加载用时${new Date().getTime() - globalData.date}ms`
    );
  },

  onLoad() {
    setPage(
      { option: { id: "intro" }, ctx: this },
      this.$take("intro") || this.data.page
    );
    popNotice("guide");
    checkResUpdate("intro", "580K");
  },

  onShow() {
    refreshPage("intro", this, globalData);
    popNotice("intro");
  },

  onReady() {
    // 注册事件监听器
    this.$on("theme", (theme: string) => {
      this.setData({ theme });
    });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);
  },

  onPullDownRefresh() {
    refreshPage("intro", this, globalData);
    checkResUpdate("intro", "580K");
    wx.stopPullDownRefresh();
  },

  onPageScroll(event) {
    changeNav(event, this, "nav");
  },

  onShareAppMessage: () => ({ title: "东师介绍", path: "/page/intro/intro" }),

  onShareTimeline: () => ({ title: "东师介绍" }),

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
