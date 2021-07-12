import { $Component } from "@mptool/enhance";
import type { PropType } from "@mptool/enhance";
import type { TitleComponentConfig } from "../../../../typings";

$Component({
  properties: {
    /** 段落配置 */
    config: {
      type: Object as PropType<TitleComponentConfig>,
      required: true,
    },
  },
});
