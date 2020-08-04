import $register = require("wxpage");

$register.C({
  properties: {
    /** 普通列表配置 */
    config: Object as any,
  },

  methods: {
    navigate(event): void {
      this.$route(event.currentTarget.dataset.url);
    },
  },
});
