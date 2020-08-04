import $register = require("wxpage");
import { changeNav, setPage } from "../../utils/page";

$register("cal", {
  data: {
    page: {
      title: "绩点计算(beta)",
      from: "功能大厅",
      content: [{ tag: "title", text: "绩点计算器" }],
    },
    grade: [] as any[],
    // 在这里必须定义一个grade的空数组
    totalCredit: 0,
    gradePointAverage: 0,
    editText: "编辑",
    display: false,
  },

  onLoad(option: any) {
    setPage({ option, ctx: this });
  },

  onPageScroll(event) {
    changeNav(event, this);
  },

  addNew() {
    const { length } = this.data.grade;
    // 获取grade内包含的个数，以便生成新的id
    const gradeNew = this.data.grade.concat({
      id: length,
      course: null,
      courseFocus: false,
      grade: null,
      gradeFocus: false,
      credit: null,
      creditFocus: false,
    });

    // 向grade最后插入一个新元素
    this.setData({ grade: gradeNew });
    // 对data赋值
  },

  input(event: WXEvent.Input) {
    console.log(event);
    const { grade } = this.data;

    /*
     * 获取grade
     * console.log(Number(e.detail.value));
     */
    const { id } = event.currentTarget.dataset;
    const target = event.currentTarget.dataset.class;

    // 获取正在输入的输入框id  获取正在输入对象
    grade[id][`${target}Focus`] = true;
    console.log(event.detail.value.length);

    /*
     * If (e.detail.value.length < e.currentTarget.dataset.maxLength) {
     *   grade[id][target + 'Focus'] = true;
     * } else {
     *   grade[id][target + 'Focus'] = false;
     * }
     */
    if (Number(event.detail.value))
      grade[id][target] = Number(event.detail.value);
    // 如果value可以转换为number，得到对应课程的grade数组并对其中的相应对象赋值数字
    else grade[id][target] = event.detail.value;
    // 如果value无法转换为number，得到对应课程的grade数组并对其中的相应对象赋值字符
    console.log(grade);
    this.setData({ grade });
    // 将新值写回data中
  },

  next(event: WXEvent.Touch) {
    const { grade } = this.data;
    const { id } = event.currentTarget.dataset;

    grade[id].gradeFocus = true;
    this.setData({ grade });
  },

  edit() {
    const editText = this.data.display ? "编辑" : "完成";

    this.setData({
      display: !this.data.display,
      editText,
    });
  },

  sort(event: WXEvent.Touch) {
    console.log(event);
  },

  remove(event: any) {
    console.log(event);
    const currentID = event.target.id[event.target.id.length - 1];
    const { grade } = this.data;

    console.log(`currentID是${currentID};grade是${grade}`);
    grade.splice(currentID, 1);
    console.log(`新grade是${grade}`);
    for (let i = 0; i < grade.length; i++) grade[i].id = i;

    // 重新设定id
    this.setData({ grade });
  },

  calculate() {
    const courseNumber = this.data.grade.length;

    // 获得课程数
    console.log(`课程数是${courseNumber}`);

    let totalCredit = 0;
    let totalGradeCal = 0;
    let flunkingCredit = 0;
    let flunkingGradeCal = 0;

    for (let i = 0; i < courseNumber; i++) {
      const { grade } = this.data.grade[i];
      const { credit } = this.data.grade[i];

      if (grade !== 0 && grade && credit)
        if (grade < 60) {
          /*
           * 判断grade和credit是否均有值
           * 单独列出不及格的学分和成绩,且只有大于50分绩点为正值才计算。
           */
          flunkingCredit = credit + flunkingCredit;
          if (grade > 50)
            flunkingGradeCal = ((grade - 50) / 10) * credit + flunkingGradeCal;
        } else {
          // 及格的学分和成绩
          totalCredit = credit + totalCredit;
          totalGradeCal = ((grade - 50) / 10) * credit + totalGradeCal;
        }
    }
    console.log(`总学分是${totalCredit}`);
    console.log(`总计算是${totalGradeCal}`);
    console.log(`挂科学分是${flunkingCredit}`);
    console.log(`总挂科计算是${flunkingGradeCal}`);
    if (Number(flunkingCredit) === 0) {
      console.log("都及格了");
      // 如果都及格什么也不做
      this.setData({
        totalCredit,
        gradePointAverage: totalGradeCal / totalCredit,
      });
      console.log(totalCredit);
      console.log(totalGradeCal / totalCredit);
      // 向data赋值计算结果
    } else
      wx.showModal({
        // 弹窗让用户选择
        title: "请选择计算方式",
        content: "平均绩点是否包含未达到60的成绩？\n★为建议项",
        cancelText: "包含",
        cancelColor: "#ff0000",
        confirmText: "排除★",
        success: (res) => {
          if (res.cancel) {
            // 包含不及格成绩
            totalCredit += flunkingCredit;
            totalGradeCal += flunkingGradeCal;
            // 写入不及格学分与成绩计算
            console.log("不及格学分成绩被计入");
            console.log(`新总学分是${totalCredit}`);
            console.log(`新总计算是${totalGradeCal}`);
          } else if (res.confirm) console.log("都及格了");

          /*
           * 不包含不及格成绩，什么都不做
           * console.log(totalCredit)
           * console.log(totalGradeCal / totalCredit)
           */
          // 向data赋值计算结果
          this.setData({
            totalCredit,
            gradePointAverage: totalGradeCal / totalCredit,
          });
        },
      });
  },
});
