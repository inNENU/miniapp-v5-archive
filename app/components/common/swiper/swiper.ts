Component({
  properties: { config: Object },

  methods: {
    change(event: WXEvent.SwiperChange): void {
      this.triggerEvent("change", event);
    },
    animation(event: WXEvent.SwiperAnimationFinish): void {
      this.triggerEvent("animation", event);
    },
  },
});
