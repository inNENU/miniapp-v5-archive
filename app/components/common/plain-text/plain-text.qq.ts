import { $Component } from "@mptool/enhance";
import type { PropType } from "@mptool/enhance";
import type { AppOption } from "../../../app";
import type { TextComponentOptions } from "../../../../typings";

const { globalData } = getApp<AppOption>();

$Component({
  properties: {
    /** 段落配置 */
    config: {
      type: Object as PropType<TextComponentOptions>,
      required: true,
    },
  },

  lifetimes: {
    attached() {
      const { selectable } = globalData;

      this.setData({ selectable });
    },
  },

  options: {
    styleIsolation: "shared",
  },
});
