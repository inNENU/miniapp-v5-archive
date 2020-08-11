import { AppOption } from "../../../app";
import { server } from "../../../utils/config";
const {
  globalData: { appID },
} = getApp<AppOption>(); // 获得当前小程序ID

Component({
  properties: {
    /** 页脚配置 */
    config: { type: Object },
  },

  data: {
    icon: `${server}img/${
      appID === "wx9ce37d9662499df3" ? "logo" : "inNENU"
    }.png`,
    text:
      appID === "wx9ce37d9662499df3"
        ? "走出半生，归来仍是——东师青年"
        : "in 东师，就用 in 东师",
  },
});
