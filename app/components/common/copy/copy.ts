import { CopyComponentConfig } from "../../../../typings";

Component<{ config: CopyComponentConfig }>({
  properties: {
    /** 配置 */
    config: Object,
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
