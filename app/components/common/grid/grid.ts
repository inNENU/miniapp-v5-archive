import $register = require("wxpage");
import { GridComponentConfig } from "../../../../typings";

$register.C<{ config: GridComponentConfig }>({
  properties: {
    /** 网格组件配置 */
    config: { type: Object, value: { aim: "" } },
  },

  methods: {
    navigate({ currentTarget }: WechatMiniprogram.TouchEvent): void {
      this.$route(currentTarget.dataset.url);
    },
  },
});
