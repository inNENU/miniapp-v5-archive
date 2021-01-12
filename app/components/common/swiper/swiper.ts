Component({
  properties: { config: Object },

  data: {
    /** 当前显示的图片序号 */
    current: 0,
  },

  methods: {
    change(event: WechatMiniprogram.SwiperChange): void {
      this.setData({ current: event.detail.current });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.triggerEvent("change", event as any);
    },
    animation(event: WechatMiniprogram.SwiperAnimationFinish): void {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.triggerEvent("animation", event as any);
    },
  },
});
