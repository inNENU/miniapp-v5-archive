Component({
  properties: {
    /** 配置 */
    config: { type: Object as any },
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
