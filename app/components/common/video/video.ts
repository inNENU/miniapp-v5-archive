import { $Component } from "@mptool/enhance";
import { tip } from "../../../utils/api";

import type { PropType } from "@mptool/enhance";
import type { VideoComponentOptions } from "../../../../typings";

$Component({
  properties: {
    /** 媒体组件配置 */
    config: {
      type: Object as PropType<VideoComponentOptions>,
      required: true,
    },
  },

  methods: {
    /** 视频缓冲时提示用户等待 */
    wait(): void {
      tip("缓冲中..");
    },

    /** 正常播放时隐藏提示 */
    play(): void {
      wx.hideToast();
    },

    /** 提示用户加载出错 */
    error(): void {
      tip("视频加载出错");
      wx.reportEvent?.("resource_load_failed", {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        broken_url: this.data.config.src,
      });
    },
  },
});
