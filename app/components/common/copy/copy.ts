import { $Component } from "@mptool/enhance";
import type { PropType } from "@mptool/enhance";
import type { CopyComponentOptions } from "../../../../typings";

$Component({
  properties: {
    /** 配置 */
    config: {
      type: Object as PropType<CopyComponentOptions>,
      required: true,
    },
  },

  methods: {
    copy(): void {
      const { text } = this.data.config;

      wx.setClipboardData({
        data: text,
        success: () => console.log(`Copied '${text}'`),
      });
    },
  },

  options: {
    styleIsolation: "shared",
  },
});
