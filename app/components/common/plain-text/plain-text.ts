import { $Component } from "@mptool/enhance";
import type { PropType } from "@mptool/enhance";
import type { TextComponentOptions } from "../../../../typings";

$Component({
  properties: {
    /** 段落配置 */
    config: {
      type: Object as PropType<TextComponentOptions>,
      required: true,
    },
  },
});
