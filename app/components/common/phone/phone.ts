import { $Component } from "@mptool/enhance";
import { tip } from "../../../utils/wx";

import type { PropType } from "@mptool/enhance";
import type { AppOption } from "../../../app";
import type { PhoneComponentOptions } from "../../../../typings";

const {
  globalData: { env },
} = getApp<AppOption>();

$Component({
  properties: {
    /** 电话组件配置 */
    config: {
      type: Object as PropType<PhoneComponentOptions>,
      required: true,
    },
  },

  data: { env },

  methods: {
    /** 拨打电话 */
    call(): void {
      wx.makePhoneCall({ phoneNumber: this.data.config.num });
    },

    /** 添加联系人 */
    addContact(): void {
      const { config } = this.data;

      wx.addPhoneContact({
        // 添加联系人
        firstName: config.fName,
        lastName: config.lName,
        mobilePhoneNumber: config.num,
        organization: config.org,
        workPhoneNumber: config.workNum,
        remark: config.remark,
        photoFilePath: config.avatar,
        nickName: config.nick,
        weChatNumber: config.wechat,
        addressState: config.province,
        addressCity: config.city,
        addressStreet: config.street,
        addressPostalCode: config.postCode,
        title: config.title,
        hostNumber: config.hostNum,
        email: config.mail,
        url: config.site,
        homePhoneNumber: config.homeNum,
      });
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
});
