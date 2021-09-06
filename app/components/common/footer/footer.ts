import { $Component } from "@mptool/enhance";
import { server } from "../../../utils/config";

import type { PropType } from "@mptool/enhance";
import type { AppOption } from "../../../app";
import type { FooterComponentOptions } from "../../../../typings";

const {
  // 获得当前小程序ID
  globalData: { appID },
} = getApp<AppOption>();

$Component({
  properties: {
    /** 页脚配置 */
    config: {
      type: Object as PropType<FooterComponentOptions>,
      required: true,
    },
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
