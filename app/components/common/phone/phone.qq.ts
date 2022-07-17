import { $Component } from "@mptool/enhance";
import { tip } from "../../../utils/wx";

import type { PropType } from "@mptool/enhance";
import type { PhoneComponentOptions } from "../../../../typings";

$Component({
  properties: {
    /** 电话组件配置 */
    config: {
      type: Object as PropType<PhoneComponentOptions>,
      required: true,
    },
  },

  methods: {
    /** 拨打电话 */
    call(): void {
      wx.makePhoneCall({ phoneNumber: this.data.config.num });
    },

    copyContact() {
      wx.setClipboardData({
        data: this.data.config.num,
        success: () => {
          tip("号码已复制");
        },
      });
    },
  },

  options: {
    styleIsolation: "shared",
  },
});
