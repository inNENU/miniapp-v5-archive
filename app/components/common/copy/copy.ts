import { $Component } from "@mptool/enhance";
import type { PropType } from "@mptool/enhance";
import type { CopyComponentConfig } from "../../../../typings";

$Component({
  properties: {
    /** 配置 */
    config: {
      type: Object as PropType<CopyComponentConfig>,
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
});
