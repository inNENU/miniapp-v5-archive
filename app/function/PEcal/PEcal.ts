import $register = require("wxpage");
import { changeNav, popNotice, setPage } from "../../utils/page";
import { AppOption } from "../../app";
import { getJSON } from "../../utils/file";
const { globalData } = getApp<AppOption>();

/** 分数段设置 */
const gradeLevels = [
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

// 生成长跑选择器
for (let i = 0; i < 60; i += 1) longRunPicker[1].push(`${i}秒`);

interface PEScore {
  /** BMI 分值 */
  bmi: number;
  /** 肺活量分值 */
  vitalCapacity: number;
  /** 仰卧起坐分值 */
  sitAndReach: number;
  /** 立定跳远分值 */
  standingLongJump: number;
  /** 短跑分值 */
  shortRun: number;
  /** 长跑分值 */
  longRun: number;
  /** 特殊项目分值 */
  special: number;
  /** 及格分值 */
  passScore: number;
}

$register("PEcal", {
  data: {
    theme: globalData.theme,
    page: { title: "体测计算器", grey: true, from: "功能大厅" },

    /** 性别选择器 */
    gender: {
      picker: ["男", "女"],
      value: ["male", "female"],
    },

    /** 年级选择器 */
    grade: {
      picker: ["大一", "大二", "大三", "大四"],
      value: ["low", "low", "high", "high"],
    },

    /** 输入列表 */
    list: [
      { text: "身高", unit: "厘米", type: "digit", id: "height" },
      { text: "体重", unit: "千克", type: "digit", id: "weight" },
      { text: "坐位体前屈", unit: "厘米", type: "digit", id: "sitAndReach" },
      { text: "肺活量", unit: "毫升", type: "number", id: "vitalCapacity" },
      { text: "立定跳远", unit: "米", type: "digit", id: "standingLongJump" },
      { text: "50米跑", unit: "秒", type: "digit", id: "shortRun" },
    ],

    /** 长跑文字 */
    longRun: { text: "800米跑" },

    /** 特殊项目文字 */
    special: { text: "仰卧起坐", unit: "个", id: "situp" },

    /** 体育成绩 */
    peScore: {},

    /** 最终成绩 */
    result: {} as Record<string, any>,

    /** 弹窗配置 */
    popupConfig: { title: "体测成绩", cancel: false },

    /** 成绩表 */
    scoreList: [
      { text: "BMI", id: "bmi" },
      { text: "坐位体前屈", id: "sitAndReach" },
      { text: "肺活量", id: "vitalCapacity" },
      { text: "立定跳远", id: "standingLongJump" },
      { text: "50米跑", id: "shortRun" },
    ],
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
      this.setData({ "nav.action": "redirect", "nav.from": "主页" });

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

  /** 性别切换 */
  genderChange({ detail }: WXEvent.PickerChange) {
    const index = Number(detail.value);
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

  /** 年级切换 */
  gradeChange({ detail }: WXEvent.PickerChange) {
    const index = Number(detail.value);

    // 设置年级
    this.setData({
      "grade.index": index,
      "result.grade": this.data.grade.value[index],
    });
    wx.setStorageSync("grade", index);
  },

  /** 输入框聚焦 */
  focus(event: WXEvent.InputFocus) {
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

  input({ currentTarget, detail }: WXEvent.Input) {
    const project = currentTarget.id;

    this.setData({ [`result.${project}`]: detail.value });
  },

  blur() {
    this.setData({ "input.status": false });
  },

  /** 长跑选择器设置 */
  longRunHandler({ detail }: WXEvent.PickerChange) {
    const { value } = detail;

    // 设置显示数据
    this.setData({
      "longRun.value": `${longRunPicker[0][value[0] as number]} ${
        longRunPicker[1][value[1] as number]
      }`,
      "result.longRun": ((value[0] as number) + 2) * 60 + (value[1] as number),
    });
  },

  /** 计算 BMI */
  getBMI(result: Record<string, any>): [number, number] {
    const bmiResult =
      Math.round((result.weight * 100000) / result.height / result.height) / 10;

    // 计算 BMI 状态与分值
    const [state, bmi] =
      result.gender === "male"
        ? bmiResult <= 17.8
          ? ["低体重", 80]
          : bmiResult >= 28
          ? ["肥胖", 60]
          : bmiResult >= 24
          ? ["超重", 80]
          : ["正常", 100]
        : bmiResult <= 17.1
        ? ["低体重", 80]
        : bmiResult >= 28
        ? ["肥胖", 60]
        : bmiResult >= 24
        ? ["超重", 80]
        : ["正常", 100];

    // 计算及格分数
    const passScore =
      result.grade === "Low"
        ? bmiResult <= 28
          ? 60
          : 60 - Math.ceil(bmiResult - 28) * 2
        : 50;

    this.setData({ bmi: { score: bmiResult, state } });

    return [bmi, passScore];
  },

  /** 获得最终成绩 */
  getResult(result: Record<string, any>, callback: (peScore: PEScore) => void) {
    const { length } = gradeLevels;
    const peScore: PEScore = {
      bmi: 0,
      vitalCapacity: 0,
      sitAndReach: 0,
      standingLongJump: 0,
      shortRun: 0,
      longRun: 0,
      special: 0,
      passScore: 60,
    };

    // 可以计算 BMI
    if (result.height && result.weight)
      [peScore.bmi, peScore.passScore] = this.getBMI(result);

    // 读取相应配置文件
    getJSON({
      path: `function/PEcal/${result.gender}-${result.grade}`,
      url: `resource/function/PEcal/${result.gender}-${result.grade}`,
      success: (config: any) => {
        // 以下三项越高越好，进行计算
        (["vitalCapacity", "sitAndReach", "standingLongJump"] as (
          | "vitalCapacity"
          | "sitAndReach"
          | "standingLongJump"
        )[]).forEach((x) => {
          if (result[x] && Number(result[x])) {
            for (let i = 0; i < length; i++)
              if (result[x] <= config[x][i]) {
                peScore[x] = gradeLevels[i];
                break;
              } else if (i === length - 1) peScore[x] = gradeLevels[i];
          } else peScore[x] = 0;
        });

        // 以下两项越低越好
        (["shortRun", "longRun"] as ("shortRun" | "longRun")[]).forEach((x) => {
          if (result[x]) {
            for (let i = 0; i < length; i += 1)
              if (result[x] >= config[x][i]) {
                peScore[x] = gradeLevels[i];
                break;
              } else if (i === length - 1) peScore[x] = gradeLevels[i];
          } else peScore[x] = 0;
        });

        // 计算特别类项目分数
        const specialScore = result.gender === "male" ? "chinning" : "situp";

        if (result[specialScore] && Number(result[specialScore])) {
          for (let i = 0; i < length; i += 1)
            if (
              config[specialScore][i] !== "" &&
              result[specialScore] <= config[specialScore][i]
            ) {
              peScore.special = gradeLevels[i];
              break;
            } else if (i === length - 1) peScore.special = gradeLevels[i];
        } else peScore.special = 0;

        // TODO:计算加分

        console.info("成绩为", peScore);

        callback(peScore);
      },
    });
  },

  /** 计算最终结果 */
  calculate() {
    const { result } = this.data;

    wx.showLoading({ title: "计算中...", mask: true });
    console.info("输入结果为: ", result);

    // 可以计算
    if (result.gender && result.grade) {
      this.getResult(result, (peScore) => {
        // 计算最终成绩
        const finalScore =
          Math.round(
            peScore.vitalCapacity * 15 +
              peScore.shortRun * 20 +
              peScore.sitAndReach * 10 +
              peScore.standingLongJump * 10 +
              peScore.special * 10 +
              peScore.longRun * 20 +
              peScore.bmi * 15
          ) / 100;

        this.setData({
          peScore: peScore,
          showScore: true,
          pe: {
            score: finalScore,
            state: finalScore >= peScore.passScore ? "及格" : "不及格",
          },
        });
      });

      wx.hideLoading();
    } else {
      wx.hideLoading();
      wx.showToast({
        title: "请选择性别年级",
        duration: 2500,
        image: "./close.png",
      });
    }
  },

  navigate() {
    this.$route("/module/page?from=体测计算器&id=guide/exam/pe-test/index");
  },

  close() {
    this.setData({ showScore: false });
  },

  redirect() {
    this.$launch("main");
  },
});
