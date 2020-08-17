/* eslint-disable @typescript-eslint/naming-convention */
import $register = require("wxpage");
import { changeNav, popNotice, setPage } from "../../utils/page";
import { AppOption } from "../../app";
import { getJSON } from "../../utils/file";
const { globalData } = getApp<AppOption>();

const hash = [
  10,
  20,
  30,
  40,
  50,
  60,
  62,
  64,
  66,
  68,
  70,
  72,
  74,
  76,
  78,
  80,
  85,
  90,
  95,
  100,
];
/** 特殊项目 */
const special = [
  { text: "引体向上", unit: "个", type: "number", id: "chinning" },
  { text: "仰卧起坐", unit: "个", type: "number", id: "situp" },
];
/** 长跑文字 */
const longRunText = ["1000米跑", "800米跑"];
/** 长跑选择器内容 */
const longRunPicker = [["2分", "3分", "4分", "5分", "6分", "7分"], []];

for (let i = 0; i < 60; i += 1) longRunPicker[1].push(`${i}秒`);

interface PEScore {
  BMI: number;
  vitalCapacity: number;
  sitAndReach: number;
  standingLongJump: number;
  shortRun: number;
  longRun: number;
  special: number;
  passScore: number;
  [props: string]: number;
}

$register("PEcal", {
  data: {
    theme: globalData.theme,
    page: {
      title: "体测计算器",
      grey: true,
      from: "功能大厅",
    },
    gender: {
      picker: ["男", "女"],
      value: ["male", "female"],
    },
    grade: {
      picker: ["大一", "大二", "大三", "大四"],
      value: ["Low", "Low", "High", "High"],
    },
    list: [
      { text: "身高", unit: "厘米", type: "digit", id: "height" },
      { text: "体重", unit: "千克", type: "digit", id: "weight" },
      { text: "坐位体前屈", unit: "厘米", type: "digit", id: "sitAndReach" },
      { text: "肺活量", unit: "毫升", type: "number", id: "vitalCapacity" },
      { text: "立定跳远", unit: "米", type: "digit", id: "standingLongJump" },
      { text: "50米跑", unit: "秒", type: "digit", id: "shortRun" },
    ],
    longRun: { text: "800米跑" },
    special: { text: "仰卧起坐", unit: "个", id: "situp" },
    PEscore: {},
    result: {} as Record<string, any>,
    scoreList: [
      { text: "BMI", id: "BMI" },
      { text: "坐位体前屈", id: "sitAndReach" },
      { text: "肺活量", id: "vitalCapacity" },
      { text: "立定跳远", id: "standingLongJump" },
      { text: "50米跑", id: "shortRun" },
    ],
    popupConfig: {
      title: "体测成绩",
      cancel: false,
    },
  },

  onLoad(option: any) {
    setPage({ option, ctx: this }, this.data.page);
    const genderIndex = wx.getStorageSync("gender");
    const gradeIndex = wx.getStorageSync("grade");

    this.setData({
      // 将用户上次选择的性别和年级载入

      ...(typeof genderIndex === "number"
        ? // 改变特别项目和长跑的名称
          {
            "gender.index": genderIndex,
            "longRun.text": genderIndex === 0 ? longRunText[0] : longRunText[1],
            special: genderIndex === 0 ? special[0] : special[1],
            "result.gender": this.data.gender.value[genderIndex],
          }
        : {}),

      ...(typeof gradeIndex === "number"
        ? // 写入年级
          {
            "grade.index": gradeIndex,
            "result.grade": this.data.grade.value[gradeIndex],
          }
        : {}),

      // 设置长跑选择器数据
      "longRun.picker": longRunPicker,
    });

    if (getCurrentPages().length === 1)
      this.setData({
        "nav.action": "redirect",
        "nav.from": "主页",
      });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    // 设置通知
    popNotice("PEcal");
  },

  onPageScroll(event) {
    changeNav(event, this);
  },

  onShareAppMessage: () => ({
    title: "体测计算器",
    path: "/function/PEcal/PEcal",
  }),

  onShareTimeline: () => ({ title: "体测计算器" }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /**
   * 性别切换
   *
   * @param event 选择器事件
   */
  genderChange(event: WXEvent.PickerChange) {
    const index = Number(event.detail.value);
    const gender = this.data.gender.value[index];

    wx.setStorageSync("gender", index);

    // 改变特别项目和长跑的名称
    this.setData({
      "result.gender": gender,
      "gender.index": index,
      special: gender === "male" ? special[0] : special[1],
      "longRun.text": gender === "male" ? longRunText[0] : longRunText[1],
    });
  },

  /**
   * 年级切换
   *
   * @param event 选择器事件
   */
  gradeChange(event: WXEvent.PickerChange) {
    const index = Number(event.detail.value);

    // 设置年级
    this.setData({
      "grade.index": index,
      "result.grade": this.data.grade.value[index],
    });
    wx.setStorageSync("grade", index);
  },

  /** 输入框聚焦 */
  focus(event: any) {
    const { id } = event.currentTarget;
    const query = wx.createSelectorQuery();

    this.setData({ input: { status: true, height: event.detail.height } });

    query.select(`#${id}`).boundingClientRect();
    query.selectViewport().fields({ size: true, scrollOffset: true });
    query.exec((res: any[]) => {
      if (
        (res[0].bottom as number) + (event.detail.height as number) >
        (res[1].height as number)
      )
        wx.pageScrollTo({
          scrollTop:
            (res[1].scrollTop as number) +
            (res[0].bottom as number) +
            (event.detail.height as number) -
            (res[1].height as number) +
            10,
        });
    });
  },

  input(event: WXEvent.Input) {
    const project = event.currentTarget.id;

    this.setData({ [`result.${project}`]: event.detail.value });
  },

  blur() {
    this.setData({ "input.status": false });
  },

  longRunHandler(event: WXEvent.PickerChange) {
    const { value } = event.detail;

    // 设置显示数据
    this.setData({
      "longRun.value": `${longRunPicker[0][value[0] as number]} ${
        longRunPicker[1][value[1] as number]
      }`,
      "result.longRun": ((value[0] as number) + 2) * 60 + (value[1] as number),
    });
  },

  /** 计算 BMI */
  getBMI(result: Record<string, any>, PEscore: PEScore) {
    // 可以计算BMI
    let state;
    const score =
      Math.round((result.weight * 100000) / result.height / result.height) / 10;

    // 计算BMI状态与分值
    [state, PEscore.BMI] =
      result.gender === "male"
        ? score <= 17.8
          ? ["低体重", 80]
          : score >= 28
          ? ["肥胖", 60]
          : score >= 24
          ? ["超重", 80]
          : ["正常", 100]
        : score <= 17.1
        ? ["低体重", 80]
        : score >= 28
        ? ["肥胖", 60]
        : score >= 24
        ? ["超重", 80]
        : ["正常", 100];

    // 计算及格分数
    PEscore.passScore =
      result.grade === "Low"
        ? score <= 28
          ? 60
          : 60 - Math.ceil(score - 28) * 2
        : 50;

    this.setData({ BMI: { score, state } });
  },

  getResult(
    result: Record<string, any>,
    PEscore: PEScore,
    callback: () => void
  ) {
    const { length } = hash;

    getJSON({
      path: `function/PEcal/${result.gender}${result.grade}`,
      url: `resource/function/PEcal/${result.gender}${result.grade}`,
      success: (config: any) => {
        // TODO: move to website

        /*
         * 读取相应配置文件
         * 转换长跑时间
         */
        config.longRun = config.longRun.map((element: string) => {
          const time = element.split("-");

          return Number(time[0]) * 60 + Number(time[1]);
        });

        // 转换立定跳远单位
        config.standingLongJump = config.standingLongJump.map(
          (element: number) => element / 100
        );

        // 以下三项越高越好，进行计算
        ["vitalCapacity", "sitAndReach", "standingLongJump"].forEach((x) => {
          if (result[x] && Number(result[x])) {
            for (let i = 0; i < length; i += 1)
              if (result[x] <= config[x][i]) {
                PEscore[x] = hash[i];
                break;
              } else if (i === length - 1) PEscore[x] = hash[i];
          } else PEscore[x] = 0;
        });

        // 以下两项越低越好
        ["shortRun", "longRun"].forEach((x) => {
          if (result[x]) {
            for (let i = 0; i < length; i += 1)
              if (result[x] >= config[x][i]) {
                PEscore[x] = hash[i];
                break;
              } else if (i === length - 1) PEscore[x] = hash[i];
          } else PEscore[x] = 0;
        });

        // 计算特别类项目分数
        const specialScore = result.gender === "male" ? "chinning" : "situp";

        if (result[specialScore] && Number(result[specialScore])) {
          for (let i = 0; i < length; i += 1)
            if (
              config[specialScore][i] !== "" &&
              result[specialScore] <= config[specialScore][i]
            ) {
              PEscore.special = hash[i];
              break;
            } else if (i === length - 1) PEscore.special = hash[i];
        } else PEscore.special = 0;

        // TODO:计算加分

        console.info("成绩为", PEscore);

        callback();
      },
    });
  },

  calculate() {
    const { result } = this.data;

    wx.showLoading({ title: "计算中...", mask: true });
    console.info("输入结果为: ", result);

    if (result.gender && result.grade) {
      // 可以计算
      const PEscore: PEScore = {
        BMI: 0,
        vitalCapacity: 0,
        sitAndReach: 0,
        standingLongJump: 0,
        shortRun: 0,
        longRun: 0,
        special: 0,
        passScore: 60,
      };

      if (result.height && result.weight) this.getBMI(result, PEscore);

      this.getResult(result, PEscore, () => {
        // 计算最终成绩
        const finalScore =
          Math.round(
            PEscore.vitalCapacity * 15 +
              PEscore.shortRun * 20 +
              PEscore.sitAndReach * 10 +
              PEscore.standingLongJump * 10 +
              PEscore.special * 10 +
              PEscore.longRun * 20 +
              PEscore.BMI * 15
          ) / 100;

        this.setData({
          PEscore,
          showScore: true,
          PE: {
            score: finalScore,
            state: finalScore >= PEscore.passScore ? "及格" : "不及格",
          },
        });
      });

      wx.hideLoading();
    } else {
      wx.hideLoading();
      wx.showToast({
        title: "请选择性别年级",
        icon: "none",
        duration: 2500,
        image: "/icon/close.png",
      });
    }
  },

  navigate() {
    this.$route(
      "/module/page?from=体测计算器&id=guide/exam/physical-examination/index"
    );
  },

  close() {
    this.setData({ showScore: false });
  },

  redirect() {
    this.$launch("main");
  },
});
