import { $Component } from "@mptool/enhance";
import type { PropType } from "@mptool/enhance";
import type { AppOption } from "../../../app";
import type { TitleComponentOptions } from "../../../../typings";

const { globalData } = getApp<AppOption>();

$Component({
  properties: {
    /** 段落配置 */
    config: {
      type: Object as PropType<TitleComponentOptions>,
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
