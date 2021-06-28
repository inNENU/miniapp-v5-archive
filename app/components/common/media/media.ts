import { MediaComponentConfig } from "../../../../typings";
import { tip } from "../../../utils/wx";

Component<{ config: MediaComponentConfig }>({
  properties: {
    /** 媒体组件配置 */
    config: Object,
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
      // 调试
      wx.reportMonitor("5", 1);
    },
  },
});
