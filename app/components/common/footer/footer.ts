import { $Component } from "@mptool/enhance";
import { modal } from "../../../utils/wx";

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
    text:
      appID === "wx9ce37d9662499df3"
        ? "走出半生，归来仍是——东师青年"
        : "in 东师，就用 in 东师",
  },

  methods: {
    copyCite({
      currentTarget,
    }: WechatMiniprogram.TouchEvent<
      // eslint-disable-next-line @typescript-eslint/ban-types
      {},
      // eslint-disable-next-line @typescript-eslint/ban-types
      {},
      { index: number }
    >) {
      wx.setClipboardData({
        data: this.data.config.cite![currentTarget.dataset.index],
        success: () => {
          modal(
            "无法直接打开",
            "小程序无法直接打开网页，链接地址已复制至剪切板。请打开浏览器粘贴查看"
          );
        },
      });
    },
  },
});
