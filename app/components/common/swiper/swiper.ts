Component({
  properties: { config: Object },

  methods: {
    change(event: WechatMiniprogram.SwiperChange): void {
      this.triggerEvent("change", event);
    },
    animation(event: WechatMiniprogram.SwiperAnimationFinish): void {
      this.triggerEvent("animation", event);
    },
  },
});
