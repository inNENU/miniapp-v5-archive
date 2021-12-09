import { $Component } from "@mptool/enhance";
import type { PropType } from "@mptool/enhance";
import type { ActionComponentOptions } from "../../../../typings";

$Component({
  properties: {
    /** 配置 */
    config: {
      type: Object as PropType<ActionComponentOptions>,
      required: true,
    },
  },

  methods: {
    copy(): void {
      const { content } = this.data.config;

      wx.setClipboardData({
        data: content,
        success: () => console.log(`Copied '${content}'`),
      });
    },
  },
});
