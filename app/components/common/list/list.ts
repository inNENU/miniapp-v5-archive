import $register = require("wxpage");
import { ListComponentConfig } from "../../../../typings";

$register.C<{ config: ListComponentConfig }>({
  properties: {
    /** 普通列表配置 */
    config: Object,
  },

  methods: {
    navigate({ currentTarget }: WechatMiniprogram.TouchEvent): void {
      this.$route(currentTarget.dataset.url);
    },
  },
});
