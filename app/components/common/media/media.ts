import $register = require("wxpage");
import { tip } from "../../../utils/wx";

$register.C({
  properties: {
    /** 媒体组件配置 */
    config: { type: Object },
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
      wx.reportMonitor("5", 1); // 调试
    },
  },
});
