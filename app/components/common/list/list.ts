import $register = require("wxpage");

$register.C({
  properties: {
    /** 普通列表配置 */
    config: Object,
  },

  methods: {
    navigate({ currentTarget }: WXEvent.Touch): void {
      this.$route(currentTarget.dataset.url);
    },
  },
});
