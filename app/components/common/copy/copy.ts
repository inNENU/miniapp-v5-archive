import { CopyComponentConfig } from "../../../../typings";

Component<{ config: CopyComponentConfig }>({
  properties: {
    /** 配置 */
    config: { type: Object },
  },

  methods: {
    copy(): void {
      wx.setClipboardData({
        data: this.data.config.text,
        success: () => console.log("复制成功"),
      });
    },
  },
});
