import { $Component } from "@mptool/enhance";
import type { PropType } from "@mptool/enhance";
import type { IntroComponentConfig } from "../../../../typings";

$Component({
  properties: {
    /** 介绍组件配置 */
    config: {
      type: Object as PropType<IntroComponentConfig>,
      required: true,
    },
  },
});
