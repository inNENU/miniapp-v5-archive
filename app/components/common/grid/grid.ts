import $register = require("wxpage");

$register.C({
  properties: {
    /** 网格组件配置 */
    config: { type: Object, value: { aim: "" } },
  },

  methods: {
    navigate({ currentTarget }: WXEvent.Touch): void {
      this.$route(currentTarget.dataset.url);
    },
  },
});
